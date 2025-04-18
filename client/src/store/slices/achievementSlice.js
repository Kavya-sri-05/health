import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BADGE_TYPES } from '../../components/AchievementBadge';

// Helper function to get a badge's detailed info
const getBadgeInfo = (badgeId) => {
  return BADGE_TYPES[badgeId] || null;
};

// Calculate if user meets criteria for streak badges
const calculateStreakBadges = (metrics) => {
  // Implementation would check for consecutive days of activity
  // This is a simplified version - in a real app this would be more comprehensive
  
  // Example implementations:
  
  // Check for 3-day streak
  const hasThreeDayStreak = metrics.length >= 3;
  
  // Check for 7-day streak
  const hasSevenDayStreak = metrics.length >= 7;
  
  // Check for 30-day streak
  const hasThirtyDayStreak = metrics.length >= 30;
  
  // Check for 90-day streak
  const hasNinetyDayStreak = metrics.length >= 90;
  
  return {
    'streak-3': hasThreeDayStreak ? 100 : Math.min(Math.floor((metrics.length / 3) * 100), 99),
    'streak-7': hasSevenDayStreak ? 100 : Math.min(Math.floor((metrics.length / 7) * 100), 99),
    'streak-30': hasThirtyDayStreak ? 100 : Math.min(Math.floor((metrics.length / 30) * 100), 99),
    'streak-90': hasNinetyDayStreak ? 100 : Math.min(Math.floor((metrics.length / 90) * 100), 99)
  };
};

// Calculate if user meets criteria for steps badges
const calculateStepsBadges = (metrics) => {
  // Find step metrics
  const stepMetrics = metrics.filter(metric => 
    metric.type === 'steps' || metric.stepsCount
  );
  
  if (stepMetrics.length === 0) {
    return {};
  }
  
  // Find max steps in a day
  const maxSteps = Math.max(...stepMetrics.map(m => m.value || m.stepsCount || 0));
  
  // Calculate weekly steps total (simplified)
  const weeklyStepsTotal = stepMetrics.reduce((total, current) => 
    total + (current.value || current.stepsCount || 0), 0
  );
  
  return {
    'steps-5k': maxSteps >= 5000 ? 100 : Math.min(Math.floor((maxSteps / 5000) * 100), 99),
    'steps-10k': maxSteps >= 10000 ? 100 : Math.min(Math.floor((maxSteps / 10000) * 100), 99),
    'steps-15k': maxSteps >= 15000 ? 100 : Math.min(Math.floor((maxSteps / 15000) * 100), 99),
    'steps-100k': weeklyStepsTotal >= 100000 ? 100 : Math.min(Math.floor((weeklyStepsTotal / 100000) * 100), 99)
  };
};

// Calculate if user meets criteria for heart rate badges
const calculateHeartRateBadges = (metrics) => {
  // Find heart rate metrics
  const heartRateMetrics = metrics.filter(metric => 
    metric.type === 'heartRate' || metric.heartRate
  );
  
  if (heartRateMetrics.length === 0) {
    return {};
  }
  
  // Simplified badge criteria (in a real app would be more sophisticated)
  return {
    'heart-zone-1': heartRateMetrics.length >= 5 ? 100 : Math.min(Math.floor((heartRateMetrics.length / 5) * 100), 99),
    'heart-zone-2': heartRateMetrics.length >= 10 ? 100 : Math.min(Math.floor((heartRateMetrics.length / 10) * 100), 99),
    'heart-zone-3': heartRateMetrics.length >= 15 ? 100 : Math.min(Math.floor((heartRateMetrics.length / 15) * 100), 99)
  };
};

// Calculate workout badges based on workout data
const calculateWorkoutBadges = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return {};
  }
  
  // Count total workouts
  const totalWorkouts = workouts.length;
  
  // Count unique workout types
  const uniqueWorkoutTypes = new Set(workouts.map(w => w.type)).size;
  
  return {
    'workout-first': totalWorkouts >= 1 ? 100 : 0,
    'workout-5': totalWorkouts >= 5 ? 100 : Math.min(Math.floor((totalWorkouts / 5) * 100), 99),
    'workout-20': totalWorkouts >= 20 ? 100 : Math.min(Math.floor((totalWorkouts / 20) * 100), 99),
    'workout-variety': uniqueWorkoutTypes >= 5 ? 100 : Math.min(Math.floor((uniqueWorkoutTypes / 5) * 100), 99)
  };
};

// Async thunks for fetching achievements from the server
export const getAchievements = createAsyncThunk(
  'achievements/getAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/achievements', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

// Update achievements on the client side based on metrics and other data
export const updateClientSideAchievements = createAsyncThunk(
  'achievements/updateClientSide',
  async (_, { getState }) => {
    const { 
      healthMetrics: { metrics }, 
      workouts: { workoutList },
      meals: { mealList },
      medications: { medicationList },
      achievements: { earnedBadges }
    } = getState();
    
    // Calculate badges progress
    const streakBadgesProgress = calculateStreakBadges(metrics);
    const stepsBadgesProgress = calculateStepsBadges(metrics);
    const heartRateBadgesProgress = calculateHeartRateBadges(metrics);
    const workoutBadgesProgress = calculateWorkoutBadges(workoutList);
    
    // Combine all badge progress
    const badgeProgress = {
      ...streakBadgesProgress,
      ...stepsBadgesProgress,
      ...heartRateBadgesProgress,
      ...workoutBadgesProgress
    };
    
    // Determine newly earned badges
    const newlyEarnedBadges = [];
    
    Object.entries(badgeProgress).forEach(([badgeId, progress]) => {
      if (progress === 100 && !earnedBadges.includes(badgeId)) {
        newlyEarnedBadges.push(badgeId);
      }
    });
    
    // Create in-progress badges
    const inProgressBadges = [];
    
    Object.entries(badgeProgress).forEach(([badgeId, progress]) => {
      if (progress < 100 && progress > 0) {
        inProgressBadges.push({
          id: badgeId,
          progress
        });
      }
    });
    
    // Find total earned badges count for meta achievements
    const totalEarnedCount = earnedBadges.length + newlyEarnedBadges.length;
    
    // Add meta achievements if thresholds are met
    if (totalEarnedCount >= 5 && !earnedBadges.includes('achievements-5') && !newlyEarnedBadges.includes('achievements-5')) {
      newlyEarnedBadges.push('achievements-5');
    }
    
    if (totalEarnedCount >= 10 && !earnedBadges.includes('achievements-10') && !newlyEarnedBadges.includes('achievements-10')) {
      newlyEarnedBadges.push('achievements-10');
    }
    
    if (totalEarnedCount >= 25 && !earnedBadges.includes('achievements-25') && !newlyEarnedBadges.includes('achievements-25')) {
      newlyEarnedBadges.push('achievements-25');
    }
    
    return {
      newlyEarnedBadges,
      inProgressBadges
    };
  }
);

const initialState = {
  achievements: [],
  earnedBadges: [],
  inProgressBadges: [],
  newAchievements: [],
  loading: false,
  error: null
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearNewAchievements: (state) => {
      state.newAchievements = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get achievements
      .addCase(getAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload;
        state.earnedBadges = action.payload.map(a => a.badgeId);
      })
      .addCase(getAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update client-side achievements
      .addCase(updateClientSideAchievements.fulfilled, (state, action) => {
        const { newlyEarnedBadges, inProgressBadges } = action.payload;
        
        // Add newly earned badges to the earned list
        state.earnedBadges = [...state.earnedBadges, ...newlyEarnedBadges];
        
        // Update in progress badges
        state.inProgressBadges = inProgressBadges;
        
        // Add newly earned badges to the notification queue
        state.newAchievements = [...state.newAchievements, ...newlyEarnedBadges];
      });
  }
});

export const { clearNewAchievements } = achievementSlice.actions;

export const receiveAchievementNotification = (achievement) => {
    return {
      type: 'achievements/receiveNotification',
      payload: achievement
    };
  };
  
export default achievementSlice.reducer;