import api from './api';

// Register – JSON body (matches backend)
export const register = (userData) =>
  api.post('/auth/register', userData).then(res => res.data);

// Login – uses OAuth2 form data (matches backend's /login endpoint)
export const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);   // backend expects 'username' (which is the email)
  formData.append('password', password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(res => res.data);
};

// Get current user (Bearer token)
export const getMe = () =>
  api.get('/auth/me').then(res => res.data);

// Forgot password – JSON body
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then(res => res.data);

// Reset password – JSON body (new_password matches backend's expected field)
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', {
    token,
    new_password: newPassword
  }).then(res => res.data);