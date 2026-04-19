import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Automatic error toast
    toast.error(message);
    
    if (error.response?.status === 403) {
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = '/register';
      }, 1500);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('isGhost');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/' && window.location.pathname !== '/setup') {
         window.location.href = '/login';
      }
    }
    
    // Log for developers
    console.error('API Error:', {
      status: error.response?.status,
      message,
      data: error.response?.data
    });

    return Promise.reject(error);
  }
);

export default api;
