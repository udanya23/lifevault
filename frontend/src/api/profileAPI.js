/**
 * api/profileAPI.js — Profile & Emergency Contact API calls
 *
 * Implements Axios endpoints for:
 * - Profile details fetch & update
 * - Avatar profile photo uploading (via FormData)
 * - Emergency Contact list CRUD operations
 */

import axiosInstance from './axiosInstance';

export const profileAPI = {
  // ── Profile Operations ──────────────────────────────────────────────────────

  /**
   * Get user medical/personal profile details
   */
  getProfile: () => axiosInstance.get('/profile'),

  /**
   * Update user medical/personal profile details
   * @param {object} data - DOB, gender, bloodGroup, height, weight, address
   */
  updateProfile: (data) => axiosInstance.put('/profile', data),

  /**
   * Upload user profile photo
   * @param {File} file - Profile photo image file object
   */
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return axiosInstance.put('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ── Emergency Contact CRUD Operations ────────────────────────────────────────

  /**
   * Get all emergency contacts of the current user
   */
  getContacts: () => axiosInstance.get('/emergency-contacts'),

  /**
   * Add a new emergency contact
   * @param {object} data - Name, relationship, phone, isPrimary
   */
  createContact: (data) => axiosInstance.post('/emergency-contacts', data),

  /**
   * Update an existing emergency contact
   * @param {string} id - Contact Object ID
   * @param {object} data - Name, relationship, phone, isPrimary
   */
  updateContact: (id, data) => axiosInstance.put(`/emergency-contacts/${id}`, data),

  /**
   * Remove an emergency contact
   * @param {string} id - Contact Object ID
   */
  deleteContact: (id) => axiosInstance.delete(`/emergency-contacts/${id}`),
};
