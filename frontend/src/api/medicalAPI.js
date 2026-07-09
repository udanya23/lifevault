/**
 * api/medicalAPI.js — Medical Info API requests
 *
 * Implements Axios requests to the /medical routes.
 */

import axiosInstance from './axiosInstance';

export const medicalAPI = {
  /**
   * Get user medical variables (allergies, chronic illnesses, medicines, notes)
   */
  getMedicalInfo: () => axiosInstance.get('/medical'),

  /**
   * Create or update user medical variables
   * @param {object} data - allergies, chronicDiseases, currentMedicines, medicalNotes
   */
  updateMedicalInfo: (data) => axiosInstance.put('/medical', data),
};
