import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  // We handle redirects manually to keep the Authorization header
  maxRedirects: 0,
  validateStatus: (status) => status >= 200 && status < 300, // only 2xx are success
});

// Always attach the token from localStorage before each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 307 redirect, manually retry the request with the correct URL
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is a 307 and we haven't already retried
    if (error.response?.status === 307 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest.url = error.response.headers.location; // new URL (with trailing slash)
      return api(originalRequest);
    }
    // If 401, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;