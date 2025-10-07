import React, { useState, useEffect, useRef } from 'react';
    import { Link, useNavigate } from "react-router-dom";
    import WriteReviewModal from "./WriteReview";
    import AuthPage from './Auth';
    import axios from 'axios';

    interface User {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        userType: string;
        isVerified: boolean;
    }

    interface ReviewFormData {
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

    interface Company {
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
        const [showAuth, setShowAuth] = useState(false);
        const [showWriteReview, setShowWriteReview] = useState(false);
        const [user, setUser] = useState<User | null>(null);
        const [searchQuery, setSearchQuery] = useState('');
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [companies, setCompanies] = useState<Company[]>([]);
        const [loading, setLoading] = useState(true);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const navigate = useNavigate();
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

        useEffect(() => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        }, []);

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

        // Load companies from database
        useEffect(() => {
            const fetchCompanies = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/companies`);
                if (response.data.success && response.data.data.companies) {
                setCompanies(response.data.data.companies);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
                // Use fallback data if API fails
                
            } finally {

                setLoading(false);
            }
            };
        
            fetchCompanies();
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
                            <a className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-3" href="#">Reseñas</a>
                            <Link className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-4" to="/companies">Empresas</Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <form onSubmit={handleSearch} className="flex">
                            <label className="flex flex-col min-w-40 !h-10 max-w-64">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                    <div className="text-slate-500 flex border-none bg-slate-100 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                        </svg>
                                    </div>
                                    <input
                                        placeholder="Buscar empresas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-slate-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                    />
                                </div>
                            </label>
                        </form>
                        
                        <div className="flex gap-2 items-center">
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
                <div className="px-10 lg:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Hero Section */}
                        <div className="container mx-auto">
                            <div className="p-4">
                                <div
                                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-center justify-center p-8 anim-scale-in"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://www.sydle.com/blog/assets/post/objetivos-de-una-empresa-mejores-metodos-617303753885651fa20ef5e9/business-goals.jpg")`
                                    }}
                                >
                                    <div className="flex flex-col gap-2 text-center anim-fade-up">
                                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] anim-fade-up anim-delay-2">
                                            Encuentra la empresa perfecta para ti
                                        </h1>
                                        <h2 className="text-white text-sm md:text-base font-normal leading-normal anim-fade-up anim-delay-3">
                                            Explora reseñas de empresas, salarios e insights de entrevistas de empleados y candidatos.
                                        </h2>
                                    </div>
                                    <form onSubmit={handleSearch} className="w-full max-w-[480px] anim-fade-up anim-delay-4">
                                        <label className="flex flex-col min-w-40 h-14 w-full md:h-16">
                                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                                <div className="text-slate-500 flex border border-slate-300 bg-white items-center justify-center pl-[15px] rounded-l-lg border-r-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    placeholder="Buscar empresa"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-slate-900 focus:outline-0 focus:ring-0 border border-slate-300 bg-white focus:border-slate-400 h-full placeholder:text-slate-500 px-[15px] border-r-0 border-l-0 text-sm md:text-base font-normal leading-normal"
                                                />
                                                <div className="flex items-center justify-center rounded-r-lg border-l-0 border border-slate-300 bg-white pr-[7px]">
                                                    <button 
                                                        type="submit"
                                                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 md:h-12 px-4 md:px-5 bg-blue-600 text-white text-sm md:text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
                                                    >
                                                        <span className="truncate">Buscar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </label>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Featured Companies */}
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 anim-fade-up">Empresas Destacadas</h2>
                        <div className="flex overflow-x-auto pb-4">
                            <div className="flex items-stretch p-4 gap-3 min-w-max stagger-fade-up">
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 anim-scale-in">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAO81K945vo1JQhF5bJ9O6C33gg8knGrIz8RyMxZ811j5Rm6C2paIVn6oAarrcF4PBZXufnsxIANL7HaQz_NFMgT1u3kY3ZdcjqMMirr3ncaWSRcAYbKbguqzi67RgJxlteVJT5pp9CLIWemt7iL4VY6yVsaF1Cv639P_qKNmok_wCSioSa_5_eTXhqYKcrEm7xMdo7V82nShYZLU9A6M7_1JQKNKgGlxc8LJIvpvxi71zIoBM-t3VHCnnLhb5QMMHOZanfCvdBfhY")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Tech Innovators Inc.</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Liderando el camino en desarrollo de software e innovación.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex text-yellow-400">
                                                ★★★★☆
                                            </div>
                                            <span className="text-sm text-slate-600">4.2 (127 reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 anim-scale-in anim-delay-2">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Global Solutions Corp.</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Proporcionando soluciones innovadoras a desafíos globales.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex text-yellow-400">
                                                ★★★★★
                                            </div>
                                            <span className="text-sm text-slate-600">4.8 (89 reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60 anim-scale-in anim-delay-3">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Creative Minds Studio</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Fomentando la creatividad y colaboración en un ambiente dinámico.</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex text-yellow-400">
                                                ★★★★☆
                                            </div>
                                            <span className="text-sm text-slate-600">4.5 (203 reseñas)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latest Reviews Section */}
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5 anim-fade-up">Reseñas Recientes</h2>
                        <div className="grid gap-4 px-4 pb-8">
                            <div className="bg-white rounded-lg border border-slate-200 p-6 anim-fade-up anim-delay-2">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            SM
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Ingeniero de Software</p>
                                            <p className="text-sm text-slate-600">Ex Empleado • Tech Innovators Inc.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex text-yellow-400 text-sm">★★★★☆</div>
                                        <span className="text-sm text-slate-600 ml-1">4.0</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Excelente lugar para hacer crecer tu carrera</h3>
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                    Ambiente de trabajo increíble con colegas que te apoyan. La empresa realmente invierte en el desarrollo
                                    de los empleados y proporciona excelentes oportunidades de aprendizaje. La gestión es transparente y comunicativa.
                                </p>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span>👍 Útil (23)</span>
                                    <span>💬 Comentar</span>
                                    <span>📅 Hace 2 días</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 p-6 anim-fade-up anim-delay-3">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            AM
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Gerente de Marketing</p>
                                            <p className="text-sm text-slate-600">Empleado Actual • Global Solutions Corp.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                        <span className="text-sm text-slate-600 ml-1">5.0</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Cultura empresarial excepcional</h3>
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                    El equilibrio trabajo-vida personal es excepcional, y el equipo es increíblemente colaborativo. 
                                    Excelente paquete de beneficios y el equipo directivo realmente se preocupa por el bienestar de los empleados.
                                </p>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span>👍 Útil (18)</span>
                                    <span>💬 Comentar</span>
                                    <span>📅 Hace 1 semana</span>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mx-4 text-center text-white mb-8 shadow-md anim-fade-up anim-delay-2">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
                            <h2 className="text-2xl font-bold mb-4">¿Listo para compartir tu experiencia?</h2>
                            <p className="mb-6 text-blue-100">
                                Ayuda a otros a tomar decisiones de carrera informadas compartiendo tus experiencias laborales.
                            </p>
                            <div className="flex gap-3 justify-center flex-wrap anim-fade-up anim-delay-3">
                                <button
                                    onClick={handleWriteReview}
                                    className="bg-white/95 backdrop-blur text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-white shadow-sm hover:shadow transition-all border border-white/60 shimmer"
                                >
                                    Escribir Experiencia
                                </button>
                                <button
                                    onClick={handleWriteReview}
                                    className="px-6 py-3 rounded-xl font-semibold border border-white/60 text-white/90 hover:text-white hover:bg-white/10 bg-white/5 backdrop-blur transition-colors shadow-sm"
                                >
                                    Compartir Experiencia
                                </button>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="text-center py-8 px-4 border-t border-slate-200">
                            <h3 className="font-semibold text-slate-900 mb-2">🎯 TalentTrace</h3>
                            <p className="text-slate-600 text-sm">
                                Conectando talento con oportunidades a través de insights transparentes del lugar de trabajo
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                                Desarrollado en la Universidad EAFIT 🇨🇴
                            </p>
                        </div>
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