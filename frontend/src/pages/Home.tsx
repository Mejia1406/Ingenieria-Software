import React, { useState, useEffect, useRef } from 'react'; // Esto lo que hace es importar React y algunos hooks necesarios (los hooks son funciones)
    import { Link, useNavigate } from "react-router-dom"; // Esto importa componentes y hooks de react-router-dom para manejar la navegación
    import WriteReviewModal from "./WriteReview"; // Esto importa el componente WriteReviewModal desde otro archivo
    import AuthPage from './Auth'; // Esto importa el componente AuthPage
    import axios from 'axios'; // el axios es una librería para hacer solicitudes HTTP desde el navegador

    interface User { // esta es lainterfaz que define la forma de un objeto de usuario
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        userType: string;
        isVerified: boolean;
    }

    interface ReviewFormData { // la interfaz que define la forma de los datos del formulario de reseña
    companyName: string;
    jobTitle: string;
    outcome: string;
    overallRating: number;
    interviewDifficulty: number;
    processTransparency: number;
    reviewText: string;
    pros: string;
    cons: string;
    advice: string;
    recommendToFriend: boolean;
    employmentStatus: 'current' | 'former' | 'candidate';
    department: string;
    location: string;
    salary: string;
    }

    interface Company { // la interfaz que define la forma de un objeto de empresa
  _id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  overallRating: number;
  totalReviews: number;
  logo?: string;
  headquarters?: {
    city: string;
    country: string;
  };
}

    

    const HomePage: React.FC = () => { 
        const [showAuth, setShowAuth] = useState(false); // esto muestra o no la interfaz de inicio de sesión
        const [showWriteReview, setShowWriteReview] = useState(false); // esto controla si se muestra o no la interfaz de escribir reseña
        const [user, setUser] = useState<User | null>(null); // aquí se guarda la información del usuario que ha iniciado sesión
        const [searchQuery, setSearchQuery] = useState(''); // texto de búsqueda en el campo de búsqueda
        const [isDropdownOpen, setIsDropdownOpen] = useState(false); // estado del menú desplegable del usuario(o sea ese avatar que esta arriba a la derecha)
        // Notificaciones
        type NotificationItem = {
            _id: string;
            type: 'review_reply';
            message: string;
            createdAt: string;
            readAt?: string;
            review?: {_id: string};
            company?: { name?: string; slug?: string } | string;
        };
        const [notifications, setNotifications] = useState<NotificationItem[]>([]);
        const [notifOpen, setNotifOpen] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]); // aquí se guarda la lista de empresas obtenidas de la base de datos
    const [loading, setLoading] = useState(true); // ps esto es un estado de carga mientras se obtienen las empresas
    const [companiesError, setCompaniesError] = useState<string | null>(null); // para mostrar error si no cargan
        const dropdownRef = useRef<HTMLDivElement>(null); // esto detecta si se hace clic fuera del menú desplegable para cerrarlo
        const navigate = useNavigate(); // esto hace que se pueda navegar entre las páginas
    const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-2025.vercel.app/api'; // esta es la URL de la API del backend para hacer solicitudes 

        useEffect(() => { 
            const token = localStorage.getItem('token'); // aquí se obtiene el token del usuario(el token es como una llave secreta que confirma que el usuario ha iniciado sesión que se crea al iniciar sesión)
            const userData = localStorage.getItem('user'); // aquí se obtiene la información del usuario

            if (token && userData) { // si hay token e información del usuario, se establece el estado del usuario
                try {
                    setUser(JSON.parse(userData)); // se analiza la información del usuario que está en formato JSON y se guarda en el estado(el estado se refiere a los datos que cambian y afectan lo que se muestra en la interfaz)
                } catch (error) { // si hay un error al analizar la información del usuario, se elimina el token y la información del usuario
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        }, []); // esos dos corchetes hacen que ese useEffect solo se ejecute una vez, si eso no estuviera ahi se ejecutaría cada vez que el estado cambia y eso no es lo que queremos ya que solo necesitamos verificar si el usuario ha iniciado sesión una vez cuando se carga la página

        // Cargar notificaciones cuando hay usuario
        useEffect(() => {
            const fetchNotifications = async () => {
                if (!user) { setNotifications([]); return; }
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/notifications?unread=false&limit=10`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                        timeout: 6000
                    });
                    const list = res.data?.data?.notifications ?? [];
                    if (Array.isArray(list)) setNotifications(list);
                } catch (e) {
                    // silencioso
                }
            };
            fetchNotifications();
            // refresco ligero cada 60s cuando el dropdown está abierto
            const id = window.setInterval(() => { if (notifOpen) fetchNotifications(); }, 60000);
            return () => window.clearInterval(id);
        }, [user, API_URL, notifOpen]);

        const unreadCount = notifications.filter(n=>!n.readAt).length;
        const markRead = async (id: string) => {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/notifications/${id}/read`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                setNotifications(prev => prev.map(n=> n._id===id ? { ...n, readAt: new Date().toISOString() } : n));
            } catch {}
        };
        const markAllRead = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/notifications/mark-all-read`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                setNotifications(prev => prev.map(n=> ({ ...n, readAt: new Date().toISOString() })));
            } catch {}
        };

        /* Todo este useEffect funciona asi: primero se detecta que es un click fuera del menu desplegable gracias a el dropdownRef 
        ya que ese dropdownRef esta colocado en el div que tiene ese menu.
        Despues ese event: MouseEvent se encarga de detectar el evento de click en cualquier parte de la pantalla
        y el dropwdownref.current && !dropdownRef.current.contains(event.target as Node) verifica que el click no haya sido dentro del menu desplegable
        y el setIsDropdownOpen(false) cierra el menu desplegable si se cumple esa condicion
        */
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => { 
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        // Silent refresh on tab focus/visibility: intenta actualizar datos sin limpiar la UI
        useEffect(() => {
            const silentRefresh = async () => {
                try {
                    const res = await axios.get(`${API_URL}/companies`, { timeout: 6000 });
                    const list = res.data?.data?.companies ?? res.data?.companies ?? [];
                    if (Array.isArray(list) && list.length > 0) {
                        setCompanies(list);
                        try { sessionStorage.setItem('tt_companies_cache', JSON.stringify({ ts: Date.now(), companies: list })); } catch {}
                    }
                } catch {}
            };
            const onFocus = () => { if (document.visibilityState === 'visible') silentRefresh(); };
            window.addEventListener('focus', onFocus);
            document.addEventListener('visibilitychange', onFocus);
            return () => {
                window.removeEventListener('focus', onFocus);
                document.removeEventListener('visibilitychange', onFocus);
            };
        }, [API_URL]);

        
        useEffect(() => {
            const loadFromCache = () => {
                try {
                    const cached = sessionStorage.getItem('tt_companies_cache');
                    if (cached) {
                        const parsed = JSON.parse(cached) as { ts: number; companies: Company[] };
                        // considera válido 10 minutos
                        if (Date.now() - parsed.ts < 10 * 60 * 1000 && Array.isArray(parsed.companies)) {
                            setCompanies(parsed.companies);
                            setLoading(false);
                            return true;
                        }
                    }
                } catch {}
                return false;
            };

            const saveToCache = (companies: Company[]) => {
                try {
                    sessionStorage.setItem('tt_companies_cache', JSON.stringify({ ts: Date.now(), companies }));
                } catch {}
            };

            const fetchWithRetry = async (retries = 2, delayMs = 800) => {
                setLoading(true);
                setCompaniesError(null);
                for (let attempt = 0; attempt <= retries; attempt++) {
                    try {
                        const url = `${API_URL}/companies`;
                        console.log('[Home] Fetch companies attempt', attempt + 1, url);
                        const response = await axios.get(url, { timeout: 8000 });
                        const list = response.data?.data?.companies ?? response.data?.companies ?? [];
                        if (Array.isArray(list)) {
                            setCompanies(list);
                            saveToCache(list);
                            return;
                        }
                        throw new Error('Formato inesperado de /companies');
                    } catch (err: any) {
                        console.warn('[Home] Error fetching companies (attempt', attempt + 1, '):', err?.message || err);
                        if (attempt < retries) {
                            await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
                            continue;
                        }
                        setCompaniesError('No se pudieron cargar las empresas. Intentaremos de nuevo más tarde.');
                        // mantener últimos datos buenos; no limpiar UI si falla
                        loadFromCache();
                    } finally {
                        setLoading(false);
                    }
                }
            };

            // intentar cargar desde cache primero para que la UI no “desaparezca”
            const hadCache = loadFromCache();
            fetchWithRetry(hadCache ? 1 : 2);
        }, [API_URL]);

        const handleAuthSuccess = (userData: User, token: string) => {
            setUser(userData);
            setShowAuth(false);
        };

        const handleLogout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsDropdownOpen(false);
        };

        const handleGoToProfile = () => {
            navigate('/profile');
            setIsDropdownOpen(false);
        };

        const handleGoToAdmin = () => {
            navigate('/admin');
            setIsDropdownOpen(false);
        };

        const toggleDropdown = () => {
            setIsDropdownOpen(!isDropdownOpen);
        };

        const handleSearch = (e: React.FormEvent) => {
            e.preventDefault();
            if (searchQuery.trim()) {
                navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
            }
        };

        const handleWriteReview = () => {
            if (user) {
                setShowWriteReview(true);
                setIsDropdownOpen(false);
            } else {
                setShowAuth(true);
            }
        };

        // Hero slideshow logic
        const heroImages = useRef<string[]>([
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=70',
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=70',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=70',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=70'
        ]);
        const [activeSlide, setActiveSlide] = useState(0);
        const slideIntervalRef = useRef<number | null>(null);

        useEffect(() => {
            const next = () => {
                setActiveSlide(prev => (prev + 1) % heroImages.current.length);
            };
            slideIntervalRef.current = window.setInterval(next, 5500);
            return () => { if (slideIntervalRef.current) window.clearInterval(slideIntervalRef.current); };
        }, []);

        const goToSlide = (index: number) => {
            setActiveSlide(index);
            if (slideIntervalRef.current) window.clearInterval(slideIntervalRef.current);
            slideIntervalRef.current = window.setInterval(() => {
                setActiveSlide(prev => (prev + 1) % heroImages.current.length);
            }, 5500);
        };

        // Compute top companies (highest rating then reviews) for featured section
        const topCompanies = React.useMemo(() => {
            if (!companies || companies.length === 0) return [] as Company[];
            return [...companies]
                .filter(c => typeof c.overallRating === 'number')
                .sort((a, b) => {
                    const ratingDiff = (b.overallRating || 0) - (a.overallRating || 0);
                    if (ratingDiff !== 0) return ratingDiff;
                    return (b.totalReviews || 0) - (a.totalReviews || 0);
                })
                .slice(0, 3);
        }, [companies]);

        const formatReviews = (n: number) => `${n} reseña${n === 1 ? '' : 's'}`;

        // Recent reviews state
        interface RecentReview {
            _id: string;
            title?: string;
            overallRating?: number;
            jobTitle?: string;
            reviewType?: string;
            createdAt?: string;
            companySlug: string;
            companyName: string;
            author?: {
                firstName?: string;
                lastName?: string;
                userType?: string;
                isVerified?: boolean;
            };
        }

        const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
        const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
        const [reviewsError, setReviewsError] = useState<string | null>(null);
        // Slideshow state for recent reviews
        const [reviewSlide, setReviewSlide] = useState(0);
        const reviewSlideRef = useRef<number | null>(null);

        // Derived slides (groups of 3)
        const reviewSlides = React.useMemo(() => {
            if (!recentReviews || recentReviews.length === 0) return [] as RecentReview[][];
            const chunk: RecentReview[][] = [];
            for (let i = 0; i < recentReviews.length; i += 3) {
                chunk.push(recentReviews.slice(i, i + 3));
            }
            return chunk;
        }, [recentReviews]);

        // Auto-rotate reviews similar to hero slideshow
        useEffect(() => {
            if (reviewSlides.length <= 1) return; // no need to rotate
            if (reviewSlideRef.current) window.clearInterval(reviewSlideRef.current);
            reviewSlideRef.current = window.setInterval(() => {
                setReviewSlide(prev => (prev + 1) % reviewSlides.length);
            }, 6000);
            return () => { if (reviewSlideRef.current) window.clearInterval(reviewSlideRef.current); };
        }, [reviewSlides]);

        // Fetch recent reviews from efficient backend endpoint
        useEffect(() => {
            const fetchRecent = async () => {
                setLoadingReviews(true);
                setReviewsError(null);
                try {
                    const response = await axios.get(`${API_URL}/reviews/recent?limit=6`, { timeout: 8000 });
                    const list = response.data?.data ?? [];
                    setRecentReviews(list);
                } catch (err:any) {
                    console.error('Error fetching recent reviews', err);
                    setReviewsError('No se pudieron cargar las reseñas.');
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchRecent();
        }, [API_URL]);

        const timeAgo = (iso?: string) => {
            if (!iso) return '';
            const diff = Date.now() - new Date(iso).getTime();
            const sec = Math.floor(diff/1000);
            if (sec < 60) return 'Hace segundos';
            const min = Math.floor(sec/60);
            if (min < 60) return `Hace ${min} min${min===1?'':'s'}`;
            const hr = Math.floor(min/60);
            if (hr < 24) return `Hace ${hr} hora${hr===1?'':'s'}`;
            const d = Math.floor(hr/24);
            if (d < 7) return `Hace ${d} día${d===1?'':'s'}`;
            const w = Math.floor(d/7);
            if (w < 4) return `Hace ${w} semana${w===1?'':'s'}`;
            const mo = Math.floor(d/30);
            if (mo < 12) return `Hace ${mo} mes${mo===1?'':'es'}`;
            const y = Math.floor(d/365);
            return `Hace ${y} año${y===1?'':'s'}`;
        };

        return (
        <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                {/* Header */}
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
                            <a className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-2" href="#">Inicio</a>
                            <a className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-3" href="/foro">Foro</a>
                            <Link className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-4" to="/companies">Empresas</Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <form onSubmit={handleSearch} className="hidden md:block" role="search" aria-label="Buscar empresas">
                            <div className="flex items-center w-[350px] max-w-[30vw] h-12 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 pr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 mr-2" fill="currentColor" viewBox="0 0 256 256" aria-hidden>
                                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                </svg>
                                <input
                                    placeholder="Buscar empresas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-sm md:text-base px-1"
                                    aria-label="Texto de búsqueda"
                                />
                                <button
                                    type="submit"
                                    className="ml-2 inline-flex items-center gap-1.1 h-9 px-4 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                                >
                                    Buscar
                                    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14"/>
                                        <path d="m12 5 7 7-7 7"/>
                                    </svg>
                                </button>
                            </div>
                        </form>
                        
                        <div className="flex gap-2 items-center">
                            {/* Campana de notificaciones */}
                            {user && (
                                <div className="relative">
                                    <button
                                        onClick={() => setNotifOpen(v=>!v)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur border border-slate-200 hover:shadow-sm"
                                        aria-label="Notificaciones"
                                    >
                                        <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                                        {unreadCount>0 && (
                                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow">{unreadCount}</span>
                                        )}
                                    </button>
                                    {notifOpen && (
                                        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-50">
                                            <div className="flex items-center justify-between px-2 py-1">
                                                <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
                                                <button onClick={markAllRead} className="text-[11px] text-indigo-600 hover:underline">Marcar todas como leídas</button>
                                            </div>
                                            <div className="max-h-80 overflow-auto divide-y divide-slate-100" role="list">
                                                {notifications.length===0 ? (
                                                    <div className="px-3 py-4 text-sm text-slate-500">No tienes notificaciones</div>
                                                ) : notifications.map(n => (
                                                    <div key={n._id} role="listitem" className={`px-3 py-3 ${!n.readAt ? 'bg-indigo-50/40' : 'bg-white'} hover:bg-slate-50 transition-colors`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${!n.readAt ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`} aria-hidden>
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-slate-800 text-[13px] leading-snug">
                                                                    {typeof n.company === 'object' && (n.company as any)?.name ? (
                                                                        <>
                                                                            La empresa <span className="font-semibold text-slate-900">{(n.company as any).name}</span> respondió tu review.
                                                                        </>
                                                                    ) : (
                                                                        n.message
                                                                    )}
                                                                </p>
                                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                                    <span className="text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                                                                    {typeof n.company === 'object' && (n.company as any)?.slug && (
                                                                        <Link to={`/companies/${(n.company as any).slug}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-[12px] text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200">
                                                                            Ver empresa
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {!n.readAt && (
                                                                <button onClick={()=>markRead(n._id)} className="text-[11px] text-indigo-600 hover:text-indigo-700 hover:underline ml-2 shrink-0">Marcar leído</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Botón destacado siempre visible para escribir experiencia */}
                            <button
                                onClick={handleWriteReview}
                                className="group hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-blue/70 px-5 h-10 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400/70 hover:text-blue-700 hover:shadow-md active:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 backdrop-blur"
                                aria-label="Escribir experiencia"
                            >
                                <span className="pr-0">Escribir Experiencia</span>
                            </button>
                            {/* Versión móvil como ícono flotante simple (dentro del header) */}
                            <button
                                onClick={handleWriteReview}
                                className="md:hidden w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md active:scale-[0.97] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                aria-label="Escribir experiencia"
                            >
                                <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M16.586 3.586a2 2 0 1 1 2.828 2.828L12.828 13H10v-2.828l6.586-6.586Z" />
                                </svg>
                            </button>
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
                                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold shadow-sm">✓</span>
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

                                        {/* Dropdown Menu */}
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
                    </div>
                </header>

                {/* Main Content */}
                <div className="px-6 md:px-12 lg:px-28 flex flex-1 justify-center py-10">
                    <div className="flex flex-col w-full max-w-[1180px] gap-16">
                                        {/* Hero Redesign */}
                                        <section className="hero-grid anim-scale-in">
                                            <div className="hero-content anim-fade-up anim-delay-2">
                                                <h1 className="hero-title">Descubre experiencias reales de empresas</h1>
                                                <p className="hero-sub">Encuentra transparencia sobre cultura, salarios, entrevistas y crecimiento profesional para tomar mejores decisiones en tu carrera.</p>
                                                <form onSubmit={handleSearch} className="hero-search anim-fade-up anim-delay-3" role="search" aria-label="Buscar empresas">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>
                                                    <input placeholder="Buscar empresas..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} aria-label="Texto de búsqueda" />
                                                    <button type="submit">
                                                        <span>Buscar</span>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                                    </button>
                                                </form>
                                                <div className="flex items-center gap-4 flex-wrap anim-fade-up anim-delay-4">
                                                    <div className="badge-soft">Reseñas verificadas</div>
                                                    <div className="badge-soft">Analítica de talento</div>
                                                    <div className="badge-soft">Transparencia</div>
                                                </div>
                                            </div>
                                            <div className="hero-visual anim-fade-up anim-delay-3">
                                                <div className="hero-slides" aria-label="Galería de imágenes de trabajo en equipo">
                                                    {heroImages.current.map((url, i) => (
                                                        <div
                                                            key={i}
                                                            className={`hero-slide ${i === activeSlide ? 'active' : ''}`}
                                                            role="img"
                                                            aria-hidden={i === activeSlide ? 'false' : 'true'}
                                                            aria-label={`Imagen ${i+1} de ${heroImages.current.length}`}
                                                            style={{ backgroundImage:`url(${url})`, transform: i === activeSlide ? 'scale(1.04)' : 'scale(1.02)' }}
                                                        />
                                                    ))}
                                                    <div className="hero-dots" role="tablist" aria-label="Selector de imágenes">
                                                        {heroImages.current.map((_, i) => (
                                                            <button
                                                                key={i}
                                                                aria-label={`Ver imagen ${i+1}`}
                                                                aria-selected={i===activeSlide}
                                                                className={i===activeSlide ? 'active' : ''}
                                                                onClick={() => goToSlide(i)}
                                                                role="tab"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Featured Companies (Dynamic) */}
                                        <section className="section-stack">
                                            <div className="flex items-center justify-between px-1">
                                                <h2 className="section-title"><span className="accent-bar"/>Empresas destacadas</h2>
                                                <span className="text-xs tracking-wide font-medium text-slate-500">Curadas para ti</span>
                                            </div>
                                            {loading ? (
                                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando empresas destacadas">
                                                    {[0,1,2].map(i => (
                                                        <div key={i} className={`company-card relative overflow-hidden ${i===1 ? 'anim-delay-2' : i===2 ? 'anim-delay-3' : ''}`}>
                                                            <div className="absolute inset-0 animate-pulse bg-slate-100/60" />
                                                            <div className="logo-sq bg-slate-200" />
                                                            <div className="h-4 w-2/3 rounded bg-slate-200 mt-2" />
                                                            <div className="h-3 w-full rounded bg-slate-100 mt-2" />
                                                            <div className="flex items-center justify-between pt-3">
                                                                <div className="h-6 w-14 bg-slate-200 rounded-full" />
                                                                <div className="h-3 w-16 bg-slate-200 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : companiesError ? (
                                                <div className="p-6 rounded-xl border border-dashed border-red-300 text-center text-sm text-red-600">{companiesError}</div>
                                            ) : topCompanies.length > 0 ? (
                                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {topCompanies.map((company, idx) => (
                                                        <Link
                                                            to={`/companies/${company.slug}`}
                                                            key={company._id}
                                                            className={`company-card anim-scale-in ${idx===1 ? 'anim-delay-2' : idx===2 ? 'anim-delay-3' : ''}`}
                                                            aria-label={`Ver detalles de ${company.name}`}
                                                        >
                                                            <div
                                                                className="logo-sq"
                                                                style={{
                                                                    backgroundImage: company.logo ? `url(${company.logo})` : undefined,
                                                                    backgroundColor: company.logo ? undefined : '#eef2ff'
                                                                }}
                                                            >
                                                                {!company.logo && (
                                                                    <span className="text-indigo-600 font-bold text-sm">
                                                                        {company.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-slate-800 font-semibold leading-tight line-clamp-1" title={company.name}>{company.name}</p>
                                                            <p className="text-slate-500 text-sm leading-snug line-clamp-2 capitalize">
                                                                {company.industry || 'Industria no especificada'}
                                                            </p>
                                                            {/* Se removió rating y total de reseñas según solicitud */}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">No hay empresas para mostrar todavía.</div>
                                            )}
                                        </section>

                                        {/* Recent Reviews (Dynamic) */}
                                        <section className="section-stack">
                                            <div className="flex items-center justify-between px-1">
                                                <h2 className="section-title"><span className="accent-bar"/>Reseñas recientes</h2>
                                                <span className="text-xs tracking-wide font-medium text-slate-500">Insights reales</span>
                                            </div>
                                            {loadingReviews ? (
                                                <div className="review-grid" aria-label="Cargando reseñas recientes">
                                                    {[0,1,2].map(i => (
                                                        <div key={i} className={`review-card relative overflow-hidden ${i===1?'anim-delay-2':i===2?'anim-delay-3':''}`}>
                                                            <div className="absolute inset-0 animate-pulse bg-slate-100/60" />
                                                            <div className="flex items-start gap-3 mb-4">
                                                                <div className="w-11 h-11 rounded-full bg-slate-200" />
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="h-4 w-40 bg-slate-200 rounded" />
                                                                    <div className="h-3 w-32 bg-slate-100 rounded" />
                                                                </div>
                                                                <div className="h-6 w-12 bg-slate-200 rounded-full" />
                                                            </div>
                                                            <div className="space-y-2 mb-4">
                                                                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                                                                <div className="h-3 w-full bg-slate-100 rounded" />
                                                                <div className="h-3 w-5/6 bg-slate-100 rounded" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-3 text-xs">
                                                                <div className="h-3 w-16 bg-slate-200 rounded" />
                                                                <div className="h-3 w-20 bg-slate-200 rounded" />
                                                                <div className="h-3 w-14 bg-slate-200 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : reviewsError ? (
                                                <div className="p-6 rounded-xl border border-dashed border-red-300 text-center text-sm text-red-600">{reviewsError}</div>
                                            ) : recentReviews.length === 0 ? (
                                                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">Todavía no hay reseñas para mostrar.</div>
                                            ) : (
                                                <div className="relative" aria-live="polite">
                                                    {reviewSlides.map((group, slideIdx) => (
                                                        <div
                                                            key={slideIdx}
                                                            className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-800 ease-in-out ${slideIdx===reviewSlide?'opacity-100':'opacity-0 pointer-events-none absolute inset-0'}`}
                                                        >
                                                            {group.map((rev) => {
                                                                const initials = rev.author?.firstName && rev.author?.lastName ? `${rev.author.firstName[0]}${rev.author.lastName[0]}` : (rev.author?.firstName?.[0] || 'R');
                                                                const typeLabelMap: Record<string,string> = { interview:'Entrevista', employee:'Empleado', intern:'Practicante', contractor:'Contrato' };
                                                                const typeLabel = typeLabelMap[rev.reviewType||''] || 'General';
                                                                return (
                                                                    <article key={rev._id} className="review-card group relative"> 
                                                                        <header className="flex items-start gap-3 mb-3">
                                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-semibold flex items-center justify-center shadow-sm ring-2 ring-white/50">
                                                                                {initials}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                    <p className="text-slate-800 font-semibold leading-tight line-clamp-1">{rev.jobTitle || 'Profesional'}</p>
                                                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-medium border border-indigo-100">{typeLabel}</span>
                                                                                </div>
                                                                                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{rev.companyName}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="rating-pill shadow-sm !px-2 !h-6">{(rev.overallRating ?? 0).toFixed(1)}</span>
                                                                            </div>
                                                                        </header>
                                                                        <h3 className="text-slate-800 font-semibold leading-snug mb-2 line-clamp-2 pr-1" title={rev.title}>{rev.title || 'Sin título'}</h3>
                                                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 pr-1">
                                                                            {rev.reviewType === 'interview' ? 'Experiencia de entrevista' : 'Reseña reciente'} · <span className="text-slate-500">{timeAgo(rev.createdAt)}</span>
                                                                        </p>
                                                                        <footer className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                                                                            <Link to={`/companies/${rev.companySlug}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                                                                Ver empresa
                                                                                <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                                                            </Link>
                                                                            <span className="text-[11px] tracking-wide text-slate-400">ID {rev._id.slice(-6)}</span>
                                                                        </footer>
                                                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5" />
                                                                    </article>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                    {reviewSlides.length > 1 && (
                                                        <div className="flex justify-center gap-2 mt-6">
                                                            {reviewSlides.map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setReviewSlide(i)}
                                                                    aria-label={`Ver grupo ${i+1}`}
                                                                    className={`w-2.5 h-2.5 rounded-full transition-all ${i===reviewSlide ? 'bg-indigo-600 scale-110' : 'bg-slate-300 hover:bg-slate-400'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </section>

                                        {/* CTA */}
                                        <section className="relative overflow-hidden rounded-2xl p-10 text-center text-white shadow-xl anim-fade-up anim-delay-2" style={{background:'linear-gradient(120deg,#4338ca,#6366f1 40%,#0ea5e9)'}}>
                                            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                                            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">¿Listo para compartir tu experiencia?</h2>
                                            <p className="mb-7 max-w-2xl mx-auto text-indigo-100 text-sm md:text-base">Ayuda a otros profesionales a decidir con información genuina sobre cultura, crecimiento y entrevistas.</p>
                                            <div className="flex gap-4 justify-center flex-wrap">
                                                <button onClick={handleWriteReview} className="bg-white text-indigo-700 px-7 py-3 rounded-full font-semibold shadow-sm hover:shadow transition-all hover:bg-indigo-50 border border-white/70 shimmer">Escribir Experiencia</button>
                                                <button onClick={handleWriteReview} className="px-7 py-3 rounded-full font-semibold border border-white/60 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur transition-colors shadow-sm">Compartir Opinión</button>
                                            </div>
                                        </section>
                  
                                        {/* Footer */}
                                        <footer className="text-center py-10 px-4 border-t border-slate-200/70">
                                            <h3 className="font-semibold text-slate-900 mb-2 tracking-tight">🎯 TalentTrace</h3>
                                            <p className="text-slate-600 text-sm max-w-xl mx-auto">Conectando talento con oportunidades mediante insights auténticos y contextualizados sobre el lugar de trabajo.</p>
                                            <p className="text-slate-500 text-xs mt-3">Desarrollado en la Universidad EAFIT 🇨🇴</p>
                                        </footer>
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
            {showWriteReview && user && (
                <WriteReviewModal
                    isOpen={showWriteReview}
                    onClose={() => setShowWriteReview(false)}
                    user={user}
                />
            )}
        </div>
    );
};

export default HomePage;