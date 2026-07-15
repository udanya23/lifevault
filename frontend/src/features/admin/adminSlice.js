/**
 * features/admin/adminSlice.js — Admin Panel Redux Slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '@/api/adminAPI';

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load analytics' }
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load users' }
      );
    }
  }
);

export const fetchUserDetail = createAsyncThunk(
  'admin/fetchUserDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUserDetail(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load user detail' }
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserStatus(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update user status' }
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete user' }
      );
    }
  }
);

export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getReports(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to load reports' }
      );
    }
  }
);

const initialState = {
  analytics: null,
  users: [],
  usersMeta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  userDetail: null,
  reports: [],
  reportsMeta: { page: 1, limit: 20, total: 0, totalPages: 0, actions: [] },
  isLoadingAnalytics: false,
  isLoadingUsers: false,
  isLoadingUserDetail: false,
  isLoadingReports: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearUserDetail: (state) => {
      state.userDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoadingAnalytics = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoadingAnalytics = false;
        state.analytics = action.payload.data;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoadingAnalytics = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.users = action.payload.data;
        state.usersMeta = action.payload.meta || initialState.usersMeta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchUserDetail.pending, (state) => {
        state.isLoadingUserDetail = true;
        state.userDetail = null;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.isLoadingUserDetail = false;
        state.userDetail = action.payload.data;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.isLoadingUserDetail = false;
        state.error = action.payload?.message;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.users.findIndex(
          (u) => String(u._id) === String(updated.id)
        );
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            isSuspended: updated.isSuspended,
            isActive: updated.isActive,
          };
        }
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.usersMeta.total = Math.max(0, state.usersMeta.total - 1);
      })

      .addCase(fetchReports.pending, (state) => {
        state.isLoadingReports = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoadingReports = false;
        state.reports = action.payload.data;
        state.reportsMeta = action.payload.meta || initialState.reportsMeta;
      })
      .addCase(fetchReports.rejected, (state) => {
        state.isLoadingReports = false;
      });
  },
});

export const { clearAdminError, clearUserDetail } = adminSlice.actions;

export const selectAdminAnalytics = (state) => state.admin.analytics;
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminUsersMeta = (state) => state.admin.usersMeta;
export const selectAdminUserDetail = (state) => state.admin.userDetail;
export const selectAdminUserDetailLoading = (state) => state.admin.isLoadingUserDetail;
export const selectAdminReports = (state) => state.admin.reports;
export const selectAdminReportsMeta = (state) => state.admin.reportsMeta;
export const selectAdminReportsLoading = (state) => state.admin.isLoadingReports;
export const selectAdminLoading = (state) => state.admin.isLoadingAnalytics;
export const selectAdminUsersLoading = (state) => state.admin.isLoadingUsers;

export default adminSlice.reducer;
