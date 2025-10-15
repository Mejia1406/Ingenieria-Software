const API_BASE = 'http://localhost:5000/api/recruiters';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface RecruiterRequestPayload {
  companyName: string;
  companyEmail: string;
  roleTitle?: string;
}

export async function requestRecruiterRole(payload: RecruiterRequestPayload) {
  const res = await fetch(`${API_BASE}/request`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getMyRecruiterRequest() {
  const res = await fetch(`${API_BASE}/me/request`, { headers: authHeaders() });
  return res.json();
}

export async function listRecruiterRequests(status: string = 'pending') {
  const res = await fetch(`${API_BASE}/requests?status=${status}`, { headers: authHeaders() });
  return res.json();
}

export async function approveRecruiter(userId: string) {
  const res = await fetch(`${API_BASE}/approve/${userId}`, {
    method: 'POST',
    headers: authHeaders()
  });
  return res.json();
}

export async function rejectRecruiter(userId: string, adminNote?: string) {
  const res = await fetch(`${API_BASE}/reject/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ adminNote })
  });
  return res.json();
}
