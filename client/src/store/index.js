import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import healthMetricReducer from './slices/healthMetricSlice';
import workoutReducer from './slices/workoutSlice';
import mealReducer from './slices/mealSlice';
import medicationReducer from './slices/medicationSlice';
import goalReducer from './slices/goalSlice';
import achievementReducer from './slices/achievementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    healthMetrics: healthMetricReducer,
    workouts: workoutReducer,
    meals: mealReducer,
    medications: medicationReducer,
    goals: goalReducer,
    achievements: achievementReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in Redux actions
        ignoredActions: ['payload.date', 'payload.startDate', 'payload.endDate'],
        ignoredPaths: ['healthMetrics.metrics.date', 'workouts.workoutList.date'],
      },
    }),
});