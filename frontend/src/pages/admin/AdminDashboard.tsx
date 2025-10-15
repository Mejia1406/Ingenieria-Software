import React, { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/apiAdmin';
// Todo este codigo lo que hace es mostrar las estadisticas del admin en el dashboard
interface AdminStats {
  pendingReviews: number;
  totalReviews: number;
  totalCompanies: number;
  totalUsers: number;
  newReviewsLast7d: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getAdminStats();
        if (mounted) setStats(data);
      } catch (e:any) {
        setError('Error cargando estadísticas');
      } finally { setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
      {loading && <p className="text-slate-500 text-sm">Cargando...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Reviews pendientes" value={stats.pendingReviews} accent="bg-amber-500" />
          <StatCard label="Total reviews" value={stats.totalReviews} accent="bg-blue-600" />
          <StatCard label="Nuevas (7d)" value={stats.newReviewsLast7d} accent="bg-emerald-600" />
          <StatCard label="Compañías" value={stats.totalCompanies} accent="bg-indigo-600" />
          <StatCard label="Usuarios" value={stats.totalUsers} accent="bg-pink-600" />
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label:string; value:number; accent:string; }> = ({ label, value, accent }) => (
  <div className="rounded-lg bg-white border border-slate-200 p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${accent}`}>{value}</div>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
