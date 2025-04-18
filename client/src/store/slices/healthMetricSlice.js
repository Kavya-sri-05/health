import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks for API calls
export const getHealthMetrics = createAsyncThunk(
  'healthMetrics/getHealthMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/health-metrics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch health metrics');
    }
  }
);

export const addHealthMetric = createAsyncThunk(
  'healthMetrics/addHealthMetric',
  async (metricData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/health-metrics', metricData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Health metric added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add health metric');
      return rejectWithValue(error.response?.data?.message || 'Failed to add health metric');
    }
  }
);

export const updateHealthMetric = createAsyncThunk(
  'healthMetrics/updateHealthMetric',
  async ({ id, metricData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/health-metrics/${id}`, metricData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Health metric updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update health metric');
      return rejectWithValue(error.response?.data?.message || 'Failed to update health metric');
    }
  }
);

export const deleteHealthMetric = createAsyncThunk(
  'healthMetrics/deleteHealthMetric',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/health-metrics/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Health metric deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete health metric');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete health metric');
    }
  }
);

export const getHealthMetricsByRange = createAsyncThunk(
  'healthMetrics/getHealthMetricsByRange',
  async ({ startDate, endDate, type }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/health-metrics/range`, {
        params: { startDate, endDate, type },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch health metrics by range');
    }
  }
);

const initialState = {
  metrics: [],
  rangeMetrics: [],
  loading: false,
  error: null,
  realtimeUpdates: 0 // Counter to trigger re-renders on realtime updates
};

const healthMetricSlice = createSlice({
  name: 'healthMetrics',
  initialState,
  reducers: {
    receiveRealtimeMetric: (state, action) => {
      // Add or update metric in the metrics array
      const existingIndex = state.metrics.findIndex(m => 
        m.type === action.payload.type && 
        m.date === action.payload.date
      );
      
      if (existingIndex !== -1) {
        state.metrics[existingIndex] = { ...state.metrics[existingIndex], ...action.payload };
      } else {
        state.metrics.push(action.payload);
      }
      
      // Increment realtime updates counter to trigger re-renders
      state.realtimeUpdates += 1;
    },
    clearHealthMetricsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get health metrics
      .addCase(getHealthMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHealthMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(getHealthMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add health metric
      .addCase(addHealthMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHealthMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics.unshift(action.payload);
      })
      .addCase(addHealthMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update health metric
      .addCase(updateHealthMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthMetric.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.metrics.findIndex(metric => metric._id === action.payload._id);
        if (index !== -1) {
          state.metrics[index] = action.payload;
        }
      })
      .addCase(updateHealthMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete health metric
      .addCase(deleteHealthMetric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHealthMetric.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = state.metrics.filter(metric => metric._id !== action.payload);
      })
      .addCase(deleteHealthMetric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get health metrics by range
      .addCase(getHealthMetricsByRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHealthMetricsByRange.fulfilled, (state, action) => {
        state.loading = false;
        state.rangeMetrics = action.payload;
      })
      .addCase(getHealthMetricsByRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { receiveRealtimeMetric, clearHealthMetricsError } = healthMetricSlice.actions;

export default healthMetricSlice.reducer;