import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { getApiKeyToken } from '@/lib/vercel-connect';

export { getApiKeyToken };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    try {
      const connectToken = await getApiKeyToken();
      if (connectToken) {
        config.headers['X-Vercel-Connect-Token'] = connectToken;
      }
    } catch {
      // Graceful fallback
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    if (error.response?.data) {
      const data = error.response.data;
      if (data.error) {
        if (typeof data.error === 'object') {
          if (data.error.name === 'ZodError' && Array.isArray(data.error.issues)) {
            error.response.data.error = data.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ');
          } else {
            error.response.data.error = JSON.stringify(data.error);
          }
        }
      } else if (data.message && typeof data.message === 'string') {
        error.response.data.error = data.message;
      } else if (typeof data === 'object' && data !== null) {
        error.response.data.error = data.message || JSON.stringify(data);
      }
    } else {
      error.message = typeof error.message === 'string' ? error.message : JSON.stringify(error);
    }

    return Promise.reject(error);
  }
);
