// client/src/components/AchievementsCollection.js
import React, { useState } from 'react';
import AchievementBadge, { BADGE_TYPES } from './AchievementBadge';
import { X, Filter, Medal, Award } from 'lucide-react';

const AchievementsCollection = ({ 
  earnedBadges = [], 
  inProgressBadges = [],
  showLocked = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  // Calculate progress statistics
  const totalBadges = Object.keys(BADGE_TYPES).length;
  const earnedCount = earnedBadges.length;
  const progressCount = inProgressBadges.length;
  const completionPercentage = Math.round((earnedCount / totalBadges) * 100);
  
  // Get unique categories from badge definitions
  const categories = ['all', ...new Set(Object.values(BADGE_TYPES).map(badge => badge.category))];
  
  // Filter badges by selected category
  const filterBadges = (badges, category) => {
    if (category === 'all') return badges;
    return badges.filter(badgeId => BADGE_TYPES[badgeId]?.category === category);
  };
  
  const filteredEarned = filterBadges(earnedBadges, selectedCategory);
  
  // Get all badges that should be displayed (earned, in progress, or locked if showLocked is true)
  const getDisplayBadges = () => {
    // Start with earned badges
    const result = new Set(filteredEarned);
    
    // Add in-progress badges that match the filter
    filterBadges(inProgressBadges.map(b => b.id), selectedCategory).forEach(id => result.add(id));
    
    // If showing locked badges, add any remaining badges from the selected category
    if (showLocked) {
      Object.keys(BADGE_TYPES).forEach(badgeId => {
        if (selectedCategory === 'all' || BADGE_TYPES[badgeId].category === selectedCategory) {
          result.add(badgeId);
        }
      });
    }
    
    return Array.from(result);
  };
  
  const displayBadges = getDisplayBadges();
  
  // Handle badge click to show details
  const handleBadgeClick = (badgeId) => {
    setSelectedBadge(badgeId);
    setShowDetails(true);
  };
  
  // Close badge details modal
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedBadge(null);
  };
  
  // Get progress for badge
  const getBadgeProgress = (badgeId) => {
    const progressBadge = inProgressBadges.find(b => b.id === badgeId);
    return progressBadge ? progressBadge.progress : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Achievements
        </h3>
        
        <div className="flex items-center">
          <div className="text-sm mr-4">
            <span className="font-medium text-yellow-600">{earnedCount}</span>
            <span className="text-gray-500"> / {totalBadges} earned</span>
          </div>
          
          <div className="bg-gray-200 w-24 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-xs rounded-full capitalize transition-colors
              ${selectedCategory === category 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Badges grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-4">
        {displayBadges.map(badgeId => {
          const isEarned = earnedBadges.includes(badgeId);
          const inProgress = inProgressBadges.some(b => b.id === badgeId);
          const progress = inProgress ? getBadgeProgress(badgeId) : 0;
          
          return (
            <AchievementBadge
              key={badgeId}
              type={badgeId}
              earned={isEarned}
              progress={progress}
              onClick={() => handleBadgeClick(badgeId)}
            />
          );
        })}
      </div>
      
      {/* Badge details modal */}
      {showDetails && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button 
              onClick={closeDetails}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center">
              <AchievementBadge
                type={selectedBadge}
                size="lg"
                earned={earnedBadges.includes(selectedBadge)}
                progress={getBadgeProgress(selectedBadge)}
              />
              
              <h3 className="text-xl font-semibold mt-4">
                {BADGE_TYPES[selectedBadge].title}
              </h3>
              
              <p className="text-gray-600 text-center mt-2">
                {BADGE_TYPES[selectedBadge].description}
              </p>
              
              <div className="mt-4 w-full">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>
                    {earnedBadges.includes(selectedBadge) 
                      ? 'Completed!' 
                      : `${getBadgeProgress(selectedBadge)}%`}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${earnedBadges.includes(selectedBadge) ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${earnedBadges.includes(selectedBadge) ? 100 : getBadgeProgress(selectedBadge)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsCollection;