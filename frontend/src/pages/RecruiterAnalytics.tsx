import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRecruiterAnalytics } from '../services/analyticsApi';

interface TrendPoint {
  date: string;
  count: number;
  avgRating: number | null;
}

interface RecentReview {
  id: string;
  overallRating?: number;
  createdAt: string;
  recruiterResponded: boolean;
}

interface AnalyticsResponse {
  success: boolean;
  meta: { companyId: string; range: string; interval: string; generatedAt: string };
  metrics: {
    totalReviews: number;
    avgRating: number | null;
    reviewsWithResponse: number;
    responseRate: number;
    ratingDistribution: Record<string, number>;
    trend: TrendPoint[];
    recent: RecentReview[];
  };
}

const ranges = [
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: '90 días', value: '90d' },
  { label: '180 días', value: '180d' },
  { label: '1 año', value: '365d' }
];

const btnSecondaryStyle: React.CSSProperties = {
  padding: '0.55rem 0.95rem',
  background: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  color: '#334155',
  fontWeight: 500
};

const RecruiterAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('30d');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const navigate = useNavigate();

  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let user: any = null;
  try { if (userRaw) user = JSON.parse(userRaw); } catch {}

  const companyIdForRecruiter: string | undefined = useMemo(() => {
    if (!user) return undefined;
    if (user.userType === 'recruiter') return user.recruiterInfo?.companyId;
    if (user.userType === 'admin') return user.recruiterInfo?.companyId; // opcional para admin (podrá cambiarse luego)
    return undefined;
  }, [user]);

  const fetchAnalytics = async (silent = false) => {
    if (!user) return;
    if (user.userType === 'recruiter' && !companyIdForRecruiter) {
      setError('Tu cuenta de recruiter aún no está asociada a una empresa.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const json: AnalyticsResponse = await fetchRecruiterAnalytics({
        range,
        token,
        isAdmin: user.userType === 'admin',
        adminCompanyId: user.userType === 'admin' ? user.recruiterInfo?.companyId : undefined
      });
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
      if (!silent) toast.success('Analytics actualizadas');
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(true); /* eslint-disable-next-line */ }, [range]);

  const refresh = () => fetchAnalytics();

  if (!user || (user.userType !== 'recruiter' && user.userType !== 'admin')) {
    return <div style={{ padding: '2rem' }}>Acceso restringido.</div>;
  }

  if (user.userType === 'recruiter' && !companyIdForRecruiter) {
    return <div style={{ padding: '2rem', maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Analytics de Reseñas</h1>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', padding:'1rem 1.25rem', borderRadius:8 }}>
        <p style={{ margin:0, fontSize:14, lineHeight:1.5 }}>
          Tu rol de recruiter todavía no está vinculado a una empresa aprobada. Cuando un administrador apruebe y enlace tu cuenta, podrás ver aquí las métricas de la empresa.
        </p>
      </div>
    </div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1rem' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            style={{
              border:'1px solid #cbd5e1',
              background:'#fff',
              padding:'0.45rem 0.75rem',
              borderRadius:6,
              display:'inline-flex',
              alignItems:'center',
              gap:6,
              fontSize:12,
              cursor:'pointer',
              color:'#334155'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '.25rem' }}>Analytics de Reseñas</h1>
          <div style={{ fontSize:13, color:'#475569' }}>
            {user.userType === 'recruiter' && user.recruiterInfo?.companyName && (
              <span>Empresa: <strong>{user.recruiterInfo.companyName}</strong></span>
            )}
            {user.userType === 'admin' && <span>Modo administrador</span>}
            {lastUpdated && <span style={{ marginLeft:12, color:'#64748b' }}>Actualizado: {lastUpdated}</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button onClick={refresh} style={btnSecondaryStyle} disabled={loading}>⟳ Refrescar</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {ranges.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              background: range === r.value ? '#2563eb' : '#fff',
              color: range === r.value ? '#fff' : '#1e293b',
              cursor: 'pointer',
              fontSize: 14
            }}>{r.label}</button>
        ))}
      </div>

  {loading && <div style={{ marginBottom:'1rem', fontSize:14 }}>Cargando métricas...</div>}
  {error && <div style={{ color: 'red', marginBottom:'1rem', fontSize:14 }}>{error}</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
            <MetricCard title="Total Reseñas" value={data.metrics.totalReviews} />
            <MetricCard title="Rating Promedio" value={data.metrics.avgRating ?? '—'} />
            <MetricCard title="Con Respuesta" value={data.metrics.reviewsWithResponse} />
            <MetricCard title="Tasa de Respuesta" value={data.metrics.responseRate + '%'} />
          </div>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display:'flex', alignItems:'center', gap:8 }}>
              Distribución de Ratings {data.metrics.totalReviews === 0 && <span style={{ fontSize:11, fontWeight:400, color:'#64748b' }}>(Sin datos en el rango)</span>}
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              {Object.entries(data.metrics.ratingDistribution).map(([rating, count]) => (
                <div key={rating} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    height: 100,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '70%',
                      height: count === 0 ? 4 : (count / Math.max(1, Math.max(...Object.values(data.metrics.ratingDistribution)))) * 100,
                      background: '#3b82f6',
                      borderRadius: 4,
                      transition: 'height .3s'
                    }} />
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>{rating}★</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{count}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display:'flex', alignItems:'center', gap:8 }}>
              Tendencia ({data.meta.interval}) {(!data.metrics.trend || data.metrics.trend.length === 0) && <span style={{ fontSize:11, fontWeight:400, color:'#64748b' }}>(Sin datos)</span>}
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <svg width={Math.max(600, data.metrics.trend.length * 60)} height={200} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                {/* Simple line chart for count */}
                {(() => {
                  const points = data.metrics.trend;
                  if (!points.length) return null;
                  const maxCount = Math.max(...points.map(p => p.count));
                  const chartHeight = 140;
                  const yBase = 160;
                  const xStep = 50;
                  const d = points.map((p, i) => {
                    const x = 40 + i * xStep;
                    const y = yBase - (p.count / (maxCount || 1)) * chartHeight;
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                  }).join(' ');

                  return (
                    <g>
                      <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} />
                      {points.map((p, i) => {
                        const x = 40 + i * xStep;
                        const y = yBase - (p.count / (maxCount || 1)) * chartHeight;
                        return <circle key={i} cx={x} cy={y} r={4} fill="#2563eb" />
                      })}
                      {/* X labels */}
                      {points.map((p, i) => {
                        const x = 40 + i * xStep;
                        return <text key={i} x={x} y={180} fontSize={10} textAnchor="middle" fill="#334155">{p.date}</text>
                      })}
                    </g>
                  )
                })()}
              </svg>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', display:'flex', alignItems:'center', gap:8 }}>
              Reseñas Recientes {(!data.metrics.recent || data.metrics.recent.length === 0) && <span style={{ fontSize:11, fontWeight:400, color:'#64748b' }}>(Ninguna en el rango)</span>}
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.metrics.recent.map(r => (
                <div key={r.id} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Rating: {r.overallRating ?? '—'}★</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 12, color: r.recruiterResponded ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {r.recruiterResponded ? 'Respondida' : 'Sin respuesta'}
                  </div>
                </div>
              ))}
              {!data.metrics.recent.length && <div style={{ fontSize: 13, color: '#475569' }}>No hay reseñas recientes.</div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.9rem 1rem' }}>
    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748b', fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
  </div>
);

export default RecruiterAnalytics;
