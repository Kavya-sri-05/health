import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks for API calls
export const getWorkouts = createAsyncThunk(
  'workouts/getWorkouts',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/workouts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workouts');
    }
  }
);

export const addWorkout = createAsyncThunk(
  'workouts/addWorkout',
  async (workoutData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/workouts', workoutData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Workout added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add workout');
      return rejectWithValue(error.response?.data?.message || 'Failed to add workout');
    }
  }
);

export const updateWorkout = createAsyncThunk(
  'workouts/updateWorkout',
  async ({ id, workoutData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/workouts/${id}`, workoutData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Workout updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update workout');
      return rejectWithValue(error.response?.data?.message || 'Failed to update workout');
    }
  }
);

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/workouts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Workout deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete workout');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete workout');
    }
  }
);

const initialState = {
  workoutList: [],
  loading: false,
  error: null
};

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    clearWorkoutsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get workouts
      .addCase(getWorkouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkouts.fulfilled, (state, action) => {
        state.loading = false;
        state.workoutList = action.payload;
      })
      .addCase(getWorkouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add workout
      .addCase(addWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workoutList.unshift(action.payload);
      })
      .addCase(addWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update workout
      .addCase(updateWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.workoutList.findIndex(workout => workout._id === action.payload._id);
        if (index !== -1) {
          state.workoutList[index] = action.payload;
        }
      })
      .addCase(updateWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete workout
      .addCase(deleteWorkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.loading = false;
        state.workoutList = state.workoutList.filter(workout => workout._id !== action.payload);
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearWorkoutsError } = workoutSlice.actions;

export default workoutSlice.reducer;