/**
 * features/medical/medicalSlice.js — Medical Information Redux Slice
 *
 * Manages state for critical medical details (allergies, conditions, medications).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicalAPI } from '@/api/medicalAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchMedicalInfo = createAsyncThunk(
  'medical/fetchMedicalInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await medicalAPI.getMedicalInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to retrieve medical info' }
      );
    }
  }
);

export const updateMedicalInfoDetails = createAsyncThunk(
  'medical/updateMedicalInfo',
  async (data, { rejectWithValue }) => {
    try {
      const response = await medicalAPI.updateMedicalInfo(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update medical info' }
      );
    }
  }
);

// ── Slice Configuration ────────────────────────────────────────────────────────

const initialState = {
  medical: null,
  isLoading: false,
  error: null,
};

const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    clearMedicalError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Medical Info
      .addCase(fetchMedicalInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicalInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medical = action.payload.data;
      })
      .addCase(fetchMedicalInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch medical info';
      })

      // Update Medical Details
      .addCase(updateMedicalInfoDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMedicalInfoDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medical = action.payload.data;
      })
      .addCase(updateMedicalInfoDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update medical info';
      });
  },
});

export const { clearMedicalError } = medicalSlice.actions;

// Selectors
export const selectMedical = (state) => state.medical.medical;
export const selectMedicalLoading = (state) => state.medical.isLoading;
export const selectMedicalError = (state) => state.medical.error;

export default medicalSlice.reducer;
