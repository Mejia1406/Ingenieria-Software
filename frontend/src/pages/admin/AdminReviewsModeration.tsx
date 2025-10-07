import React, { useEffect, useState, useCallback } from 'react';
import { listAdminReviews, moderateReview, AdminReview } from '../../services/apiAdmin';

const PAGE_SIZE = 15; // numero de reviews por pagina

const AdminReviewsModeration: React.FC = () => { // este componente es para que el admin pueda ps moderar las reviews
  const [status, setStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [rating, setRating] = useState<number|''>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminReview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [moderatingId, setModeratingId] = useState<string|null>(null);
  const [reasonModal, setReasonModal] = useState<{ id:string; open:boolean }>({ id:'', open:false });
  const [reasonText, setReasonText] = useState('');

  const load = useCallback(async () => { // esta funcion es para cargar las reviews segun el filtro que seleccione
    setLoading(true); setError(null);
    try {
      const res = await listAdminReviews({ status, rating: rating || undefined, page, limit: PAGE_SIZE, sortBy:'createdAt', sortOrder:'desc' });
      setData(res.reviews);
      setTotalPages(res.pagination.pages || 1);
    } catch (e:any) {
      setError('Error cargando reviews');
    } finally { setLoading(false); }
  }, [status, rating, page]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id:string) => { // esta funcion es para aprobar una review
    setModeratingId(id);
    try {
      const updated = await moderateReview(id, 'approved');
      setData(prev => prev.filter(r => r._id !== id));
    } catch (e:any) {
      alert('Error aprobando');
    } finally { setModeratingId(null); }
  };

  const reject = async (id:string) => { // esta para rechazar 
    if (!reasonText.trim()) { alert('Escribe una razón'); return; }
    setModeratingId(id);
    try {
      const updated = await moderateReview(id, 'rejected', reasonText.trim());
      setData(prev => prev.filter(r => r._id !== id));
      setReasonModal({ id:'', open:false });
      setReasonText('');
    } catch (e:any) {
      alert('Error rechazando');
    } finally { setModeratingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-slate-800">Moderación de Reviews</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={status} onChange={e => { setPage(1); setStatus(e.target.value as any); }} className="border rounded-md px-2 py-1 text-sm">
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          <select value={rating} onChange={e => { setPage(1); setRating(e.target.value ? Number(e.target.value) : ''); }} className="border rounded-md px-2 py-1 text-sm">
            <option value="">Todas ★</option>
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
          </select>
          <button onClick={() => load()} className="text-sm px-3 py-1 rounded-md bg-slate-200 hover:bg-slate-300 font-medium">Refrescar</button>
        </div>
      </div>
      {loading && <p className="text-sm text-slate-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && data.length === 0 && <p className="text-sm text-slate-500">No hay reviews en este estado.</p>}
      {data.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                <th className="px-3 py-2 text-left font-semibold">Empresa</th>
                <th className="px-3 py-2 text-left font-semibold">Autor</th>
                <th className="px-3 py-2 text-left font-semibold">Rating</th>
                <th className="px-3 py-2 text-left font-semibold">Contenido</th>
                <th className="px-3 py-2 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(r => {
                const date = new Date(r.createdAt).toLocaleDateString();
                const snippet = (r.content || r.title || '').slice(0, 90) + ((r.content || r.title || '').length > 90 ? '…' : '');
                return (
                  <tr key={r._id} className="border-t last:border-b">
                    <td className="px-3 py-2 whitespace-nowrap text-slate-700">{date}</td>
                    <td className="px-3 py-2 text-slate-700">{r.company?.name || '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{r.author ? `${r.author.firstName} ${r.author.lastName}` : '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{r.overallRating ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs">{snippet}</td>
                    <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                      {status === 'pending' ? (
                        <>
                          <button disabled={!!moderatingId} onClick={() => approve(r._id)} className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{moderatingId===r._id? '...' : 'Aprobar'}</button>
                          <button disabled={!!moderatingId} onClick={() => setReasonModal({ id:r._id, open:true })} className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Rechazar</button>
                        </>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.moderationStatus==='approved' ? 'bg-emerald-100 text-emerald-700' : r.moderationStatus==='rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{r.moderationStatus}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center flex-wrap">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 text-sm rounded-md border bg-white disabled:opacity-40">Prev</button>
          <span className="text-xs text-slate-600">Página {page} de {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 text-sm rounded-md border bg-white disabled:opacity-40">Next</button>
        </div>
      )}

      {reasonModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Razón de rechazo</h3>
            <textarea value={reasonText} onChange={e=>setReasonText(e.target.value)} className="w-full border rounded-md p-2 text-sm h-28" placeholder="Describe la razón" />
            <div className="flex justify-end gap-2">
              <button onClick={()=>{ setReasonModal({id:'',open:false}); setReasonText(''); }} className="px-3 py-1 text-xs rounded-md border bg-white">Cancelar</button>
              <button disabled={!!moderatingId} onClick={()=>reject(reasonModal.id)} className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{moderatingId===reasonModal.id? '...' : 'Rechazar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsModeration;
