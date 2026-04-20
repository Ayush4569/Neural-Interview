import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${api.defaults.baseURL}/user/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearUser();
        if (typeof window !== 'undefined' && !['/login', '/register', '/setup', '/'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
        toast.error(message);
        setTimeout(() => {
          if (typeof window !== 'undefined') window.location.href = '/register';
        }, 1500);
    } else if (error.response?.status !== 401) {
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
