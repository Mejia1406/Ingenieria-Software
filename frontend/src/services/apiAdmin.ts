import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAdminStats() {
  const res = await axios.get(`${API_URL}/admin/stats`, { headers: authHeaders() });
  return res.data.data;
}

export interface AdminReview {
  _id: string;
  title?: string;
  content?: string;
  overallRating?: number;
  moderationStatus: string;
  createdAt: string;
  company?: { _id:string; name:string; slug:string };
  author?: { _id:string; firstName:string; lastName:string; userType:string };
}

export interface Paginated<T> { reviews: T[]; pagination: { page:number; limit:number; total:number; pages:number }; }

export async function listAdminReviews(params: { status?:string; rating?:number; page?:number; limit?:number; sortBy?:string; sortOrder?:string }) {
  const res = await axios.get(`${API_URL}/admin/reviews`, { headers: authHeaders(), params });
  return res.data.data as Paginated<AdminReview>;
}

export async function moderateReview(id: string, status: 'approved'|'rejected', reason?: string) {
  const res = await axios.patch(`${API_URL}/admin/reviews/${id}/moderate`, { status, reason }, { headers: authHeaders() });
  return res.data.data.review as AdminReview;
}

// Companies (Admin)
export interface AdminCompany {
  _id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  overallRating: number;
  totalReviews: number;
  isVerified: boolean;
  headquarters?: { city:string; country:string };
  createdAt: string;
  updatedAt: string;
}

export interface AdminListCompaniesResponse { companies: AdminCompany[]; pagination: { page:number; limit:number; total:number; pages:number }; }

export async function adminListCompanies(params: { page?:number; limit?:number; search?:string; industry?:string; verified?:string }) {
  const res = await axios.get(`${API_URL}/admin/companies`, { headers: authHeaders(), params });
  return res.data.data as AdminListCompaniesResponse;
}

export async function adminGetCompany(id: string) {
  const res = await axios.get(`${API_URL}/admin/companies/${id}`, { headers: authHeaders() });
  return res.data.data.company as AdminCompany;
}

export async function adminUpdateCompany(id:string, payload: Partial<AdminCompany>) {
  const res = await axios.put(`${API_URL}/admin/companies/${id}`, payload, { headers: authHeaders() });
  return res.data.data.company as AdminCompany;
}

export async function adminDeleteCompany(id:string) {
  await axios.delete(`${API_URL}/admin/companies/${id}`, { headers: authHeaders() });
  return true;
}
