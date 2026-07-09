/**
 * api/documentAPI.js — Secure Document Vault API calls
 *
 * Handles listing, uploading (multipart), and deleting user documents.
 * Upload field name must match backend multer config: 'documentFile'
 */

import axiosInstance from './axiosInstance';

export const documentAPI = {
  getDocuments: () => axiosInstance.get('/documents'),

  uploadDocument: (file, { name, type }) => {
    const formData = new FormData();
    formData.append('documentFile', file);
    formData.append('name', name);
    formData.append('type', type);
    return axiosInstance.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument: (id) => axiosInstance.delete(`/documents/${id}`),
};
