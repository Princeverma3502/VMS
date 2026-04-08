import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_URL || 'https://vms-6qfs.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Look for token in both persistent and session storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout if token is expired (401)
    // 403 (Forbidden) should NOT cause logout, it should show an unauthorized message
    if (error.response && error.response.status === 401) {
       // Only redirect if not already on login page
       if (window.location.pathname !== '/login') {
           localStorage.removeItem('token');
           sessionStorage.removeItem('token');
           localStorage.removeItem('userRole');
           window.location.href = '/login';
       }
    }
    return Promise.reject(error);
  }
);

export default api;