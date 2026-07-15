/**
 * api/adminAPI.js — Admin Panel API calls (admin role required)
 */

import axiosInstance from './axiosInstance';

export const adminAPI = {
  getAnalytics: () => axiosInstance.get('/admin/analytics'),

  getUsers: (params = {}) =>
    axiosInstance.get('/admin/users', { params }),

  getUserDetail: (id) => axiosInstance.get(`/admin/users/${id}`),

  updateUserStatus: (id, data) =>
    axiosInstance.patch(`/admin/users/${id}/status`, data),

  updateUserRole: (id, data) =>
    axiosInstance.patch(`/admin/users/${id}/role`, data),

  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),

  getReports: (params = {}) =>
    axiosInstance.get('/admin/reports', { params }),

  // CSV exports (blob responses)
  exportUsers: () =>
    axiosInstance.get('/admin/export/users', { responseType: 'blob' }),

  exportActivity: (params = {}) =>
    axiosInstance.get('/admin/export/activity', { params, responseType: 'blob' }),

  exportScans: (params = {}) =>
    axiosInstance.get('/admin/export/scans', { params, responseType: 'blob' }),
};
