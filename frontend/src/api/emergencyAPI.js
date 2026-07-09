/**
 * api/emergencyAPI.js — Public Emergency Page API
 *
 * Uses plain axios (no auth) since this is accessed by QR scanners
 * who are not logged in.
 */

import axios from 'axios';

const emergencyClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000,
});

export const emergencyAPI = {
  getEmergencyInfo: (qrToken) =>
    emergencyClient.get(`emergency/${qrToken}`),
};
