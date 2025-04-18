import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks for API calls
export const getGoals = createAsyncThunk(
  'goals/getGoals',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/goals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
    }
  }
);

export const addGoal = createAsyncThunk(
  'goals/addGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/goals', goalData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Goal added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add goal');
      return rejectWithValue(error.response?.data?.message || 'Failed to add goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/goals/${id}`, goalData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Goal updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update goal');
      return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/goals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Goal deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete goal');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
    }
  }
);

const initialState = {
  goalList: [],
  loading: false,
  error: null
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get goals
      .addCase(getGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goalList = action.payload;
      })
      .addCase(getGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add goal
      .addCase(addGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goalList.unshift(action.payload);
      })
      .addCase(addGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goalList.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goalList[index] = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goalList = state.goalList.filter(goal => goal._id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearGoalsError } = goalSlice.actions;

export default goalSlice.reducer;