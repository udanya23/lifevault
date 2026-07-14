/**
 * api/timelineAPI.js — Health Timeline API
 */

import axiosInstance from './axiosInstance';

export const timelineAPI = {
  list: (params = {}) => axiosInstance.get('/timeline', { params }),

  getYears: () => axiosInstance.get('/timeline/years'),

  getById: (id) => axiosInstance.get(`/timeline/${id}`),

  create: (formData) =>
    axiosInstance.post('/timeline', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    axiosInstance.put(`/timeline/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id) => axiosInstance.delete(`/timeline/${id}`),

  removeAttachment: (id, attachmentId) =>
    axiosInstance.delete(`/timeline/${id}/attachments/${attachmentId}`),
};
