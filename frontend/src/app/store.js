/**
 * app/store.js — Redux Toolkit Store
 *
 * Single source of truth for all frontend state.
 *
 * Slices registered here:
 *   - auth     → authentication state (user, token, loading)
 *   - profile  → user profile + emergency contacts
 *   - medical  → medical info
 *   - documents → uploaded documents
 *   - qr       → QR code data
 *   - admin    → admin panel state
 *   - ui       → global UI state (dark mode, sidebar open)
 *
 * We'll add slices as we build each module.
 * Redux DevTools are automatically enabled in development.
 */

import { configureStore } from '@reduxjs/toolkit';

// Feature slices — imported as we build each module
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import profileReducer from '@/features/profile/profileSlice';
import medicalReducer from '@/features/medical/medicalSlice';
import documentsReducer from '@/features/documents/documentSlice';
import qrReducer from '@/features/qr/qrSlice';
import adminReducer from '@/features/admin/adminSlice';
import activityReducer from '@/features/activity/activitySlice';
import timelineReducer from '@/features/timeline/timelineSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    profile: profileReducer,
    medical: medicalReducer,
    documents: documentsReducer,
    qr: qrReducer,
    admin: adminReducer,
    activity: activityReducer,
    timeline: timelineReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for Date objects in state
      // We store ISO strings, but this prevents false warnings
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }),

  // Redux DevTools are automatically enabled in development
  // and disabled in production by configureStore
  devTools: import.meta.env.DEV,
});

export default store;
