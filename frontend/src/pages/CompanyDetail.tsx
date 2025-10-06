import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import AuthPage from "./Auth";
import WriteReviewModal from "./WriteReview";

interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  size: string;
  overallRating: number;
  totalReviews: number;
  headquarters?: { city: string; country: string };
  coverImagen?: string;
  logo?: string;
  founded?: string;
  location?: string;
}

interface Review {
  _id: string;
  author?: {
    firstName?: string;
    lastName?: string;
    userType?: string;
    isVerified?: boolean;
  };
  overallRating?: number; // backend naming
  title?: string;
  jobTitle?: string;
  createdAt?: string;
  recommendation?: { wouldRecommend?: boolean };
  content?: string;
}

// Agrega la interfaz User si no la tienes ya
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isVerified: boolean;
}

interface RatingBucket { star: number; count: number; percent: number; }

const CompanyDetail: React.FC = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleGoToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleWriteReview = () => {
    setIsDropdownOpen(false);
    setShowWriteReview(true);
  };

  const handleLogout = () => setIsDropdownOpen(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch company and its recent reviews
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const load = async () => {
      setLoadingCompany(true);
      setCompanyError(null);
      try {
        const res = await axios.get(`${API_URL}/companies/${slug}`, { signal: controller.signal });
        if (res.data?.success && res.data.data?.company) {
          setCompany(res.data.data.company);
          setRecentReviews(res.data.data.recentReviews || []);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        setCompany(null);
        setCompanyError('Error cargando la empresa');
        setNotFound(true);
      } finally {
        setLoadingCompany(false);
      }
    };
    load();
    return () => controller.abort();
  }, [slug, API_URL]);

  // Fetch paginated reviews (beyond recent) for distribution and listing
  const fetchReviews = useCallback(async (page: number) => {
    if (!slug) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res = await axios.get(`${API_URL}/companies/${slug}/reviews`, {
        params: { page, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
      });
      if (res.data?.success) {
        const data = res.data.data;
        setAllReviews(prev => page === 1 ? data.reviews : [...prev, ...data.reviews]);
        setReviewsTotal(data.pagination.total);
      } else {
        setReviewsError('No se pudieron cargar las reseñas');
      }
    } catch (err) {
      setReviewsError('Error de red al cargar reseñas');
    } finally {
      setReviewsLoading(false);
    }
  }, [slug, API_URL]);

  useEffect(() => {
    setAllReviews([]);
    setReviewsPage(1);
    if (slug) fetchReviews(1);
  }, [slug, fetchReviews]);

  const handleLoadMoreReviews = () => {
    const next = reviewsPage + 1;
    setReviewsPage(next);
    fetchReviews(next);
  };

  // Combined reviews for distribution (prefer allReviews, fallback to recent)
  const reviewsForStats = allReviews.length ? allReviews : recentReviews;

  const ratingDistribution: RatingBucket[] = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsForStats.forEach(r => {
      const val = r.overallRating;
      if (val && val >= 1 && val <= 5) buckets[val] += 1;
    });
    const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 0;
    return (Object.entries(buckets)
      .sort((a,b) => Number(b[0]) - Number(a[0])) as [string, number][]) // ensure 5..1
      .map(([star, count]) => ({
        star: Number(star),
        count,
        percent: total ? Math.round((count / total) * 100) : 0
      }));
  }, [reviewsForStats]);

  // Average y total estrictamente basados en las reviews aprobadas cargadas
  const { averageRating, totalApproved } = useMemo(() => {
    if (!reviewsForStats.length) return { averageRating: 0, totalApproved: 0 };
    const sum = reviewsForStats.reduce((acc, r) => acc + (r.overallRating || 0), 0);
    return {
      averageRating: Number((sum / reviewsForStats.length).toFixed(1)),
      totalApproved: reviewsForStats.length
    };
  }, [reviewsForStats]);

  // Agrega este useEffect para cargar el usuario desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleAuthSuccess = (userData: User, token: string) => {
    setUser(userData);
    setShowAuth(false);
    // Puedes guardar el usuario y token si lo necesitas:
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  if (loadingCompany) return (
    <div className="p-10 animate-pulse space-y-8">
      <div className="flex items-start gap-6">
        <div className="w-40 h-40 bg-slate-200 rounded-xl" />
        <div className="flex-1 space-y-4">
          <div className="h-6 w-1/3 bg-slate-200 rounded" />
          <div className="h-4 w-2/5 bg-slate-200 rounded" />
          <div className="h-4 w-1/4 bg-slate-200 rounded" />
          <div className="flex gap-4 pt-2">
            <div className="h-8 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-24 bg-slate-200 rounded" />
        <div className="grid grid-cols-[60px_1fr_40px] gap-y-3 items-center max-w-md">
          {[...Array(5)].map((_,i) => (
            <React.Fragment key={i}>
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div className="h-2 w-full bg-slate-200 rounded" />
              <div className="h-4 w-8 bg-slate-200 rounded" />
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_,i) => (
          <div key={i} className="space-y-3 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-10 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-2/3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
  if (notFound) return <div className="p-10 text-red-600">Empresa no encontrada.</div>;
  if (companyError) return <div className="p-10 text-red-600">{companyError}</div>;
  if (!company) return null;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      {/* HEADER INTEGRADO */}
       <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">TalentTrace</h2>
            </div>
            <div className="flex items-center gap-9">
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/">Inicio</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Reseñas</a>
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/companies">Empresas</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Experiencias</a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="text-slate-700 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-200">
                        <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleGoToProfile}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mi Perfil
                      </button>
                      <button
                        onClick={handleWriteReview}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Escribir Experiencia
                      </button>
                      <div className="border-t border-slate-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
              >
                <span className="truncate">Iniciar Sesión</span>
              </button>
            )}
          </div>
        </header>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
            <div className="flex gap-4 items-center">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg min-h-32 w-32"
                style={{ backgroundImage: `url("${company.coverImagen || company.logo || ""}")` }}
              ></div>
              <div className="flex flex-col gap-1">
                <p className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em]">{company.name}</p>
                <p className="text-[#49739c] text-base font-normal leading-normal">
                  {company.industry}
                  {company.size && ` | ${company.size} empleados`}
                  {company.founded && ` | Fundada ${company.founded}`}
                </p>
                {(company.headquarters?.city || company.headquarters?.country) && (
                  <p className="text-[#49739c] text-base font-normal leading-normal">
                    {company.headquarters?.city}{company.headquarters?.city && company.headquarters?.country ? ', ' : ''}{company.headquarters?.country}
                  </p>
                )}
              </div>
            </div>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[120px] md:w-auto"
            >
              <span className="truncate">Follow</span>
            </button>
          </div>
          <div className="pb-3">
            <div className="flex border-b border-[#cedbe8] px-4 gap-8">
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
              </a>
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#0d80f2] text-[#0d141c] pb-[13px] pt-4" href="#">
                <p className="text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">Reviews</p>
              </a>
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
                <p className="text-[#49739c] text-sm font-bold leading-normal tracking-[0.015em]">FAQs</p>
              </a>
              <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
                <p className="text-[#49739c] text-sm font-bold leading-normal tracking-[0.015em]">About</p>
              </a>
            </div>
          </div>
          {/* Aquí puedes agregar reviews, gráficos, etc. */}
          <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Reviews</h2>
          <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
            {/* Overrating y barras */}
            <div className="flex flex-col gap-2">
              <p className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">{averageRating}</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={i < Math.round(averageRating) ? "text-[#0d80f2]" : "text-[#cedbe8]"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-[#0d141c] text-base font-normal leading-normal">{totalApproved} reviews</p>
            </div>
            <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
              {ratingDistribution.map(item => (
                <React.Fragment key={item.star}>
                  <p className="text-[#0d141c] text-sm font-normal leading-normal">{item.star}</p>
                  <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#cedbe8]">
                    <div className="rounded-full bg-[#0d80f2] transition-all" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <p className="text-[#49739c] text-sm font-normal leading-normal text-right">{item.percent}%</p>
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Reviews dinámicas */}
          <div className="flex flex-col gap-6 overflow-x-hidden bg-slate-50 p-4">
            {recentReviews.length === 0 && reviewsLoading && <p className="text-[#49739c]">Cargando reseñas...</p>}
            {reviewsError && <p className="text-red-600">{reviewsError}</p>}
            {(allReviews.length ? allReviews : recentReviews).map(r => (
              <ReviewCard key={r._id} review={r} />
            ))}
            { (allReviews.length < reviewsTotal) && !reviewsLoading && (
              <button onClick={handleLoadMoreReviews} className="self-center px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">Cargar más reseñas</button>
            )}
            {reviewsLoading && allReviews.length > 0 && <p className="text-[#49739c] text-center text-sm">Cargando más...</p>}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthPage
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteReview}
        onClose={() => setShowWriteReview(false)}
        user={user}
      />
    </div>
  );
};

export default CompanyDetail;

// Componente de tarjeta de reseña con truncado de contenido
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX = 260;
  const body = review.content || '';
  const isLong = body.length > MAX;
  const display = expanded || !isLong ? body : body.slice(0, MAX) + '…';

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
          {(review.author?.firstName?.[0] || '') + (review.author?.lastName?.[0] || '') || 'U'}
        </div>
        <div className="flex-1">
          <p className="text-[#0d141c] text-sm font-semibold leading-normal">{review.author?.firstName || ''} {review.author?.lastName || ''}</p>
          <p className="text-[#49739c] text-[11px] leading-normal">{review.jobTitle || 'Empleado'} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#0d80f2] text-sm font-semibold">{review.overallRating?.toFixed(1) || '—'}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" className={i < (review.overallRating || 0) ? 'text-[#0d80f2]' : 'text-[#cedbe8]'} fill="currentColor"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"/></svg>
            ))}
          </div>
        </div>
      </div>
      {review.title && <h3 className="text-sm font-semibold text-slate-800">{review.title}</h3>}
      {body && (
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {display}
          {isLong && (
            <button onClick={() => setExpanded(e => !e)} className="ml-1 text-blue-600 hover:underline text-xs font-medium">{expanded ? 'Ver menos' : 'Ver más'}</button>
          )}
        </p>
      )}
      <div className="flex gap-2 text-xs text-[#49739c]">
        {review.recommendation?.wouldRecommend && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Recomienda</span>}
      </div>
    </div>
  );
};