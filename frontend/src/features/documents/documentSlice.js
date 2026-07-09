/**
 * features/documents/documentSlice.js — Document Vault Redux Slice
 *
 * Manages uploaded documents list, upload/delete async operations,
 * and loading/error state for the Secure Documents page.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentAPI } from '@/api/documentAPI';

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentAPI.getDocuments();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to retrieve documents' }
      );
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, name, type }, { rejectWithValue }) => {
    try {
      const response = await documentAPI.uploadDocument(file, { name, type });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Document upload failed' }
      );
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentAPI.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete document' }
      );
    }
  }
);

const initialState = {
  documents: [],
  isLoading: false,
  isUploading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.data || [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch documents';
      })

      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.documents.unshift(action.payload.data);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload?.message || 'Upload failed';
      })

      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc._id !== action.payload);
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;

export const selectDocuments = (state) => state.documents.documents;
export const selectDocumentsLoading = (state) => state.documents.isLoading;
export const selectDocumentsUploading = (state) => state.documents.isUploading;
export const selectDocumentsError = (state) => state.documents.error;

export default documentSlice.reducer;
