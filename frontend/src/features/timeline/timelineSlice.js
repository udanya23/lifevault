/**
 * features/timeline/timelineSlice.js — Health Timeline Redux slice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { timelineAPI } from '@/api/timelineAPI';

export const fetchTimelineEvents = createAsyncThunk(
  'timeline/fetchEvents',
  async ({ page = 1, limit = 15, year, category, search, append = false }, { rejectWithValue }) => {
    try {
      const response = await timelineAPI.list({ page, limit, year, category, search });
      return { ...response.data, append };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to load timeline' });
    }
  }
);

export const fetchTimelineYears = createAsyncThunk(
  'timeline/fetchYears',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timelineAPI.getYears();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to load years' });
    }
  }
);

export const createTimelineEvent = createAsyncThunk(
  'timeline/createEvent',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await timelineAPI.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create event' });
    }
  }
);

export const updateTimelineEvent = createAsyncThunk(
  'timeline/updateEvent',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await timelineAPI.update(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update event' });
    }
  }
);

export const deleteTimelineEvent = createAsyncThunk(
  'timeline/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await timelineAPI.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete event' });
    }
  }
);

const initialState = {
  events: [],
  years: [],
  meta: { page: 1, limit: 15, total: 0, totalPages: 0, hasMore: false },
  filters: { year: '', category: '', search: '' },
  isLoading: false,
  isLoadingMore: false,
  isSubmitting: false,
  error: null,
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setTimelineFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetTimelineEvents: (state) => {
      state.events = [];
      state.meta = initialState.meta;
    },
    clearTimelineError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimelineEvents.pending, (state, action) => {
        const append = action.meta.arg?.append;
        if (append) state.isLoadingMore = true;
        else state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimelineEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const { data, meta, append } = action.payload;
        state.events = append ? [...state.events, ...data] : data;
        state.meta = meta || initialState.meta;
      })
      .addCase(fetchTimelineEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload?.message || 'Failed to load timeline';
      })

      .addCase(fetchTimelineYears.fulfilled, (state, action) => {
        state.years = action.payload.data || [];
      })

      .addCase(createTimelineEvent.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createTimelineEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.events.unshift(action.payload.data);
        state.meta.total += 1;
      })
      .addCase(createTimelineEvent.rejected, (state) => {
        state.isSubmitting = false;
      })

      .addCase(updateTimelineEvent.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateTimelineEvent.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.events.findIndex((e) => e._id === action.payload.data._id);
        if (idx !== -1) state.events[idx] = action.payload.data;
      })
      .addCase(updateTimelineEvent.rejected, (state) => {
        state.isSubmitting = false;
      })

      .addCase(deleteTimelineEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e._id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
      });
  },
});

export const { setTimelineFilters, resetTimelineEvents, clearTimelineError } = timelineSlice.actions;

export const selectTimelineEvents = (state) => state.timeline.events;
export const selectTimelineMeta = (state) => state.timeline.meta;
export const selectTimelineYears = (state) => state.timeline.years;
export const selectTimelineFilters = (state) => state.timeline.filters;
export const selectTimelineLoading = (state) => state.timeline.isLoading;
export const selectTimelineLoadingMore = (state) => state.timeline.isLoadingMore;
export const selectTimelineSubmitting = (state) => state.timeline.isSubmitting;

export default timelineSlice.reducer;
