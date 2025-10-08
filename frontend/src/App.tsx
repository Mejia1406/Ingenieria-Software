import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Companies from "./pages/Companies";
import UserProfile from "./pages/UserProfile";
import WriteReview from "./pages/WriteReview";
import WriteReviewModal from './pages/WriteReview';
import CompanyDetail from './pages/CompanyDetail';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewsModeration from './pages/admin/AdminReviewsModeration';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminCompanyForm from './pages/admin/AdminCompanyForm';
import AdminRecruiters from './pages/admin/AdminRecruiters';
import RecruiterAnalytics from './pages/RecruiterAnalytics';

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
      <Routes>
        <Route path="/" element={<HomePage />} />
  <Route path="/companies" element={<Companies />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/write-review" element={<WriteReview isOpen={false} onClose={function (): void {
          throw new Error('Function not implemented.');
        } } user={null}/>} />
        <Route path="/companies/:slug" element={<CompanyDetail />} />
        <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}> 
          <Route index element={<AdminDashboard />} />
          <Route path="reviews" element={<AdminReviewsModeration />} />
          <Route path="companies" element={<AdminCompanies />} />
          { /* Ruta deshabilitada para creación: redirige cualquier intento de /admin/companies/new al listado */ }
          <Route path="companies/new" element={<Navigate to="/admin/companies" replace />} />
          <Route path="companies/:id" element={<AdminCompanyForm />} />
          <Route path="recruiters" element={<AdminRecruiters />} />
        </Route>
        <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
      </Routes>
    </Router>
  );
}

export default App;