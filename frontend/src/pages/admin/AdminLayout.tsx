import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
// esto es para que el admin pueda navegar
const navItems = [  
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/reviews', label: 'Moderación' },
  { to: '/admin/companies', label: 'Compañías' },
  { to: '/admin/recruiters', label: 'Reclutadores' },
  { to: '/admin/users', label: 'Usuarios' }
];

const AdminLayout: React.FC = () => { 
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <h1 className="text-lg font-bold tracking-tight text-slate-800">Admin Panel</h1>
          <p className="text-xs text-slate-500">TalentTrace</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(item => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={() => navigate('/')} className="w-full text-xs font-semibold text-slate-600 hover:text-slate-900">← Volver al sitio</button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
