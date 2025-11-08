import React, { useEffect, useState, useCallback } from 'react';
import { listRecruiterRequests, approveRecruiter, rejectRecruiter } from '../../services/recruiterApi';
import toast from 'react-hot-toast';

interface RequestItem {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  recruiterInfo?: {
    companyName?: string;
    companyEmail?: string;
    roleTitle?: string;
    status?: string;
    requestedAt?: string;
    adminNote?: string;
  }
}

const statusLabels: Record<string,string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado'
};

const AdminRecruiters: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'pending'|'approved'|'rejected'>('pending');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [error, setError] = useState('');
  const [noteModal, setNoteModal] = useState<{ userId: string; open: boolean }>({ userId: '', open: false });
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listRecruiterRequests(statusFilter);
      if (data.success) setItems(data.data.requests || []); else setError(data.message || 'Error cargando solicitudes');
    } catch (e) {
      setError('Error de red');
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      const res = await approveRecruiter(userId);
  if (!res.success) toast.error(res.message || 'Error aprobando'); else toast.success('Aprobado');
      await load();
    } finally { setActionLoadingId(''); }
  };

  const handleReject = async () => {
    const userId = noteModal.userId;
    setActionLoadingId(userId);
    try {
      const res = await rejectRecruiter(userId, rejectNote || undefined);
  if (!res.success) toast.error(res.message || 'Error rechazando'); else toast.success('Rechazado');
      setNoteModal({ userId: '', open: false });
      setRejectNote('');
      await load();
    } finally { setActionLoadingId(''); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Solicitudes de Reclutador</h1>
        <div className="flex gap-2">
          {(['pending','approved','rejected'] as const).map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded border text-sm ${statusFilter===s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >{statusLabels[s]}</button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <div className="bg-white shadow-sm border rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Usuario</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Empresa</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Correo Corp.</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Rol</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Solicitado</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Cargando...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No hay solicitudes</td></tr>
            )}
            {!loading && items.map(item => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-800">{item.firstName} {item.lastName}</div>
                  <div className="text-gray-500 text-xs">{item.email}</div>
                </td>
                <td className="px-4 py-2">{item.recruiterInfo?.companyName || '-'}</td>
                <td className="px-4 py-2">{item.recruiterInfo?.companyEmail || '-'}</td>
                <td className="px-4 py-2">{item.recruiterInfo?.roleTitle || '-'}</td>
                <td className="px-4 py-2">{item.recruiterInfo?.requestedAt ? new Date(item.recruiterInfo.requestedAt).toLocaleString() : '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.recruiterInfo?.status==='approved' ? 'bg-green-100 text-green-700': item.recruiterInfo?.status==='rejected' ? 'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{statusLabels[item.recruiterInfo?.status || 'pending']}</span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  {statusFilter==='pending' && (
                    <>
                      <button
                        disabled={actionLoadingId===item._id}
                        onClick={() => handleApprove(item._id)}
                        className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >{actionLoadingId===item._id ? '...' : 'Aprobar'}</button>
                      <button
                        disabled={actionLoadingId===item._id}
                        onClick={() => setNoteModal({ userId: item._id, open: true })}
                        className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >Rechazar</button>
                    </>
                  )}
                  {statusFilter!=='pending' && item.recruiterInfo?.adminNote && (
                    <span title={item.recruiterInfo.adminNote} className="text-gray-400 text-xs italic">nota</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {noteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Rechazar solicitud</h2>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={4}
              placeholder="Motivo (opcional)"
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            />
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => { setNoteModal({ userId: '', open: false }); setRejectNote(''); }} className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-50 text-sm">Cancelar</button>
              <button disabled={actionLoadingId===noteModal.userId} onClick={handleReject} className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50">{actionLoadingId===noteModal.userId ? '...' : 'Rechazar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecruiters;
