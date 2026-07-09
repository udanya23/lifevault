/**
 * api/authAPI.js — Authentication API Layer
 */

import axiosInstance from './axiosInstance';

export const authAPI = {
  // OTP Registration
  sendRegistrationOtp: (data) => axiosInstance.post('/auth/send-otp', data),
  verifyRegistrationOtp: (data) => axiosInstance.post('/auth/verify-otp', data),
  register: (data) => axiosInstance.post('/auth/register', data),

  // Core auth
  login: (data) => axiosInstance.post('/auth/login', data),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),

  // OTP Forgot password
  sendForgotPasswordOtp: (data) => axiosInstance.post('/auth/forgot-password/send-otp', data),
  verifyForgotPasswordOtp: (data) => axiosInstance.post('/auth/forgot-password/verify-otp', data),
  resetPasswordWithOtp: (data) => axiosInstance.post('/auth/forgot-password/reset', data),

  // Legacy (backward compatibility)
  verifyEmail: (token) => axiosInstance.get(`/auth/verify-email/${token}`),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  resetPassword: (token, data) => axiosInstance.post(`/auth/reset-password/${token}`, data),
  resendVerification: (data) => axiosInstance.post('/auth/resend-verification', data),
};
