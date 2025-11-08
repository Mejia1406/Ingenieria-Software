import React, { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Eager loading for critical pages
import HomePage from './pages/Home';
import Companies from "./pages/Companies";
import Chatbot from './components/chatbot';

// Lazy loading for less critical pages
const UserProfile = lazy(() => import('./pages/UserProfile'));
const CompanyDetail = lazy(() => import('./pages/CompanyDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Foro = lazy(() => import('./pages/Foro'));
const RecruiterAnalytics = lazy(() => import('./pages/RecruiterAnalytics'));

// Admin pages - lazy loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminReviewsModeration = lazy(() => import('./pages/admin/AdminReviewsModeration'));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'));
const AdminCompanyForm = lazy(() => import('./pages/admin/AdminCompanyForm'));
const AdminRecruiters = lazy(() => import('./pages/admin/AdminRecruiters'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminBlogForm = lazy(() => import('./pages/admin/AdminBlogForm'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Simple Protected Admin Route using localStorage (puede mejorarse con contexto global)
const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  let user: any = null;
  try { const raw = localStorage.getItem('user'); if (raw) user = JSON.parse(raw); } catch {}
  if (!user || user.userType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return element;
};

function App() {
  
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/profile" element={<UserProfile />} />
          {/* Ruta /write-review desactivada en modo página: redirige al home para evitar error */}
          <Route path="/write-review" element={<Navigate to="/" replace />} />
          <Route path="/companies/:slug" element={<CompanyDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}> 
            <Route index element={<AdminDashboard />} />
            <Route path="reviews" element={<AdminReviewsModeration />} />
            <Route path="companies" element={<AdminCompanies />} />
            { /* Ruta deshabilitada para creación: redirige cualquier intento de /admin/companies/new al listado */ }
            <Route path="companies/new" element={<Navigate to="/admin/companies" replace />} />
            <Route path="companies/:id" element={<AdminCompanyForm />} />
            <Route path="recruiters" element={<AdminRecruiters />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/:id" element={<AdminBlogForm />} />
          </Route>
          <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
          <Route path="/foro" element={<Foro />} />
        </Routes>
      </Suspense>
      <Chatbot />
    </Router>
  );
}

export default App;