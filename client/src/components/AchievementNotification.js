// client/src/components/AchievementNotification.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNewAchievements } from '../store/slices/achievementSlice';
import { BADGE_TYPES } from './AchievementBadge';
import confetti from 'canvas-confetti';

const AchievementNotification = () => {
  const dispatch = useDispatch();
  const { newAchievements } = useSelector((state) => state.achievements);
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [queue, setQueue] = useState([]);
  
  // Handle incoming new achievements
  useEffect(() => {
    if (newAchievements.length > 0) {
      setQueue(prev => [...prev, ...newAchievements]);
      dispatch(clearNewAchievements());
    }
  }, [newAchievements, dispatch]);
  
  // Process achievement queue
  useEffect(() => {
    if (queue.length > 0 && !showNotification) {
      // Get the next achievement
      const nextAchievement = queue[0];
      const badgeInfo = BADGE_TYPES[nextAchievement];
      
      if (badgeInfo) {
        setCurrentAchievement({
          id: nextAchievement,
          ...badgeInfo
        });
        setShowNotification(true);
        
        // Remove from queue
        setQueue(prev => prev.slice(1));
        
        // Trigger confetti effect
        triggerConfetti();
        
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
          setCurrentAchievement(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [queue, showNotification]);
  
  // Confetti effect when achievement is earned
  const triggerConfetti = () => {
    const defaults = {
      spread: 70,
      ticks: 50,
      gravity: 0.8,
      decay: 0.95,
      startVelocity: 30,
      shapes: ['square', 'circle'],
      colors: ['#ffd700', '#ffd000', '#daa520', '#FFD700', '#FFC000']
    };
    
    // Launch confetti from left side
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.1, y: 0.6 }
    });
    
    // Launch confetti from right side
    confetti({
      ...defaults,
      particleCount: 30,
      origin: { x: 0.9, y: 0.6 }
    });
  };
  
  // Handle manual close
  const handleClose = () => {
    setShowNotification(false);
    setCurrentAchievement(null);
  };
  
  if (!showNotification || !currentAchievement) {
    return null;
  }
  
  // Determine badge color class
  const colorClass = `bg-${currentAchievement.color}-50 border-${currentAchievement.color}-200 text-${currentAchievement.color}-700`;
  
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-slide-up">
      <div className={`p-4 rounded-lg shadow-lg border ${colorClass} flex items-center`}>
        <div className="flex-shrink-0 mr-3">
          <div className={`p-2 rounded-full bg-${currentAchievement.color}-100`}>
            {currentAchievement.icon}
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold">Achievement Unlocked!</h4>
          <p className="font-medium">{currentAchievement.title}</p>
          <p className="text-sm mt-1">{currentAchievement.description}</p>
        </div>
        
        <button
          onClick={handleClose}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;