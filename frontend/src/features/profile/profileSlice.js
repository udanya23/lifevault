/**
 * features/profile/profileSlice.js — Profile & Contacts Redux Slice
 *
 * Manages user profile details and emergency contacts list state.
 * Syncs profile photo changes directly back to authSlice to ensure the global
 * header avatar stays synchronized automatically.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '@/api/profileAPI';
import { updateUser } from '../auth/authSlice';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to retrieve profile' }
      );
    }
  }
);

export const updateProfileDetails = createAsyncThunk(
  'profile/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update profile' }
      );
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileAPI.uploadPhoto(file);
      // Sync the new profile photo URL with the auth state (header initials fallback uploader)
      dispatch(updateUser({ profilePhoto: response.data.data.profilePhoto }));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Avatar upload failed' }
      );
    }
  }
);

export const fetchContacts = createAsyncThunk(
  'profile/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileAPI.getContacts();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to retrieve contacts' }
      );
    }
  }
);

export const addContact = createAsyncThunk(
  'profile/addContact',
  async (data, { rejectWithValue }) => {
    try {
      const response = await profileAPI.createContact(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add contact' }
      );
    }
  }
);

export const editContact = createAsyncThunk(
  'profile/editContact',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await profileAPI.updateContact(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update contact' }
      );
    }
  }
);

export const removeContact = createAsyncThunk(
  'profile/removeContact',
  async (id, { rejectWithValue }) => {
    try {
      await profileAPI.deleteContact(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete contact' }
      );
    }
  }
);

// ── Slice Configuration ────────────────────────────────────────────────────────

const initialState = {
  profile: null,
  contacts: [],
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch profile';
      })

      // Update Profile Details
      .addCase(updateProfileDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfileDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })

      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.data;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch contacts';
      })

      // Add Contact
      .addCase(addContact.fulfilled, (state, action) => {
        state.contacts.push(action.payload.data);
        // Sort contacts so primary contact stays on top
        state.contacts.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      })

      // Edit Contact
      .addCase(editContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex((c) => c._id === action.payload.data._id);
        if (index !== -1) {
          state.contacts[index] = action.payload.data;
        }
        // If updated contact is marked as primary, reset all other contacts
        if (action.payload.data.isPrimary) {
          state.contacts = state.contacts.map((c) =>
            c._id === action.payload.data._id ? c : { ...c, isPrimary: false }
          );
        }
        state.contacts.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      })

      // Delete Contact
      .addCase(removeContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearProfileError } = profileSlice.actions;

// Selectors
export const selectProfile = (state) => state.profile.profile;
export const selectContacts = (state) => state.profile.contacts;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileError = (state) => state.profile.error;

export default profileSlice.reducer;
