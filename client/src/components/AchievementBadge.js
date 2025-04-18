// client/src/components/AchievementBadge.js
import React from 'react';
import {
  Award,
  Flame,
  Footprints,
  Heart,
  Droplet,
  Utensils,
  Dumbbell,
  Pill,
  Bed,
  Clock,
  Calendar,
  Target,
  Zap,
  Trophy,
  Check,
  Star,
  BarChart3
} from 'lucide-react';

// Badge definitions with metadata
export const BADGE_TYPES = {
  // Streak badges
  'streak-3': { 
    icon: <Flame />,
    title: '3-Day Streak',
    description: 'Logged health data for 3 consecutive days',
    color: 'amber',
    category: 'consistency'
  },
  'streak-7': { 
    icon: <Flame />,
    title: '7-Day Streak',
    description: 'Maintained a 7-day activity streak',
    color: 'amber',
    category: 'consistency'
  },
  'streak-30': { 
    icon: <Flame />,
    title: '30-Day Streak',
    description: 'Completed an entire month of consistent tracking',
    color: 'orange',
    category: 'consistency'
  },
  'streak-90': { 
    icon: <Flame />,
    title: '90-Day Champion',
    description: 'Maintained activity for 3 consecutive months',
    color: 'red',
    category: 'consistency'
  },
  
  // Step badges
  'steps-5k': { 
    icon: <Footprints />,
    title: '5K Stepper',
    description: 'Reached 5,000 steps in a single day',
    color: 'green',
    category: 'activity'
  },
  'steps-10k': { 
    icon: <Footprints />,
    title: '10K Stepper',
    description: 'Reached 10,000 steps in a single day',
    color: 'green',
    category: 'activity'
  },
  'steps-15k': { 
    icon: <Footprints />,
    title: 'Step Master',
    description: 'Achieved 15,000 steps in a single day',
    color: 'green',
    category: 'activity'
  },
  'steps-100k': { 
    icon: <Footprints />,
    title: 'Century Stepper',
    description: 'Accumulated 100,000 steps in a week',
    color: 'emerald',
    category: 'activity'
  },
  
  // Heart rate badges
  'heart-zone-1': { 
    icon: <Heart />,
    title: 'Heart Zone I',
    description: 'Maintained heart rate in fat burning zone for 30 minutes',
    color: 'red',
    category: 'heart'
  },
  'heart-zone-2': { 
    icon: <Heart />,
    title: 'Heart Zone II',
    description: 'Maintained heart rate in cardio zone for 20 minutes',
    color: 'red',
    category: 'heart'
  },
  'heart-zone-3': { 
    icon: <Heart />,
    title: 'Heart Zone III',
    description: 'Reached peak heart rate zone during workout',
    color: 'red',
    category: 'heart'
  },
  
  // Workout badges
  'workout-first': { 
    icon: <Dumbbell />,
    title: 'First Workout',
    description: 'Completed your first workout',
    color: 'blue',
    category: 'workout'
  },
  'workout-5': { 
    icon: <Dumbbell />,
    title: 'Getting Strong',
    description: 'Completed 5 workouts',
    color: 'blue',
    category: 'workout'
  },
  'workout-20': { 
    icon: <Dumbbell />,
    title: 'Workout Warrior',
    description: 'Completed 20 workouts',
    color: 'blue',
    category: 'workout'
  },
  'workout-variety': { 
    icon: <Dumbbell />,
    title: 'Variety Pack',
    description: 'Tried 5 different workout types',
    color: 'indigo',
    category: 'workout'
  },
  
  // Nutrition badges
  'nutrition-track-7': { 
    icon: <Utensils />,
    title: 'Nutrition Tracker',
    description: 'Tracked all meals for 7 consecutive days',
    color: 'yellow',
    category: 'nutrition'
  },
  'nutrition-balanced': { 
    icon: <Utensils />,
    title: 'Balanced Diet',
    description: 'Maintained balanced macros for a week',
    color: 'yellow',
    category: 'nutrition'
  },
  
  // Medication badges
  'medication-adherence': { 
    icon: <Pill />,
    title: 'Medication Master',
    description: 'Took all medications on time for 7 days',
    color: 'purple',
    category: 'medication'
  },
  
  // Sleep badges
  'sleep-quality': { 
    icon: <Bed />,
    title: 'Quality Sleeper',
    description: 'Achieved 7+ hours of sleep for 5 consecutive days',
    color: 'blue',
    category: 'sleep'
  },
  
  // Achievement badges
  'achievements-5': { 
    icon: <Trophy />,
    title: 'Achievement Hunter',
    description: 'Earned 5 different badges',
    color: 'yellow',
    category: 'meta'
  },
  'achievements-10': { 
    icon: <Trophy />,
    title: 'Badge Collector',
    description: 'Earned 10 different badges',
    color: 'yellow',
    category: 'meta'
  },
  'achievements-25': { 
    icon: <Trophy />,
    title: 'Health Champion',
    description: 'Earned 25 different badges',
    color: 'yellow',
    category: 'meta'
  }
};

const AchievementBadge = ({ 
  type, 
  size = 'md', 
  earned = false, 
  progress = 100,
  onClick = null
}) => {
  if (!BADGE_TYPES[type]) {
    console.error(`Unknown badge type: ${type}`);
    return null;
  }
  
  const badge = BADGE_TYPES[type];
  
  // Size classes
  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-20 w-20 text-base',
    lg: 'h-24 w-24 text-lg'
  };
  
  // Icon size based on badge size
  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  return (
    <div 
      className={`relative flex flex-col items-center justify-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center`}>
        {/* Badge background - gray if not earned, colored if earned */}
        <div className={`absolute inset-0 rounded-full bg-${earned ? badge.color : 'gray'}-100 ${earned ? '' : 'opacity-50'}`}></div>
        
        {/* Progress ring - only show if progress < 100% and not earned */}
        {!earned && progress < 100 && (
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="8"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              stroke={`var(--color-${badge.color}-500, #6b7280)`}
              strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * progress / 100)}
              transform="rotate(-90 50 50)"
              className="transition-all duration-500 ease-in-out"
            />
          </svg>
        )}
        
        {/* Badge icon */}
        <div className={`${iconSizes[size] || iconSizes.md} text-${earned ? badge.color : 'gray'}-500 z-10`}>
          {badge.icon}
        </div>
        
        {/* Lock icon for unearned badges */}
        {!earned && (
          <div className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-1 border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className={`mt-2 text-center ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
        <div className={`font-medium text-xs ${size === 'lg' ? 'text-sm' : ''}`}>{badge.title}</div>
      </div>
    </div>
  );
};

export default AchievementBadge;