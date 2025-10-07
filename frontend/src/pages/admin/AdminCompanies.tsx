import React, { useEffect, useState } from 'react';
import { adminListCompanies, adminDeleteCompany, AdminCompany } from '../../services/apiAdmin'; // Todo esto son funciones del Api
import { Link, useNavigate } from 'react-router-dom'; 

const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]); // Esto es una lista de compañías
  const [loading, setLoading] = useState(false); //esto es lo que muestra el estado de carga o sea si esta cargando o no
  const [error, setError] = useState<string|null>(null); // para manejar posibless errores
  const [search, setSearch] = useState(''); // para hacer busquedas
  const [page, setPage] = useState(1); // para saber la pagina actual en la que estamos
  const [pages, setPages] = useState(1); // esto es para saber el total de paginas
  const [industryFilter, setIndustryFilter] = useState(''); // esto es para filtrar por industria
  const [verifiedFilter, setVerifiedFilter] = useState(''); // "" por verificados o no
  const navigate = useNavigate(); 

  const load = async () => { // funcion para cargar las compañias
    setLoading(true); setError(null);
    try { // lo que hace este bloque de try es llamar a la funcion adminListCompanies que esta en apiAdmin.ts para tener la lista de compañias
      const res = await adminListCompanies({ page, limit: 20, search: search || undefined, industry: industryFilter || undefined, verified: verifiedFilter || undefined });
      setCompanies(res.companies);
      setPages(res.pagination.pages); 
    } catch (e:any) {
      setError(e.message || 'Error cargando compañías');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]); // cada vez que cambie la pagina se vuelve a cargar la lista y ese comentario de dentro es para que no de error
  useEffect(() => { setPage(1); load(); /* eslint-disable-next-line */ }, [search, industryFilter, verifiedFilter]);

  const handleDelete = async (id:string) => { // funcion para eliminar una compañia
    if (!window.confirm('¿Eliminar esta compañía?.')) return;
    try { // lo que hace este bloque de try es llamar a la funcion adminDeleteCompany que esta en apiAdmin.ts para eliminar una compañia y luego actualizar la lista de compañias en el estado
      await adminDeleteCompany(id);
      setCompanies(prev => prev.filter(c => c._id !== id)); // el prev es el estado anterior de companies y se filtra para eliminar la compañia que se acaba de borrar(c._id !== id significa que se queda con todas las compañias menos la que tiene el id que se borra)
    } catch (e:any) {
      alert(e.message || 'Error eliminando');
    }
  };

  return ( // esto es el diseño de la pagina
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Compañías</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input placeholder="Buscar nombre o descripción" value={search} onChange={e=>setSearch(e.target.value)} className="col-span-2 px-3 py-2 border rounded-md text-sm" />
        <input placeholder="Industria" value={industryFilter} onChange={e=>setIndustryFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm" />
        <select value={verifiedFilter} onChange={e=>setVerifiedFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
          <option value="">Verificadas?</option>
          <option value="true">Solo verificadas</option>
            <option value="false">No verificadas</option>
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Nombre</th>
              <th className="text-left px-3 py-2 font-semibold">Industria</th>
              <th className="text-left px-3 py-2 font-semibold">Tamaño</th>
              <th className="text-left px-3 py-2 font-semibold">Verificada</th>
              <th className="text-left px-3 py-2 font-semibold">Rating</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Cargando...</td></tr>
            )}
            {!loading && companies.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Sin resultados</td></tr>
            )}
            {companies.map(c => (
              <tr key={c._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-800"><Link to={`/admin/companies/${c._id}`} className="hover:underline">{c.name}</Link></td>
                <td className="px-3 py-2">{c.industry}</td>
                <td className="px-3 py-2">{c.size}</td>
                <td className="px-3 py-2">{c.isVerified ? 'Sí' : 'No'}</td>
                <td className="px-3 py-2">{(typeof c.overallRating === 'number' && !isNaN(c.overallRating) ? c.overallRating.toFixed(1) : '0.0')} <span className="text-xs text-slate-500">({(c as any).totalReviews ?? 0})</span></td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={()=>navigate(`/admin/companies/${c._id}`)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={()=>handleDelete(c._id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Página {page} de {pages}</span>
        <div className="space-x-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 border rounded disabled:opacity-40">Anterior</button>
          <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded disabled:opacity-40">Siguiente</button>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default AdminCompanies;
