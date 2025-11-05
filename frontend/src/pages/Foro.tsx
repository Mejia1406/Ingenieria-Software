import React, { useState, useEffect, useRef } from 'react';
import { getForumQuestions, postForumQuestion, postForumAnswer, ForumQuestion } from '../services/forumApi';
import { Link, useNavigate } from 'react-router-dom';
import WriteReviewModal from './WriteReview';

// Header igual al de Home.tsx
interface ForoHeaderProps {
  user: any | null;
  onWriteReview: () => void;
}

const ForoHeader: React.FC<ForoHeaderProps> = ({ user, onWriteReview }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-2025.vercel.app/api';

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
  }, [user, API_URL, notifOpen]);

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

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleGoToProfile = () => { navigate('/profile'); setIsDropdownOpen(false); };
  const handleGoToAdmin = () => { navigate('/admin'); setIsDropdownOpen(false); };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsDropdownOpen(false);
  };

  return (
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
          <a className="text-slate-600 hover:text-slate-900 transition-colors anim-fade-up anim-delay-2" href="/">Inicio</a>
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
              onChange={e => setSearchQuery(e.target.value)}
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
            onClick={onWriteReview}
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
  );
};


const Foro: React.FC = () => {
  const [questions, setQuestions] = useState<ForumQuestion[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getForumQuestions();
        setQuestions(data);
      } catch {
        setError('No se pudieron cargar las preguntas.');
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    // Obtener el ID del usuario autenticado (ejemplo: desde localStorage)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authorId = user._id || user.id || '';
    if (!authorId) {
      setError('Debes iniciar sesión para publicar una pregunta.');
      setLoading(false);
      return;
    }
    try {
      const newQuestion = await postForumQuestion(questionText, authorId);
      setQuestions([newQuestion, ...questions]);
      setSuccess('¡Pregunta publicada!');
      setQuestionText('');
    } catch {
      setError('No se pudo publicar la pregunta.');
    }
    setLoading(false);
  };

  const handleAnswer = async (questionId: string, answerText: string) => {
    if (!answerText.trim()) return;
    try {
      const updatedQuestion = await postForumAnswer(questionId, answerText);
      setQuestions(questions =>
        questions.map(q =>
          q._id === questionId ? updatedQuestion : q
        )
      );
    } catch {
      setError('No se pudo publicar la respuesta.');
    }
  };

  const handleWriteReview = () => {
    if (user) {
      setShowWriteReview(true);
    } else {
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white-50 pb-16">
      <ForoHeader user={user} onWriteReview={handleWriteReview} />
      <main className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Foro de TalentTrace</h1>
        <section className="mb-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
            <label className="font-semibold text-slate-800 text-lg mb-1">Publica una pregunta</label>
            <textarea
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 bg-slate-50 resize-vertical"
              placeholder="Escribe tu pregunta, duda o consejo..."
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              minLength={5}
              maxLength={1000}
              required
              disabled={loading}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold shadow hover:scale-105 transition-transform"
                disabled={loading || questionText.trim().length < 5}
              >{loading ? 'Publicando...' : 'Publicar pregunta'}</button>
            </div>
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
          </form>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-6 text-indigo-700">Preguntas recientes</h2>
          <div className="space-y-6">
            {questions.length === 0 ? (
              <div className="border rounded-xl p-6 bg-white shadow text-slate-500 text-center">Todavía no hay preguntas en el foro.</div>
            ) : (
              questions.map(q => (
                <div key={q._id} className="border rounded-xl p-5 bg-white shadow flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-xl shadow">
                      {q.author && q.author.firstName ? q.author.firstName[0] : 'A'}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-indigo-700">
                        {q.author && q.author.firstName ? `${q.author.firstName} ${q.author.lastName}` : 'Anónimo'}
                      </span>
                      <span className="text-xs text-slate-400">{q.author && q.author.userType ? q.author.userType : ''}</span>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">{new Date(q.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line mb-2 font-medium">{q.content}</p>
                  <AnswerSection question={q} onAnswer={handleAnswer} />
                </div>
              ))
            )}
          </div>
        </section>
      </main>
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


const AnswerSection: React.FC<{ question: ForumQuestion; onAnswer: (questionId: string, answerText: string) => void }> = ({ question, onAnswer }) => {
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAnswer(question._id, answerText);
    setAnswerText('');
    setLoading(false);
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-2">
        <input
          type="text"
          placeholder="Escribe una respuesta..."
          value={answerText}
          onChange={e => setAnswerText(e.target.value)}
          minLength={2}
          maxLength={1000}
          required
          disabled={loading}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 bg-slate-50"
        />
        <button type="submit" disabled={loading || answerText.trim().length < 2} className="px-4 py-1 rounded-lg bg-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform">
          {loading ? 'Publicando...' : 'Responder'}
        </button>
      </form>
      <div className="space-y-2">
        {question.answers.length === 0 ? (
          <div className="border rounded-lg p-3 bg-slate-50 text-slate-500 text-center">No hay respuestas aún.</div>
        ) : (
          question.answers.map((a, idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-white text-slate-700 flex gap-3 items-center shadow-sm">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold flex items-center justify-center">
                {a.author && a.author.firstName ? a.author.firstName[0] : 'A'}
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-indigo-700">
                  {a.author && a.author.firstName ? `${a.author.firstName} ${a.author.lastName}` : 'Anónimo'}
                </span>
                <span className="text-xs text-slate-400">{a.author && a.author.userType ? a.author.userType : ''}</span>
              </div>
              <span className="text-slate-700 text-base ml-2 flex-1">{a.content}</span>
              <span className="text-xs text-slate-400 ml-2">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Foro;
