import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks for API calls
export const getMeals = createAsyncThunk(
  'meals/getMeals',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/meals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch meals');
    }
  }
);

export const addMeal = createAsyncThunk(
  'meals/addMeal',
  async (mealData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/meals', mealData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Meal added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add meal');
      return rejectWithValue(error.response?.data?.message || 'Failed to add meal');
    }
  }
);

export const updateMeal = createAsyncThunk(
  'meals/updateMeal',
  async ({ id, mealData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/meals/${id}`, mealData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Meal updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update meal');
      return rejectWithValue(error.response?.data?.message || 'Failed to update meal');
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/meals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Meal deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete meal');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete meal');
    }
  }
);

const initialState = {
  mealList: [],
  loading: false,
  error: null
};

const mealSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    clearMealsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get meals
      .addCase(getMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.mealList = action.payload;
      })
      .addCase(getMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add meal
      .addCase(addMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.mealList.unshift(action.payload);
      })
      .addCase(addMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update meal
      .addCase(updateMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.mealList.findIndex(meal => meal._id === action.payload._id);
        if (index !== -1) {
          state.mealList[index] = action.payload;
        }
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete meal
      .addCase(deleteMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.mealList = state.mealList.filter(meal => meal._id !== action.payload);
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMealsError } = mealSlice.actions;

export default mealSlice.reducer;