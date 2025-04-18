const mongoose = require('mongoose');
const User = require('../models/userModel');
const Workout = require('../models/workoutModel');
const HealthMetric = require('../models/healthMetricModel');
const Medication = require('../models/medicationModel');
const Achievement = require('../models/achievementModel');
const Goal = require('../models/goalModel');
const { sendAchievementNotification } = require('../websocket');

// Achievement definitions
const ACHIEVEMENTS = {
  // Consistency achievements
  CONSISTENCY_STREAK_3: {
    id: 'consistency_streak_3',
    name: 'Getting Started',
    description: 'Log health data for 3 consecutive days',
    category: 'consistency',
    icon: 'calendar-check',
    level: 'bronze'
  },
  CONSISTENCY_STREAK_7: {
    id: 'consistency_streak_7',
    name: 'Week Warrior',
    description: 'Log health data for 7 consecutive days',
    category: 'consistency',
    icon: 'calendar-check',
    level: 'silver'
  },
  CONSISTENCY_STREAK_30: {
    id: 'consistency_streak_30',
    name: 'Monthly Master',
    description: 'Log health data for 30 consecutive days',
    category: 'consistency',
    icon: 'calendar-check',
    level: 'gold'
  },
  
  // Activity achievements
  STEPS_5K: {
    id: 'steps_5k',
    name: '5K Steps',
    description: 'Record 5,000 steps in a single day',
    category: 'activity',
    icon: 'footprints',
    level: 'bronze'
  },
  STEPS_10K: {
    id: 'steps_10k',
    name: '10K Steps',
    description: 'Record 10,000 steps in a single day',
    category: 'activity',
    icon: 'footprints',
    level: 'silver'
  },
  STEPS_20K: {
    id: 'steps_20k',
    name: 'Step Master',
    description: 'Record 20,000 steps in a single day',
    category: 'activity',
    icon: 'footprints',
    level: 'gold'
  },
  
  // Heart achievements
  HEART_ZONE_10: {
    id: 'heart_zone_10',
    name: 'Heart Health Beginner',
    description: 'Spend 10 minutes in your target heart rate zone',
    category: 'heart',
    icon: 'heart',
    level: 'bronze'
  },
  HEART_ZONE_30: {
    id: 'heart_zone_30',
    name: 'Heart Health Enthusiast',
    description: 'Spend 30 minutes in your target heart rate zone',
    category: 'heart',
    icon: 'heart',
    level: 'silver'
  },
  HEART_ZONE_60: {
    id: 'heart_zone_60',
    name: 'Heart Health Master',
    description: 'Spend 60 minutes in your target heart rate zone',
    category: 'heart',
    icon: 'heart',
    level: 'gold'
  },
  
  // Workout achievements
  WORKOUT_FIRST: {
    id: 'workout_first',
    name: 'First Workout',
    description: 'Record your first workout',
    category: 'workout',
    icon: 'dumbbell',
    level: 'bronze'
  },
  WORKOUT_5: {
    id: 'workout_5',
    name: 'Workout Warrior',
    description: 'Complete 5 workouts',
    category: 'workout',
    icon: 'dumbbell',
    level: 'silver'
  },
  WORKOUT_20: {
    id: 'workout_20',
    name: 'Fitness Fanatic',
    description: 'Complete 20 workouts',
    category: 'workout',
    icon: 'dumbbell',
    level: 'gold'
  },
  
  // Nutrition achievements
  NUTRITION_FIRST: {
    id: 'nutrition_first',
    name: 'Nutrition Novice',
    description: 'Log your first meal',
    category: 'nutrition',
    icon: 'utensils',
    level: 'bronze'
  },
  NUTRITION_WEEK: {
    id: 'nutrition_week',
    name: 'Nutrition Tracker',
    description: 'Log meals for 7 consecutive days',
    category: 'nutrition',
    icon: 'utensils',
    level: 'silver'
  },
  NUTRITION_MONTH: {
    id: 'nutrition_month',
    name: 'Nutrition Expert',
    description: 'Log meals for 30 consecutive days',
    category: 'nutrition',
    icon: 'utensils',
    level: 'gold'
  },
  
  // Medication achievements
  MEDICATION_ADHERENCE_WEEK: {
    id: 'medication_adherence_week',
    name: 'Medication Manager',
    description: 'Take all medications as prescribed for a week',
    category: 'medication',
    icon: 'pill',
    level: 'silver'
  },
  MEDICATION_ADHERENCE_MONTH: {
    id: 'medication_adherence_month',
    name: 'Medication Master',
    description: 'Take all medications as prescribed for a month',
    category: 'medication',
    icon: 'pill',
    level: 'gold'
  },
  
  // Sleep achievements
  SLEEP_8HOURS: {
    id: 'sleep_8hours',
    name: 'Well Rested',
    description: 'Log 8+ hours of sleep',
    category: 'sleep',
    icon: 'moon',
    level: 'bronze'
  },
  SLEEP_WEEK: {
    id: 'sleep_week',
    name: 'Sleep Routine',
    description: 'Log 7+ hours of sleep for 7 consecutive days',
    category: 'sleep',
    icon: 'moon',
    level: 'silver'
  },
  
  // Goal achievements
  GOAL_FIRST: {
    id: 'goal_first',
    name: 'Goal Setter',
    description: 'Set your first health goal',
    category: 'goals',
    icon: 'target',
    level: 'bronze'
  },
  GOAL_COMPLETE_1: {
    id: 'goal_complete_1',
    name: 'Goal Achiever',
    description: 'Complete your first health goal',
    category: 'goals',
    icon: 'target',
    level: 'silver'
  },
  GOAL_COMPLETE_5: {
    id: 'goal_complete_5',
    name: 'Goal Master',
    description: 'Complete 5 health goals',
    category: 'goals',
    icon: 'target',
    level: 'gold'
  },
  
  // Meta achievements
  FIRST_SYNC: {
    id: 'first_sync',
    name: 'Connected',
    description: 'Connect your first fitness device',
    category: 'meta',
    icon: 'bluetooth',
    level: 'bronze'
  },
  ALL_BRONZE: {
    id: 'all_bronze',
    name: 'Bronze Collector',
    description: 'Earn all bronze achievements',
    category: 'meta',
    icon: 'award',
    level: 'special'
  },
  ALL_SILVER: {
    id: 'all_silver',
    name: 'Silver Collector',
    description: 'Earn all silver achievements',
    category: 'meta',
    icon: 'award',
    level: 'special'
  },
  ALL_GOLD: {
    id: 'all_gold',
    name: 'Gold Collector',
    description: 'Earn all gold achievements',
    category: 'meta',
    icon: 'award',
    level: 'special'
  }
};

// Helper to check if an achievement already exists for a user
const hasAchievement = async (userId, achievementId) => {
  const exists = await Achievement.findOne({
    user: userId,
    achievementId
  });
  
  return exists !== null;
};

// Helper to award an achievement to a user
const awardAchievement = async (userId, achievementData) => {
  // Check if already has achievement
  const hasAlready = await hasAchievement(userId, achievementData.id);
  if (hasAlready) return null;
  
  // Create achievement record
  const newAchievement = await Achievement.create({
    user: userId,
    achievementId: achievementData.id,
    name: achievementData.name,
    description: achievementData.description,
    category: achievementData.category,
    icon: achievementData.icon,
    level: achievementData.level,
    awardedAt: new Date()
  });
  
  // Send WebSocket notification
  sendAchievementNotification(userId.toString(), newAchievement);
  
  return newAchievement;
};

// Check for consistency achievements
const checkConsistencyAchievements = async (userId) => {
  const awarded = [];
  
  // Get all health metrics for this user, sorted by date
  const metrics = await HealthMetric.find({ user: userId })
    .sort({ date: 1 });
  
  if (!metrics.length) return awarded;
  
  // Find consecutive days streak
  const uniqueDates = new Set();
  metrics.forEach(metric => {
    const dateStr = new Date(metric.date).toISOString().split('T')[0];
    uniqueDates.add(dateStr);
  });
  
  const sortedDates = Array.from(uniqueDates).sort();
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    // Get date objects to compare
    const prevDate = new Date(sortedDates[i-1]);
    const currDate = new Date(sortedDates[i]);
    
    // Calculate difference in days
    const diffTime = Math.abs(currDate - prevDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  // Award achievements based on streak
  if (maxStreak >= 3 && !(await hasAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_3.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_3);
    if (achievement) awarded.push(achievement);
  }
  
  if (maxStreak >= 7 && !(await hasAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_7.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_7);
    if (achievement) awarded.push(achievement);
  }
  
  if (maxStreak >= 30 && !(await hasAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_30.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.CONSISTENCY_STREAK_30);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check for steps achievements
const checkStepsAchievements = async (userId, steps) => {
  const awarded = [];
  
  if (steps >= 5000 && !(await hasAchievement(userId, ACHIEVEMENTS.STEPS_5K.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.STEPS_5K);
    if (achievement) awarded.push(achievement);
  }
  
  if (steps >= 10000 && !(await hasAchievement(userId, ACHIEVEMENTS.STEPS_10K.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.STEPS_10K);
    if (achievement) awarded.push(achievement);
  }
  
  if (steps >= 20000 && !(await hasAchievement(userId, ACHIEVEMENTS.STEPS_20K.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.STEPS_20K);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check for workout achievements
const checkWorkoutAchievements = async (userId) => {
  const awarded = [];
  
  // Count workouts
  const workoutCount = await Workout.countDocuments({ user: userId });
  
  if (workoutCount >= 1 && !(await hasAchievement(userId, ACHIEVEMENTS.WORKOUT_FIRST.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.WORKOUT_FIRST);
    if (achievement) awarded.push(achievement);
  }
  
  if (workoutCount >= 5 && !(await hasAchievement(userId, ACHIEVEMENTS.WORKOUT_5.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.WORKOUT_5);
    if (achievement) awarded.push(achievement);
  }
  
  if (workoutCount >= 20 && !(await hasAchievement(userId, ACHIEVEMENTS.WORKOUT_20.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.WORKOUT_20);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check for goal achievements
const checkGoalAchievements = async (userId) => {
  const awarded = [];
  
  // Count goals
  const goalCount = await Goal.countDocuments({ user: userId });
  const completedGoalCount = await Goal.countDocuments({ 
    user: userId,
    status: 'completed'
  });
  
  if (goalCount >= 1 && !(await hasAchievement(userId, ACHIEVEMENTS.GOAL_FIRST.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.GOAL_FIRST);
    if (achievement) awarded.push(achievement);
  }
  
  if (completedGoalCount >= 1 && !(await hasAchievement(userId, ACHIEVEMENTS.GOAL_COMPLETE_1.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.GOAL_COMPLETE_1);
    if (achievement) awarded.push(achievement);
  }
  
  if (completedGoalCount >= 5 && !(await hasAchievement(userId, ACHIEVEMENTS.GOAL_COMPLETE_5.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.GOAL_COMPLETE_5);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check for medication achievements
const checkMedicationAchievements = async (userId) => {
  const awarded = [];
  
  // Get all medications for this user
  const medications = await Medication.find({ 
    user: userId,
    active: true
  });
  
  if (!medications.length) return awarded;
  
  // Calculate adherence over past week
  // This is a simplified example - in a real app, you'd track each medication intake
  const weekAdherence = Math.random() >= 0.7; // Simplified for example
  const monthAdherence = Math.random() >= 0.8; // Simplified for example
  
  if (weekAdherence && !(await hasAchievement(userId, ACHIEVEMENTS.MEDICATION_ADHERENCE_WEEK.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.MEDICATION_ADHERENCE_WEEK);
    if (achievement) awarded.push(achievement);
  }
  
  if (monthAdherence && !(await hasAchievement(userId, ACHIEVEMENTS.MEDICATION_ADHERENCE_MONTH.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.MEDICATION_ADHERENCE_MONTH);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check for meta achievements (all bronze, all silver, etc.)
const checkMetaAchievements = async (userId) => {
  const awarded = [];
  
  // Get all achievements for this user
  const userAchievements = await Achievement.find({ user: userId });
  
  // Check if user has all bronze achievements
  const bronzeAchievements = Object.values(ACHIEVEMENTS).filter(a => a.level === 'bronze');
  const hasBronzeIds = userAchievements
    .filter(a => a.level === 'bronze')
    .map(a => a.achievementId);
  
  const hasAllBronze = bronzeAchievements.every(a => 
    hasBronzeIds.includes(a.id)
  );
  
  if (hasAllBronze && !(await hasAchievement(userId, ACHIEVEMENTS.ALL_BRONZE.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.ALL_BRONZE);
    if (achievement) awarded.push(achievement);
  }
  
  // Check if user has all silver achievements
  const silverAchievements = Object.values(ACHIEVEMENTS).filter(a => a.level === 'silver');
  const hasSilverIds = userAchievements
    .filter(a => a.level === 'silver')
    .map(a => a.achievementId);
  
  const hasAllSilver = silverAchievements.every(a => 
    hasSilverIds.includes(a.id)
  );
  
  if (hasAllSilver && !(await hasAchievement(userId, ACHIEVEMENTS.ALL_SILVER.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.ALL_SILVER);
    if (achievement) awarded.push(achievement);
  }
  
  // Check if user has all gold achievements
  const goldAchievements = Object.values(ACHIEVEMENTS).filter(a => a.level === 'gold');
  const hasGoldIds = userAchievements
    .filter(a => a.level === 'gold')
    .map(a => a.achievementId);
  
  const hasAllGold = goldAchievements.every(a => 
    hasGoldIds.includes(a.id)
  );
  
  if (hasAllGold && !(await hasAchievement(userId, ACHIEVEMENTS.ALL_GOLD.id))) {
    const achievement = await awardAchievement(userId, ACHIEVEMENTS.ALL_GOLD);
    if (achievement) awarded.push(achievement);
  }
  
  return awarded;
};

// Check health metric for achievements
const checkHealthMetricAchievements = async (userId, metric) => {
  let awarded = [];
  
  // Check for specific metric achievements
  if (metric.type === 'steps') {
    const stepsAchievements = await checkStepsAchievements(userId, metric.value);
    awarded = [...awarded, ...stepsAchievements];
  }
  
  // Check for consistency achievements
  const consistencyAchievements = await checkConsistencyAchievements(userId);
  awarded = [...awarded, ...consistencyAchievements];
  
  // Check for meta achievements
  const metaAchievements = await checkMetaAchievements(userId);
  awarded = [...awarded, ...metaAchievements];
  
  return awarded;
};

// Export achievement utilities
module.exports = {
  ACHIEVEMENTS,
  hasAchievement,
  awardAchievement,
  checkStepsAchievements,
  checkConsistencyAchievements,
  checkWorkoutAchievements,
  checkGoalAchievements,
  checkMedicationAchievements,
  checkMetaAchievements,
  checkHealthMetricAchievements
};