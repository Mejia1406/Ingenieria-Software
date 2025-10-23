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
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  totalVotes?: number;
  userVote?: 'helpful' | 'unhelpful' | null;
  isVisible?: boolean;
  moderationStatus?: string;
  recruiterResponse?: {
    responder?: {
      firstName?: string;
      lastName?: string;
      userType?: string;
    };
    content: string;
    createdAt: string;
    updatedAt?: string;
  }
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  // Lista completa de reviews aprobadas (sin filtrar por estrellas)
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  // Filtro de rating seleccionado (1-5) o null para todos
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'about'>('reviews');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleGoToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleGoToAdmin = () => {
    setIsDropdownOpen(false);
    navigate('/admin');
  };

  const handleWriteReview = () => {
    setIsDropdownOpen(false);
    setShowWriteReview(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
  };

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
  const fetchReviews = useCallback(async (_page: number) => {
    if (!company?._id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/reviews/company/${company._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (res.data?.success) {
        const list: Review[] = res.data.data;
        setAllReviews(list); // guardamos lista completa, filtramos después
        setReviewsTotal(list.length);
      } else {
        setReviewsError('No se pudieron cargar las reseñas');
      }
    } catch (err) {
      setReviewsError('Error de red al cargar reseñas');
    } finally {
      setReviewsLoading(false);
    }
  }, [company?._id, API_URL]);

  useEffect(() => {
    // Reinicia la paginación cuando cambia el slug o el filtro de rating
    setAllReviews([]);
    setReviewsPage(1);
    if (slug) fetchReviews(1);
  }, [slug, ratingFilter, fetchReviews]);

  const handleLoadMoreReviews = () => {
    const next = reviewsPage + 1;
    setReviewsPage(next);
    fetchReviews(next);
  };

  // Combined reviews for distribution (prefer allReviews, fallback to recent)
  const reviewsForStats = allReviews.length ? allReviews : recentReviews; // siempre sin filtrar

  // Reviews filtradas por estrellas (solo para visualización)
  const filteredByRating = useMemo(() => {
    if (ratingFilter == null) return allReviews;
    return allReviews.filter(r => r.overallRating === ratingFilter);
  }, [allReviews, ratingFilter]);

  const displayedReviews = ratingFilter != null
    ? filteredByRating
    : (allReviews.length ? allReviews : recentReviews);

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

  const toggleFollow = () => {
    // simple local toggle (reverted behavior)
    setIsFollowing(prev => !prev);
  };

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
  <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/50 px-6 lg:px-10 py-3 sticky top-0 z-40">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-3 text-slate-900">
        <div className="size-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-slate-900 text-xl font-extrabold leading-tight tracking-[-0.02em]">TalentTrace</h1>
      </div>
      <nav className="hidden md:flex items-center gap-6 xl:gap-8 text-sm font-medium anim-fade-in anim-delay-2">
        <Link className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-2" to="/">Inicio</Link>
        <Link className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-3" to="/foro">Foro</Link>
        <Link className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-4" to="/companies">Empresas</Link>
      </nav>
    </div>
    <div className="flex flex-1 justify-end gap-8">
      {user ? (
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="group flex items-center gap-2 rounded-full pl-1 pr-3 py-1.5 border border-transparent hover:border-slate-200 bg-white/60 backdrop-blur hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white/70">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </div>
              <span className="text-slate-700 font-medium max-w-[140px] truncate text-sm">
                {user.firstName} {user.lastName}
              </span>
              <svg 
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right animate-[scaleIn_120ms_ease-out] rounded-xl border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 ring-1 ring-black/5 p-2 z-50">
                <div className="px-3 pt-2 pb-3 border-b border-slate-200/70">
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[11px] font-bold shadow-sm">{user.firstName[0]}{user.lastName[0]}</span>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] mt-0.5 tracking-wide font-medium text-slate-500 uppercase">{user.email}</p>
                </div>
                <div className="py-1 flex flex-col gap-0.5">
                  <button
                    onClick={handleGoToProfile}
                    className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </button>
                  {user?.userType === 'admin' && (
                    <button
                      onClick={handleGoToAdmin}
                      className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 active:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h2l2 7h10l2-7h2M5 13l4-8h6l4 8M9 5V3h6v2" />
                      </svg>
                      Panel Admin
                    </button>
                  )}
                </div>
                <div className="mt-1 pt-1 border-t border-slate-200/70">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50/80 rounded-lg flex items-center gap-2 transition-colors"
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuth(true)}
            className="flex min-w-[84px] max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
          >
            <span className="truncate">Iniciar Sesión</span>
          </button>
        </div>
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
                {/* Botón Analytics para recruiter asociado a esta empresa */}
                {user && user.userType === 'recruiter' && (user as any).recruiterInfo?.companyId === company._id && (
                  <button
                    onClick={() => navigate('/recruiter/analytics')}
                    className="mt-2 inline-flex items-center gap-1 self-start rounded-md border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.25 3a17 17 0 000 18"/><path d="M12.75 3a17 17 0 010 18"/></svg>
                    Ver Analytics
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={toggleFollow}
                className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[140px] md:w-auto transition-colors ${isFollowing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#e7edf4] text-[#0d141c] hover:bg-slate-200'}`}
              >
                <span className="truncate">{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
              </button>
            </div>
          </div>
          <div className="pb-3">
            <div className="flex border-b border-[#cedbe8] px-4 gap-6">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${activeTab==='reviews' ? 'border-b-[#0d80f2] text-[#0d141c]' : 'border-b-transparent text-[#49739c] hover:text-[#0d141c]'}`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">Reviews</p>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${activeTab==='about' ? 'border-b-[#0d80f2] text-[#0d141c]' : 'border-b-transparent text-[#49739c] hover:text-[#0d141c]'}`}
              >
                <p className="text-sm font-bold leading-normal tracking-[0.015em]">About</p>
              </button>
              
            </div>
          </div>
          {activeTab === 'reviews' && (
          <>
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
            {/* Filtros por estrellas */}
            <div className="flex flex-col gap-2 min-w-[160px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filtrar por estrellas</p>
              <div className="flex flex-wrap gap-2">
                {[5,4,3,2,1].map(star => {
                  const active = ratingFilter === star;
                  const bucket = ratingDistribution.find(b => b.star === star);
                  return (
                    <button
                      key={star}
                      onClick={() => setRatingFilter(prev => prev === star ? null : star)}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'}`}
                    >
                      <span>{star}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 256 256" fill="currentColor" className={active ? 'text-white' : 'text-yellow-500'}><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"/></svg>
                      <span className="text-[10px] text-slate-500 font-normal">{bucket?.count ?? 0}</span>
                    </button>
                  );
                })}
              </div>
              {ratingFilter && (
                <button
                  onClick={() => setRatingFilter(null)}
                  className="self-start text-xs text-blue-600 hover:underline font-medium"
                >Quitar filtro</button>
              )}
            </div>
          </div>
          {/* Reviews dinámicas */}
          <div className="flex flex-col gap-6 overflow-x-hidden bg-slate-50 p-4">
            {recentReviews.length === 0 && reviewsLoading && <p className="text-[#49739c]">Cargando reseñas...</p>}
            {reviewsError && <p className="text-red-600">{reviewsError}</p>}
            {displayedReviews.map(r => (
              <ReviewCard
                key={r._id}
                review={r}
                onVoted={updated => {
                  setAllReviews(prev => prev.map(item => item._id === updated._id ? updated : item));
                }}
                user={user}
              />
            ))}
            {ratingFilter != null && !reviewsLoading && displayedReviews.length === 0 && (
              <p className="text-sm text-slate-500">No hay reseñas con {ratingFilter} estrellas.</p>
            )}
            {reviewsLoading && <p className="text-[#49739c] text-center text-sm">Cargando...</p>}
          </div>
          </>
          )}
          {activeTab === 'about' && (
            <div className="p-6 flex flex-col gap-4">
              <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em]">Sobre la empresa</h2>
              {company.description && (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{company.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {company.industry && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide">Industria</p>
                    <p className="text-slate-800 font-medium">{company.industry}</p>
                  </div>
                )}
                {company.size && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide">Tamaño</p>
                    <p className="text-slate-800 font-medium">{company.size} empleados</p>
                  </div>
                )}
                {company.founded && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide">Fundada</p>
                    <p className="text-slate-800 font-medium">{company.founded}</p>
                  </div>
                )}
                {(company.headquarters?.city || company.headquarters?.country) && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide">Sede</p>
                    <p className="text-slate-800 font-medium">{company.headquarters?.city}{company.headquarters?.city && company.headquarters?.country ? ', ' : ''}{company.headquarters?.country}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
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
const ReviewCard: React.FC<{ review: Review; onVoted: (r: Review)=>void; user: User | null }> = ({ review, onVoted, user }) => {
  const [expanded, setExpanded] = useState(false);
  const [localReview, setLocalReview] = useState(review);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [editingReply, setEditingReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [savingReply, setSavingReply] = useState(false);
  useEffect(()=>{ setLocalReview(review); }, [review]);
  const MAX = 260;
  const body = localReview.content || '';
  const isLong = body.length > MAX;
  const display = expanded || !isLong ? body : body.slice(0, MAX) + '…';

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const voting = useRef(false);

  const handleVote = async (value: 'helpful' | 'unhelpful') => {
    if (!user) return; // Podrías abrir modal de login aquí
    if (voting.current) return;
    if (localReview.userVote === value) return; // idempotente en UI
    voting.current = true;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/reviews/${localReview._id}/vote`, { value }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (res.data?.success) {
        const { helpfulVotes, unhelpfulVotes, totalVotes, userVote } = res.data.data;
        const updated: Review = { ...localReview, helpfulVotes, unhelpfulVotes, totalVotes, userVote };
        setLocalReview(updated);
        onVoted(updated);
      }
    } catch (err) {
      // Manejo simple de error
    } finally {
      voting.current = false;
    }
  };

  const resetReportForm = () => {
    setReportReason('');
    setReportDetails('');
  };

  const handleOpenReport = () => {
    if (!user) return; // Podrías abrir modal login
    resetReportForm();
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/reviews/${localReview._id}/report`, { reason: reportReason, details: reportDetails || undefined }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      setReported(true);
      setShowReportModal(false);
    } catch (err) {
      // Podrías mostrar toast
    } finally {
      setReportSubmitting(false);
    }
  };

  // Reply logic
  const canReply = !!user && (user.userType === 'admin' || user.userType === 'recruiter');
  const startReply = () => {
    if (!canReply) return;
    setReplyError(null);
    setReplyDraft(localReview.recruiterResponse?.content || '');
    setEditingReply(true);
  };

  const cancelReply = () => {
    setEditingReply(false);
    setReplyDraft('');
    setReplyError(null);
  };

  const saveReply = async () => {
    if (!replyDraft.trim()) {
      setReplyError('El contenido es requerido');
      return;
    }
    if (replyDraft.trim().length < 5) {
      setReplyError('Debe tener al menos 5 caracteres');
      return;
    }
    if (replyDraft.length > 2000) {
      setReplyError('Máximo 2000 caracteres');
      return;
    }
    try {
      setSavingReply(true);
      setReplyError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setReplyError('No autenticado');
        setSavingReply(false);
        return;
      }
      const res = await axios.post(`${API_URL}/reviews/${localReview._id}/reply`, { content: replyDraft.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        const updated: Review = res.data.data.review;
        setLocalReview(updated);
        onVoted(updated); // reutilizamos callback para propagar cambios
        setEditingReply(false);
      } else {
        setReplyError(res.data?.message || 'Error guardando respuesta');
      }
    } catch (err:any) {
      setReplyError(err.response?.data?.message || 'Error de red');
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
          {(localReview.author?.firstName?.[0] || '') + (localReview.author?.lastName?.[0] || '') || 'U'}
        </div>
        <div className="flex-1">
          <p className="text-[#0d141c] text-sm font-semibold leading-normal">{localReview.author?.firstName || ''} {localReview.author?.lastName || ''}</p>
          <p className="text-[#49739c] text-[11px] leading-normal">{localReview.jobTitle || 'Empleado'} · {localReview.createdAt ? new Date(localReview.createdAt).toLocaleDateString() : ''}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#0d80f2] text-sm font-semibold">{localReview.overallRating?.toFixed(1) || '—'}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" className={i < (localReview.overallRating || 0) ? 'text-[#0d80f2]' : 'text-[#cedbe8]'} fill="currentColor"><path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"/></svg>
            ))}
          </div>
        </div>
      </div>
      {reported ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-medium">
          Has reportado esta reseña. Quedará oculta hasta revisión del equipo de moderación.
        </div>
      ) : (
        <>
          {localReview.title && <h3 className="text-sm font-semibold text-slate-800">{localReview.title}</h3>}
          {body && (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {display}
              {isLong && (
                <button onClick={() => setExpanded(e => !e)} className="ml-1 text-blue-600 hover:underline text-xs font-medium">{expanded ? 'Ver menos' : 'Ver más'}</button>
              )}
            </p>
          )}
        </>
      )}
      <div className="flex gap-2 text-xs text-[#49739c]">
        {localReview.recommendation?.wouldRecommend && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Recomienda</span>}
      </div>
      {/* Voting controls */}
      <div className="flex items-center gap-4 pt-1">
        <button
          disabled={!user || localReview.userVote === 'helpful'}
          onClick={() => handleVote('helpful')}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border transition-colors ${localReview.userVote === 'helpful' ? 'bg-blue-600 border-blue-600 text-white cursor-default' : 'border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M5 9h14l-1 9a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4L5 9Z"/></svg>
          Útil {typeof localReview.helpfulVotes === 'number' && <span className="font-semibold">{localReview.helpfulVotes}</span>}
        </button>
        <button
          disabled={!user || localReview.userVote === 'unhelpful'}
          onClick={() => handleVote('unhelpful')}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border transition-colors ${localReview.userVote === 'unhelpful' ? 'bg-red-600 border-red-600 text-white cursor-default' : 'border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-600'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 6 0v-4"/><path d="M19 15H5l1-9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4l1 9Z"/></svg>
          No útil {typeof localReview.unhelpfulVotes === 'number' && <span className="font-semibold">{localReview.unhelpfulVotes}</span>}
        </button>
        <span className="text-[11px] text-slate-500">{(localReview.helpfulVotes || 0)} de {( (localReview.helpfulVotes || 0) + (localReview.unhelpfulVotes || 0) )} lo consideraron útil</span>
        <div className="ml-auto">
          <button
            disabled={!user || reported}
            onClick={handleOpenReport}
            className={`text-xs font-medium px-2 py-1 rounded border transition-colors flex items-center gap-1 ${reported ? 'border-amber-300 bg-amber-100 text-amber-600 cursor-default' : 'border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-600'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l5-5 5 5"/></svg>
            {reported ? 'Reportado' : 'Reportar'}
          </button>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !reportSubmitting && setShowReportModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-lg border border-slate-200 p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Reportar reseña</h4>
              <button onClick={() => !reportSubmitting && setShowReportModal(false)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">Selecciona el motivo que mejor describa por qué consideras que este contenido es inapropiado.</p>
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
              {[
                { value: 'spam', label: 'Spam o publicidad' },
                { value: 'ofensivo', label: 'Lenguaje ofensivo' },
                { value: 'discriminacion', label: 'Contenido discriminatorio' },
                { value: 'informacion_privada', label: 'Divulgación de información privada' },
                { value: 'engano', label: 'Información engañosa' },
                { value: 'otro', label: 'Otro' }
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 rounded border px-3 py-2 cursor-pointer text-xs ${reportReason === opt.value ? 'border-blue-600 bg-blue-50 text-slate-800' : 'border-slate-300 hover:border-blue-400 text-slate-600'}`}> 
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.value}
                    checked={reportReason === opt.value}
                    onChange={() => setReportReason(opt.value)}
                    className="accent-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {reportReason && (
              <div className="flex flex-col gap-1">
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  maxLength={1000}
                  placeholder="Detalles adicionales (opcional)"
                  className="w-full h-24 text-xs rounded border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none p-2"
                />
                <p className="text-[10px] text-slate-400 ml-auto">{reportDetails.length}/1000</p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={reportSubmitting}
                onClick={() => setShowReportModal(false)}
                className="text-xs font-medium px-3 py-2 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >Cancelar</button>
              <button
                disabled={!reportReason || reportSubmitting}
                onClick={handleSubmitReport}
                className={`text-xs font-semibold px-4 py-2 rounded text-white transition-colors ${(!reportReason || reportSubmitting) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >{reportSubmitting ? 'Enviando...' : 'Enviar reporte'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Recruiter Response Block */}
      <div className="mt-2">
        {localReview.recruiterResponse && !editingReply && (
          <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Respuesta de la empresa</span>
              {canReply && (
                <button onClick={startReply} className="text-[10px] text-blue-600 hover:underline font-medium">Editar</button>
              )}
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{localReview.recruiterResponse.content}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              {localReview.recruiterResponse.updatedAt ? 'Actualizada ' + new Date(localReview.recruiterResponse.updatedAt).toLocaleString() : 'Publicada ' + new Date(localReview.recruiterResponse.createdAt).toLocaleString()}
              {localReview.recruiterResponse.responder && ' · ' + (localReview.recruiterResponse.responder.firstName || '') + ' ' + (localReview.recruiterResponse.responder.lastName || '')}
            </p>
          </div>
        )}

        {canReply && !localReview.recruiterResponse && !editingReply && (
          <button onClick={startReply} className="mt-2 text-[11px] text-blue-600 hover:underline font-medium">Responder como empresa</button>
        )}

        {editingReply && (
          <div className="mt-3 rounded border border-blue-300 bg-white p-3 flex flex-col gap-2">
            <textarea
              value={replyDraft}
              onChange={e => setReplyDraft(e.target.value)}
              className="w-full h-28 text-xs rounded border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none p-2"
              placeholder="Escribe la respuesta (5-2000 caracteres)"
              maxLength={2000}
              disabled={savingReply}
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{replyDraft.length}/2000</span>
              {replyError && <span className="text-red-500">{replyError}</span>}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={cancelReply} disabled={savingReply} className="text-[11px] px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
              <button onClick={saveReply} disabled={savingReply} className={`text-[11px] px-4 py-1 rounded font-semibold text-white ${savingReply ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}>{savingReply ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};