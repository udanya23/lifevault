/**
 * api/settingsAPI.js — Account Settings API calls
 */

import axiosInstance from './axiosInstance';

export const settingsAPI = {
  getAccount: () => axiosInstance.get('/users/me'),

  updateAccount: (data) => axiosInstance.patch('/users/me', data),

  changePassword: (data) => axiosInstance.patch('/users/me/password', data),

  deleteAccount: (data) => axiosInstance.delete('/users/me', { data }),
};
