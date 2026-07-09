/**
 * api/adminAPI.js — Admin Panel API calls (admin role required)
 */

import axiosInstance from './axiosInstance';

export const adminAPI = {
  getAnalytics: () => axiosInstance.get('/admin/analytics'),

  getUsers: (params = {}) =>
    axiosInstance.get('/admin/users', { params }),

  updateUserStatus: (id, data) =>
    axiosInstance.patch(`/admin/users/${id}/status`, data),

  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),

  getReports: (params = {}) =>
    axiosInstance.get('/admin/reports', { params }),
};
