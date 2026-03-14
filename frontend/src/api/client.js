// it is the base APi url
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Please login again');
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed');
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Please login again');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMsg = errorData.message || `Request failed (${res.status}: ${res.statusText})`;
    console.error(`Error on ${path}:`, errorMsg, errorData);
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Please login again');
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed');
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Please login again');
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Request failed');
  return res.json();
}


