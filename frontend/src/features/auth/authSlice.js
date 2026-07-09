/**
 * features/auth/authSlice.js — Authentication Redux Slice
 *
 * Manages: user object, access token, loading, error, isAuthenticated
 *
 * The access token is stored in Redux state (in-memory) — NOT localStorage.
 * This is the secure approach: memory tokens can't be stolen via XSS.
 * The refresh token is stored in an httpOnly cookie (backend responsibility).
 *
 * On page refresh, we call the /refresh-token endpoint to get a new access
 * token using the httpOnly cookie — this is handled in axiosInstance.js.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/api/authAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * On success the backend sends a verification email but doesn't log in.
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Registration failed' }
      );
    }
  }
);

export const sendRegistrationOtp = createAsyncThunk(
  'auth/sendRegistrationOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendRegistrationOtp({ email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send OTP' });
    }
  }
);

export const verifyRegistrationOtp = createAsyncThunk(
  'auth/verifyRegistrationOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyRegistrationOtp({ email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Invalid OTP' });
    }
  }
);

export const sendForgotPasswordOtp = createAsyncThunk(
  'auth/sendForgotPasswordOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendForgotPasswordOtp({ email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send reset code' });
    }
  }
);

export const verifyForgotPasswordOtp = createAsyncThunk(
  'auth/verifyForgotPasswordOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyForgotPasswordOtp({ email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Invalid reset code' });
    }
  }
);

export const resetPasswordWithOtp = createAsyncThunk(
  'auth/resetPasswordWithOtp',
  async ({ email, otp, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPasswordWithOtp({ email, otp, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Password reset failed' });
    }
  }
);

/**
 * Login with email + password.
 * Returns user object + access token; refresh token set in httpOnly cookie.
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Clear any stale refresh cookie before creating a new session.
      try {
        await authAPI.logout();
      } catch {
        // Ignore — no active session to clear
      }

      const response = await authAPI.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      );
    }
  }
);

/**
 * Logout — calls backend to clear the httpOnly cookie.
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if the API call fails, we clear the local state
      return rejectWithValue(null);
    }
  }
);

/**
 * Refresh access token using the httpOnly cookie.
 * Called on app mount and when a 401 response is received.
 */
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      return response.data;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,           // Full user object from backend
  accessToken: null,    // In-memory JWT access token (NOT in localStorage)
  isAuthenticated: false,
  isLoading: false,     // For auth operations (login, register)
  isRefreshing: false,  // For silent token refresh on mount
  error: null,          // Last error message
  isInitialized: false, // True once we've checked for existing session on mount
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    /**
     * Directly set credentials — used after token refresh.
     * @param {object} payload - { user, accessToken }
     */
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },

    /**
     * Clear all auth state — used on logout or 401 with no valid refresh token.
     */
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    /**
     * Update only the user object (e.g. after profile photo change).
     */
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    /**
     * Clear any error state — call before opening a form/modal.
     */
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ── Register ────────────────────────────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload.data ?? action.payload;
        state.user = payload.user;
        state.accessToken = payload.accessToken || payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      });

    // ── Login ────────────────────────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload.data ?? action.payload;
        state.user = payload.user;
        state.accessToken = payload.accessToken || payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // ── Logout ───────────────────────────────────────────────────────────────
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear state regardless of API failure
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });

    // ── Refresh Token ─────────────────────────────────────────────────────────
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.isInitialized = true;
        const payload = action.payload.data ?? action.payload;
        state.user = payload.user;
        state.accessToken = payload.accessToken || payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isRefreshing = false;
        state.isInitialized = true; // Even on failure, initialization is done
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { setCredentials, clearCredentials, updateUser, clearAuthError } =
  authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
// Co-locating selectors with the slice — avoids prop-drilling and re-computation

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectIsRefreshing = (state) => state.auth.isRefreshing;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
