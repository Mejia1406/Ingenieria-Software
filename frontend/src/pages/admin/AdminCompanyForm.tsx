import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminGetCompany, adminUpdateCompany } from '../../services/apiAdmin';

interface FormState { // Esta interfaz es para definir los campos que tiene el formulario
  name: string; industry: string; size: string; description?: string; website?: string; foundedYear?: number | ''; headquarters: { city: string; country: string }; isVerified: boolean;
}

const emptyForm: FormState = { name: '', industry: '', size: '1-10', description: '', website: '', foundedYear: '', headquarters: { city: '', country: '' }, isVerified: true }; // Este es el estado inicial del formulario

const AdminCompanyForm: React.FC = () => { 
  const { id } = useParams(); // esto es para obtener el id de la compañia que se va a editar o 'new' si es una nueva compañia
  const navigate = useNavigate(); // esto es para redirigir a otra pagina
  const isNew = id === 'new'; // esto es para saber si es una nueva compañia o no
  const [form, setForm] = useState<FormState>(emptyForm); // este es el estado del formulario
  const [loading, setLoading] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => { 
    const load = async () => {
      if (isNew) {
        // Si es nueva, resetear el formulario y salir porque no esta la logica de creacion de compañias todavia
        navigate('/admin/companies');
        return;
      }
      if (!isNew && id) {
        setLoading(true);
        try { // lo que hace este bloque de try es llamar a la funcion adminGetCompany que esta en apiAdmin.ts para obtener los datos de la compañia y luego setear esos datos en el estado del formulario
          const company = await adminGetCompany(id);
          setForm({
            name: company.name,
            industry: company.industry,
            size: company.size,
            description: (company as any).description || '',
            website: (company as any).website || '',
            foundedYear: (company as any).foundedYear || '',
            headquarters: company.headquarters || { city: '', country: '' },
            isVerified: company.isVerified
          });
        } catch (e:any) {
          setError(e.message || 'Error cargando compañía');
        } finally { setLoading(false); }
      }
    };
    load();
  }, [id, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { // esta funcion es para manejar los cambios en los campos del formulario y actualizar el estado del formulario
    const { name, value } = e.target; // extraer el nombre y el valor del campo que cambio
    if (name.startsWith('headquarters.')) {
      const key = name.split('.')[1] as 'city'|'country';
      setForm(f => ({ ...f, headquarters: { ...f.headquarters, [key]: value } }));
    } else if (name === 'foundedYear') {
      setForm(f => ({ ...f, foundedYear: value ? parseInt(value,10) : '' }));
    } else if (name === 'isVerified') {
      setForm(f => ({ ...f, isVerified: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { // esta funcion es para manejar el envio del formulario
    e.preventDefault();
    setSaving(true); setError(null); setValidationErrors([]);
    try {
      // Normalizar website si el usuario ingresó algo sin protocolo
      let website = form.website?.trim();
      if (website && !/^https?:\/\//i.test(website)) {
        website = 'https://' + website;
      }
      if (id) {
        await adminUpdateCompany(id, {
          name: form.name,
          industry: form.industry,
          size: form.size,
          description: form.description,
          website,
          foundedYear: form.foundedYear || undefined,
          headquarters: form.headquarters,
          isVerified: form.isVerified
        } as any);
      }
      navigate('/admin/companies');
    } catch (e:any) {
      if (e.response) {
        const data = e.response.data;
        setError(data?.message || data?.error || 'Error guardando');
        if (Array.isArray(data?.errors)) {
          const msgs = data.errors.map((er: any) => {
            const field = er.field || er.param || er.path || 'campo';
            const message = er.message || er.msg || 'inválido';
            return `${field}: ${message}`;
          });
          setValidationErrors(msgs);
        }
      } else {
        setError(e.message || 'Error guardando');
      }
    } finally { setSaving(false); }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{isNew ? 'Nueva Compañía' : 'Editar Compañía'}</h2>
      {error && <div className="mb-4 text-sm text-red-600 space-y-1">
        <div>{error}</div>
        {validationErrors.length > 0 && (
          <ul className="list-disc list-inside text-xs text-red-500 space-y-0.5">
            {validationErrors.map((v,i)=>(<li key={i}>{v}</li>))}
          </ul>
        )}
      </div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Industria *</label>
            <input name="industry" value={form.industry} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tamaño *</label>
            <select name="size" value={form.size} onChange={handleChange} className="w-full px-3 py-2 border rounded">
              {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Ciudad *</label>
            <input name="headquarters.city" value={form.headquarters.city} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">País *</label>
            <input name="headquarters.country" value={form.headquarters.country} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Website</label>
          <input name="website" value={form.website} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Año Fundación</label>
          <input type="number" name="foundedYear" value={form.foundedYear} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded" />
        </div>
        {!isNew && (
          <div className="flex items-center space-x-2">
            <input id="isVerified" type="checkbox" name="isVerified" checked={form.isVerified} onChange={handleChange} />
            <label htmlFor="isVerified" className="text-sm text-slate-700">Verificada</label>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" onClick={()=>navigate('/admin/companies')} className="px-5 py-2 border rounded-md text-sm font-medium">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default AdminCompanyForm;
