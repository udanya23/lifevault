/**
 * api/dashboardAPI.js — Dashboard API client requests
 *
 * Communicates with the /dashboard routes.
 */

import axiosInstance from './axiosInstance';

export const dashboardAPI = {
  /**
   * Fetch user dashboard statistics and recent scan logs.
   *
   * @returns {Promise<object>} Axios promise containing stats, scans, and system logs
   */
  getDashboardData: () => axiosInstance.get('/dashboard'),
};
