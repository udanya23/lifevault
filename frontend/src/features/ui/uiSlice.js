/**
 * features/ui/uiSlice.js — Global UI State
 *
 * Manages:
 *   - Dark mode (toggled by user, persisted in localStorage)
 *   - Sidebar open/closed state (for mobile responsive layout)
 *   - Global loading overlay (for page-level transitions)
 */

import { createSlice } from '@reduxjs/toolkit';

// Read persisted dark mode preference from localStorage on store init
const getInitialDarkMode = () => {
  try {
    const stored = localStorage.getItem('lv_dark_mode');
    if (stored !== null) return JSON.parse(stored);
    // Fall back to OS preference if nothing is stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const initialState = {
  isDarkMode: getInitialDarkMode(),
  isSidebarOpen: false,    // Mobile sidebar (desktop always visible)
  isPageLoading: false,    // Full-page loading overlay
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    /**
     * Toggle dark mode and persist the preference.
     * The actual `class="dark"` on <html> is applied in App.jsx
     * by watching this state value.
     */
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      try {
        localStorage.setItem('lv_dark_mode', JSON.stringify(state.isDarkMode));
      } catch {
        // localStorage not available (private mode, etc.)
      }
    },

    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      try {
        localStorage.setItem('lv_dark_mode', JSON.stringify(action.payload));
      } catch {
        // ignore
      }
    },

    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },

    setPageLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  closeSidebar,
  setPageLoading,
} = uiSlice.actions;

// Selectors
export const selectIsDarkMode = (state) => state.ui.isDarkMode;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectIsPageLoading = (state) => state.ui.isPageLoading;

export default uiSlice.reducer;
