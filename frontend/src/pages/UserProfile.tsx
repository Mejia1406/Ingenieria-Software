import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import WriteReviewModal from './WriteReview';

// Holaaaaa, oe esto es para definir el tipo de usuario, pues lo que se va a recibir
interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    recruiterInfo?: {
        companyName?: string;
        companyId?: string;
        companyEmail?: string;
        roleTitle?: string;
        status?: 'pending' | 'approved' | 'rejected';
        requestedAt?: string;
        approvedAt?: string;
        rejectedAt?: string;
        adminNote?: string;
    };
    profilePicture?: string;
    professionalSummary?: string;
    skills: string[];
    isVerified: boolean;
    reputation: number;
    location: {
        city: string;
        country: string;
    };
    workExperience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }>;
    education: Array<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        graduationYear: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

// Esta vuelta es que cuando le das al boton de edit en la pagina, ps aparece una ventana donde ud edita
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Aca en user es donde se guarda TODO del usuario, el loading es para que se cargue los datos
const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-1-ayxk.onrender.com/api';
const UserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Estados para el header (igual al Home)
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showWriteReview, setShowWriteReview] = useState(false);

    // Todo esto es lo que hace que las ventanas esten abiertas o no, false no y true si
    const [editBasicInfo, setEditBasicInfo] = useState(false);
    const [editLocation, setEditLocation] = useState(false);
    const [editSummary, setEditSummary] = useState(false);
    const [editSkills, setEditSkills] = useState(false);
    const [editExperience, setEditExperience] = useState(false);
    const [editEducation, setEditEducation] = useState(false);

    // Esto es para cuando ud escribe su nombre o lo que sea, y no le ha dado a guardar o cancelar
    const [basicInfoForm, setBasicInfoForm] = useState({
        firstName: '',
        lastName: '',
    userType: 'candidate'
    });

    const [locationForm, setLocationForm] = useState({
        city: '',
        country: ''
    });

    const [summaryForm, setSummaryForm] = useState('');
    const [skillsForm, setSkillsForm] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');

    const [experienceForm, setExperienceForm] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const [educationForm, setEducationForm] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationYear: new Date().getFullYear()
    });

    // Recruiter request state
    const [recruiterCompanyName, setRecruiterCompanyName] = useState('');
    const [recruiterCompanyEmail, setRecruiterCompanyEmail] = useState('');
    const [recruiterRoleTitle, setRecruiterRoleTitle] = useState('');
    const [submittingRecruiter, setSubmittingRecruiter] = useState(false);
    const [recruiterError, setRecruiterError] = useState('');
    const recruiterStatus = user?.recruiterInfo?.status;

    const submitRecruiterRequest = async () => {
        setRecruiterError('');
        setSubmittingRecruiter(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setRecruiterError('Debe iniciar sesión.');
                return;
            }
            const res = await fetch(`${API_URL}/recruiters/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ companyName: recruiterCompanyName, companyEmail: recruiterCompanyEmail, roleTitle: recruiterRoleTitle })
            });
            const data = await res.json();
            if (data.success) {
                // Refetch profile to get recruiterInfo
                await fetchUserProfile();
                setRecruiterCompanyName('');
                setRecruiterCompanyEmail('');
                setRecruiterRoleTitle('');
                toast.success('Solicitud enviada');
            } else {
                setRecruiterError(data.message || 'Error enviando la solicitud');
                toast.error(data.message || 'Error enviando solicitud');
            }
        } catch (e) {
            setRecruiterError('Error de red enviando la solicitud');
            toast.error('Error de red');
        } finally {
            setSubmittingRecruiter(false);
        }
    };

    // Esto hace que cuando se abre el perfil se cargue todos los datos de una
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // useEffect para cargar notificaciones
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) { setNotifications([]); return; }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/notifications?unread=false&limit=10`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                const data = await res.json();
                const list = data?.data?.notifications ?? [];
                if (Array.isArray(list)) setNotifications(list);
            } catch {}
        };
        fetchNotifications();
    }, [user, notifOpen]);

    // useEffect para cerrar dropdown al hacer click fuera
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

    // Esto le pide al servidor que le pase todos los datos de tal usuario
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.status === 401) {
            // Token expirado o inválido
            console.log('Token expired, redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setError('Session expired. Please login again.');
            
            // Redirigir al home después de 2 segundos
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

            if (data.success) {
                setUser(data.data.user);
                // Inicializar formularios con datos actuales
                setBasicInfoForm({
                    firstName: data.data.user.firstName || '',
                    lastName: data.data.user.lastName || '',
                    userType: data.data.user.userType || 'candidato'
                });
                setLocationForm({
                    city: data.data.user.location?.city || '',
                    country: data.data.user.location?.country || ''
                });
                setSummaryForm(data.data.user.professionalSummary || '');
                setSkillsForm(data.data.user.skills || []);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    // Handlers para el dropdown del perfil
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleGoToProfile = () => {
        setIsDropdownOpen(false);
    };

    const handleGoToAdmin = () => {
        navigate('/admin');
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsDropdownOpen(false);
        navigate('/');
    };

    // Handler para el buscador
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Handler para escribir experiencia
    const handleWriteReview = () => {
        if (user) {
            setShowWriteReview(true);
        } else {
            navigate('/auth');
        }
    };

    const unreadCount = notifications.filter(n => !n.readAt).length;

    // Esto es que cuando se hace un cambio se envia al servidor y se actualiza
    const updateProfile = async (updates: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
                return true;
            } else {
                setError(data.message);
                return false;
            }
        } catch (error) {
            setError('Failed to update profile');
            return false;
        }
    };

    // Todo esto es para cuando usted le da por ejemplo a guardar todo lo que ud hizo se guarde en el servidor
    const handleSaveBasicInfo = async () => {
        const success = await updateProfile(basicInfoForm);
        if (success) setEditBasicInfo(false);
    };

    const handleSaveLocation = async () => {
        const success = await updateProfile({ location: locationForm });
        if (success) setEditLocation(false);
    };

    const handleSaveSummary = async () => {
        const success = await updateProfile({ professionalSummary: summaryForm });
        if (success) setEditSummary(false);
    };

    const handleSaveSkills = async () => {
        const success = await updateProfile({ skills: skillsForm });
        if (success) setEditSkills(false);
    };

    const addSkill = () => {
        if (newSkill.trim() && !skillsForm.includes(newSkill.trim())) {
            setSkillsForm([...skillsForm, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkillsForm(skillsForm.filter(skill => skill !== skillToRemove));
    };

    const handleAddExperience = async () => {
        if (experienceForm.company && experienceForm.position && experienceForm.startDate) {
            const newExperience = [...(user?.workExperience || []), experienceForm];
            const success = await updateProfile({ workExperience: newExperience });
            if (success) {
                setEditExperience(false);
                setExperienceForm({
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: ''
                });
            }
        }
    };

    const handleAddEducation = async () => {
        if (educationForm.institution && educationForm.degree && educationForm.fieldOfStudy) {
            const newEducation = [...(user?.education || []), educationForm];
            const success = await updateProfile({ education: newEducation });
            if (success) {
                setEditEducation(false);
                setEducationForm({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    graduationYear: new Date().getFullYear()
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !user) {
        const isNetworkError = error === 'Failed to fetch profile data';
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-red-50 rounded-full p-3">
                            <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No se pudo cargar el perfil</h2>
                    <p className="text-gray-600 mb-4">
                        {isNetworkError
                            ? 'Parece que el servidor no responde. Verifica que el backend esté activo (Render) o revisa tu conexión.'
                            : (error || 'Usuario no encontrado')
                        }
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={async () => { setLoading(true); setError(''); await fetchUserProfile(); }}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reintentar
                        </button>
                        <Link to="/" className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                            Ir a Inicio
                        </Link>
                    </div>
                    {isNetworkError && (
                        <p className="text-xs text-gray-500 mt-4">URL del API: <code className="text-xs text-gray-700 break-all">{API_URL}</code></p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
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
                        <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-2">Inicio</Link>
                        <Link to="/foro" className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-3">Foro</Link>
                        <Link to="/companies" className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-4">Empresas</Link>
                        <Link to="/blog" className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-5">Blog</Link>
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
                                    onClick={() => setNotifOpen(v => !v)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur border border-slate-200 hover:shadow-sm"
                                    aria-label="Notificaciones"
                                >
                                    <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow">{unreadCount}</span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-2 z-50">
                                        <div className="flex items-center justify-between px-2 py-1">
                                            <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
                                        </div>
                                        <div className="max-h-80 overflow-auto divide-y divide-slate-100" role="list">
                                            {notifications.length === 0 ? (
                                                <div className="px-3 py-4 text-sm text-slate-500">No tienes notificaciones</div>
                                            ) : notifications.map(n => (
                                                <div key={n._id} role="listitem" className={`px-3 py-3 ${!n.readAt ? 'bg-indigo-50/40' : 'bg-white'} hover:bg-slate-50 transition-colors`}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${!n.readAt ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`} aria-hidden>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-slate-800 text-[13px] leading-snug">{n.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Botón destacado para escribir experiencia */}
                        <button
                            onClick={handleWriteReview}
                            className="group hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-blue/70 px-5 h-10 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-400/70 hover:text-blue-700 hover:shadow-md active:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 backdrop-blur"
                            aria-label="Escribir experiencia"
                        >
                            <span className="pr-0">Escribir Experiencia</span>
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
                                    onClick={() => navigate('/auth')}
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
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Profile Header - diseño mejorado */}
                <div className="relative mb-8">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                            {/* subtle decorative circle */}
                            <svg className="absolute right-6 top-6 opacity-10" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="60" cy="60" r="60" fill="white" />
                            </svg>
                        </div>
                        <div className="bg-white px-6 pb-6 pt-0">
                            <div className="-mt-20 flex items-end gap-6">
                                <div className="relative">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt="Avatar" className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-36 h-36 rounded-full border-4 border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg flex items-center justify-center text-4xl font-bold text-gray-600">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-4">
                                        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{user.firstName} {user.lastName}</h1>
                                        {user.isVerified && (
                                            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/></svg>
                                                Verificado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 capitalize">{user.userType}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 0011.314-11.314l-4.243 4.243"/></svg>
                                            <span>
                                                {user.location?.city && user.location?.country
                                                    ? `${user.location.city}, ${user.location.country}`
                                                    : 'Ubicación no especificada'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button onClick={() => setEditBasicInfo(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg shadow-md hover:scale-105 transition-transform">
                                        Editar perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Información Básica</h2>
                                <button
                                    onClick={() => setEditBasicInfo(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Editar
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Tipo de usuario</label>
                                    <p className="text-gray-900 capitalize">{user.userType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Miembro desde</label>
                                    <p className="text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Ubicación</h2>
                                <button
                                    onClick={() => setEditLocation(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Editar
                                </button>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-900">
                                    {user.location?.city || 'Ciudad no especificada'}
                                </p>
                                <p className="text-gray-600">
                                    {user.location?.country || 'País no especificado'}
                                </p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Habilidades</h2>
                                <button
                                    onClick={() => setEditSkills(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Editar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No se han agregado habilidades aún</p>
                                )}
                            </div>
                        </div>

                        {/* Recruiter Request */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Rol de Reclutador</h2>
                            </div>
                            {user.userType === 'recruiter' && recruiterStatus === 'approved' && (
                                <div className="space-y-2">
                                    <p className="text-green-600 font-medium">Eres reclutador aprobado.</p>
                                    {user.recruiterInfo?.companyName && <p className="text-sm text-gray-700">Empresa: {user.recruiterInfo.companyName}</p>}
                                    {user.recruiterInfo?.roleTitle && <p className="text-sm text-gray-700">Rol: {user.recruiterInfo.roleTitle}</p>}
                                </div>
                            )}
                            {user.userType !== 'recruiter' && (!recruiterStatus || recruiterStatus === 'rejected') && (
                                <div className="space-y-4">
                                    {recruiterStatus === 'rejected' && (
                                        <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
                                            Tu solicitud fue rechazada {user.recruiterInfo?.adminNote && (<>: <strong>{user.recruiterInfo.adminNote}</strong></>)}.
                                            Puedes volver a intentarlo.
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                                        <input
                                            type="text"
                                            value={recruiterCompanyName}
                                            onChange={(e) => setRecruiterCompanyName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Corporativo</label>
                                        <input
                                            type="email"
                                            value={recruiterCompanyEmail}
                                            onChange={(e) => setRecruiterCompanyEmail(e.target.value)}
                                            placeholder="tu@empresa.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título del Rol (opcional)</label>
                                        <input
                                            type="text"
                                            value={recruiterRoleTitle}
                                            onChange={(e) => setRecruiterRoleTitle(e.target.value)}
                                            placeholder="Recruiter, HR Manager..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    {recruiterError && <p className="text-sm text-red-600">{recruiterError}</p>}
                                    <button
                                        disabled={submittingRecruiter || !recruiterCompanyName || !recruiterCompanyEmail}
                                        onClick={submitRecruiterRequest}
                                        className="w-full bg-purple-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        {submittingRecruiter ? 'Enviando...' : 'Solicitar Rol de Reclutador'}
                                    </button>
                                </div>
                            )}
                            {user.userType !== 'recruiter' && recruiterStatus === 'pending' && (
                                <div className="space-y-2">
                                    <p className="text-sm text-amber-600">Solicitud enviada. Estado: Pendiente de aprobación.</p>
                                    {user.recruiterInfo?.companyName && <p className="text-sm text-gray-700">Empresa: {user.recruiterInfo.companyName}</p>}
                                    {user.recruiterInfo?.companyEmail && <p className="text-sm text-gray-700">Correo: {user.recruiterInfo.companyEmail}</p>}
                                    <p className="text-xs text-gray-500">Fecha: {user.recruiterInfo?.requestedAt && new Date(user.recruiterInfo.requestedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Professional Summary */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Resumen Profesional</h2>
                                <button
                                    onClick={() => setEditSummary(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Editar
                                </button>
                            </div>
                            <div>
                                {user.professionalSummary ? (
                                    <p className="text-gray-700 leading-relaxed">{user.professionalSummary}</p>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        Agrega un resumen profesional para contarles a otros sobre tu experiencia y objetivos.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Experiencia Laboral</h2>
                                <button
                                    onClick={() => setEditExperience(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Agregar Experiencia
                                </button>
                            </div>
                            <div className="space-y-4">
                                {user.workExperience && user.workExperience.length > 0 ? (
                                    user.workExperience.map((exp, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h3 className="font-medium text-gray-900">{exp.position}</h3>
                                            <p className="text-blue-600">{exp.company}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(exp.startDate).toLocaleDateString()} - {
                                                    exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Presente'
                                                }
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-700 mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No se ha agregado experiencia laboral aún.</p>
                                )}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Educación</h2>
                                <button
                                    onClick={() => setEditEducation(true)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Agregar Educación
                                </button>
                            </div>
                            <div className="space-y-4">
                                {user.education && user.education.length > 0 ? (
                                    user.education.map((edu, index) => (
                                        <div key={index} className="border-l-4 border-green-500 pl-4">
                                            <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                                            <p className="text-green-600">{edu.institution}</p>
                                            <p className="text-sm text-gray-600">
                                                {edu.fieldOfStudy} • Clase de {edu.graduationYear}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No se ha agregado educación aún.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Modals */}

            {/* Edit Basic Info Modal */}
            <EditModal isOpen={editBasicInfo} onClose={() => setEditBasicInfo(false)} title="Edit Basic Information">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"> Nombre</label>
                        <input
                            type="text"
                            value={basicInfoForm.firstName}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                        <input
                            type="text"
                            value={basicInfoForm.lastName}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
                        <select
                            value={basicInfoForm.userType}
                            onChange={(e) => setBasicInfoForm({ ...basicInfoForm, userType: e.target.value === 'recruiter' ? 'candidate' : e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="candidate">Candidato</option>
                            <option value="employee">Empleado</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveBasicInfo}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Guardar cambios
                        </button>
                        <button
                            onClick={() => setEditBasicInfo(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Location Modal */}
            <EditModal isOpen={editLocation} onClose={() => setEditLocation(false)} title="Edit Location">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                        <input
                            type="text"
                            value={locationForm.city}
                            onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <input
                            type="text"
                            value={locationForm.country}
                            onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveLocation}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Guardar cambios
                        </button>
                        <button
                            onClick={() => setEditLocation(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Summary Modal */}
            <EditModal isOpen={editSummary} onClose={() => setEditSummary(false)} title="Edit Professional Summary">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumen Profesional</label>
                        <textarea
                            value={summaryForm}
                            onChange={(e) => setSummaryForm(e.target.value)}
                            rows={6}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cuéntanos sobre tu experiencia profesional, objetivos y qué te hace único..."
                        />
                        <p className="text-sm text-gray-500 mt-1">{summaryForm.length}/1000 caracteres</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveSummary}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Guardar cambios
                        </button>
                        <button
                            onClick={() => setEditSummary(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Edit Skills Modal */}
            <EditModal isOpen={editSkills} onClose={() => setEditSkills(false)} title="Edit Skills">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agregar Nueva Habilidad</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., JavaScript, Project Management"
                            />
                            <button
                                onClick={addSkill}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades Actuales</label>
                        <div className="flex flex-wrap gap-2">
                            {skillsForm.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSaveSkills}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Guardar Cambios
                        </button>
                        <button
                            onClick={() => setEditSkills(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Add Experience Modal */}
            <EditModal isOpen={editExperience} onClose={() => setEditExperience(false)} title="Add Work Experience">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Compañia</label>
                        <input
                            type="text"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                        <input
                            type="text"
                            value={experienceForm.position}
                            onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                            <input
                                type="date"
                                value={experienceForm.startDate}
                                onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                            <input
                                type="date"
                                value={experienceForm.endDate}
                                onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            value={experienceForm.description}
                            onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddExperience}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Agregar Experiencia
                        </button>
                        <button
                            onClick={() => setEditExperience(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

            {/* Add Education Modal */}
            <EditModal isOpen={editEducation} onClose={() => setEditEducation(false)} title="Agregar Educación">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                        <input
                            type="text"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                        <input
                            type="text"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Bachelor of Science, Master of Arts"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campo de Estudio</label>
                        <input
                            type="text"
                            value={educationForm.fieldOfStudy}
                            onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Computer Science, Business Administration"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año de Graduación</label>
                        <input
                            type="number"
                            min="1950"
                            max="2030"
                            value={educationForm.graduationYear}
                            onChange={(e) => setEducationForm({ ...educationForm, graduationYear: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddEducation}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Agregar Educación
                        </button>
                        <button
                            onClick={() => setEditEducation(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </EditModal>

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

export default UserProfile;