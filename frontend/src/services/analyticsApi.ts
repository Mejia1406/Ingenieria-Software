export interface FetchAnalyticsParams {
  range: string;
  token: string | null;
  isAdmin: boolean;
  adminCompanyId?: string;
}

export async function fetchRecruiterAnalytics({ range, token, isAdmin, adminCompanyId }: FetchAnalyticsParams) {
  const baseUrl = process.env.REACT_APP_API_URL || 'https://ingenieria-software-production.up.railway.app';
  const query = new URLSearchParams({ range });
  if (isAdmin && adminCompanyId) query.set('companyId', adminCompanyId);
  const res = await fetch(`${baseUrl}/api/analytics/recruiter?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const msg = await res.json().catch(()=>({ message: 'Error desconocido' }));
    throw new Error(msg.message || 'Error al cargar analytics');
  }
  return res.json();
}
