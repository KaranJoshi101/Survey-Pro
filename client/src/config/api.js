import axios from 'axios';

function getApiBaseUrl() {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let url = envUrl.trim();
    if (process.env.NODE_ENV === 'production' && url.startsWith('http:')) {
      url = url.replace(/^http:/, 'https:');
    }
    return url.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[API CONFIG] REACT_APP_API_URL is not set in production. Falling back to https://api.drmanojdiwakar.org');
    return 'https://api.drmanojdiwakar.org';
  }

  console.error('[API CONFIG] REACT_APP_API_URL not set. Using default http://localhost:5000/api for development.');
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export async function apiFetch(path, options = {}) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL.replace(/\/$/, '')}${p}`;
  return fetch(url, options);
}

export default api;
