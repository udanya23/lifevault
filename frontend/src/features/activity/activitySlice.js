/**
 * features/activity/activitySlice.js — Activity Log Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityAPI } from '@/api/activityAPI';

export const fetchActivityLogs = createAsyncThunk(
  'activity/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getLogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load activity logs' }
      );
    }
  }
);

export const fetchQRScans = createAsyncThunk(
  'activity/fetchScans',
  async (params, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getScans(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load QR scans' }
      );
    }
  }
);

const initialState = {
  logs: [],
  logsMeta: { page: 1, limit: 15, total: 0, totalPages: 0 },
  scans: [],
  scansMeta: { page: 1, limit: 15, total: 0, totalPages: 0 },
  isLoadingLogs: false,
  isLoadingScans: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.isLoadingLogs = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.isLoadingLogs = false;
        state.logs = action.payload.data;
        state.logsMeta = action.payload.meta || initialState.logsMeta;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.isLoadingLogs = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchQRScans.pending, (state) => {
        state.isLoadingScans = true;
        state.error = null;
      })
      .addCase(fetchQRScans.fulfilled, (state, action) => {
        state.isLoadingScans = false;
        state.scans = action.payload.data;
        state.scansMeta = action.payload.meta || initialState.scansMeta;
      })
      .addCase(fetchQRScans.rejected, (state, action) => {
        state.isLoadingScans = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearActivityError } = activitySlice.actions;

export const selectActivityLogs = (state) => state.activity.logs;
export const selectActivityLogsMeta = (state) => state.activity.logsMeta;
export const selectQRScans = (state) => state.activity.scans;
export const selectQRScansMeta = (state) => state.activity.scansMeta;
export const selectActivityLogsLoading = (state) => state.activity.isLoadingLogs;
export const selectQRScansLoading = (state) => state.activity.isLoadingScans;

export default activitySlice.reducer;
