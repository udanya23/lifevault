/**
 * api/qrAPI.js — QR Code management API (authenticated)
 */

import axiosInstance from './axiosInstance';

export const qrAPI = {
  getMyQR: () => axiosInstance.get('/qr'),
  regenerateQR: () => axiosInstance.post('/qr/regenerate'),
};
