/**
 * api/activityAPI.js — User Activity Log API calls
 */

import axiosInstance from './axiosInstance';

export const activityAPI = {
  getLogs: (params = {}) => axiosInstance.get('/activity/logs', { params }),

  getScans: (params = {}) => axiosInstance.get('/activity/scans', { params }),
};
