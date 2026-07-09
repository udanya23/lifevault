/**
 * features/qr/qrSlice.js — QR Code Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { qrAPI } from '@/api/qrAPI';

export const fetchQRData = createAsyncThunk(
  'qr/fetchQRData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await qrAPI.getMyQR();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load QR data' }
      );
    }
  }
);

export const regenerateQR = createAsyncThunk(
  'qr/regenerateQR',
  async (_, { rejectWithValue }) => {
    try {
      const response = await qrAPI.regenerateQR();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to regenerate QR code' }
      );
    }
  }
);

const initialState = {
  qrToken: null,
  emergencyUrl: null,
  totalScans: 0,
  recentScans: [],
  visibleFields: [],
  hiddenFields: [],
  isLoading: false,
  isRegenerating: false,
  error: null,
};

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    clearQrError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQRData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQRData.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data;
        state.qrToken = data.qrToken;
        state.emergencyUrl = data.emergencyUrl;
        state.totalScans = data.totalScans;
        state.recentScans = data.recentScans;
        state.visibleFields = data.visibleFields;
        state.hiddenFields = data.hiddenFields;
      })
      .addCase(fetchQRData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch QR data';
      })

      .addCase(regenerateQR.pending, (state) => {
        state.isRegenerating = true;
      })
      .addCase(regenerateQR.fulfilled, (state, action) => {
        state.isRegenerating = false;
        state.qrToken = action.payload.data.qrToken;
        state.emergencyUrl = action.payload.data.emergencyUrl;
        state.totalScans = 0;
        state.recentScans = [];
      })
      .addCase(regenerateQR.rejected, (state, action) => {
        state.isRegenerating = false;
        state.error = action.payload?.message || 'Regeneration failed';
      });
  },
});

export const { clearQrError } = qrSlice.actions;

export const selectQRData = (state) => state.qr;
export const selectQRLoading = (state) => state.qr.isLoading;

export default qrSlice.reducer;
