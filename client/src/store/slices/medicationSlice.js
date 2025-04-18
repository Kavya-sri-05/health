import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks for API calls
export const getMedications = createAsyncThunk(
  'medications/getMedications',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/medications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medications');
    }
  }
);

export const addMedication = createAsyncThunk(
  'medications/addMedication',
  async (medicationData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/medications', medicationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Medication added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add medication');
      return rejectWithValue(error.response?.data?.message || 'Failed to add medication');
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medications/updateMedication',
  async ({ id, medicationData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/medications/${id}`, medicationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Medication updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update medication');
      return rejectWithValue(error.response?.data?.message || 'Failed to update medication');
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medications/deleteMedication',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/medications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Medication deleted successfully');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete medication');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete medication');
    }
  }
);

const initialState = {
  medicationList: [],
  loading: false,
  error: null
};

const medicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    clearMedicationsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get medications
      .addCase(getMedications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.medicationList = action.payload;
      })
      .addCase(getMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add medication
      .addCase(addMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medicationList.unshift(action.payload);
      })
      .addCase(addMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update medication
      .addCase(updateMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medicationList.findIndex(medication => medication._id === action.payload._id);
        if (index !== -1) {
          state.medicationList[index] = action.payload;
        }
      })
      .addCase(updateMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete medication
      .addCase(deleteMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medicationList = state.medicationList.filter(medication => medication._id !== action.payload);
      })
      .addCase(deleteMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMedicationsError } = medicationSlice.actions;

export default medicationSlice.reducer;