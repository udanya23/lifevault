/**
 * api/axiosInstance.js — Configured Axios Instance
 *
 * Pattern aligned with proven job-portal auth flow:
 * - Access token in memory (Redux)
 * - Refresh token in httpOnly cookie
 * - Silent refresh on 401 with request queueing
 */

import axios from 'axios';
import store from '@/app/store';
import { setCredentials, clearCredentials } from '@/features/auth/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const AUTH_SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/refresh-token',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
];

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-otp', '/unauthorized'];

const isAuthRoute = (url = '') =>
  AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));

const isPublicPage = () => {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

/** Normalize LifeVault ApiResponse or flat job-portal style payloads */
export const extractAuthPayload = (responseData) => {
  const payload = responseData?.data ?? responseData ?? {};
  const accessToken = payload.accessToken || payload.token || null;
  const user = payload.user || null;
  return { accessToken, user };
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRoute(requestUrl)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const { accessToken, user } = extractAuthPayload(response.data);

      if (!accessToken) {
        throw new Error('Refresh response missing access token');
      }

      store.dispatch(setCredentials({ user, accessToken }));
      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      store.dispatch(clearCredentials());

      if (!isPublicPage()) {
        window.location.href = '/login?session=expired';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
