import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAchievements, updateClientSideAchievements } from '../store/slices/achievementSlice';
import AchievementsCollection from '../components/AchievementsCollection';
import { Award, Trophy } from 'lucide-react';
import Spinner from '../components/Spinner';

const AchievementsPage = () => {
  const dispatch = useDispatch();
  const { earnedBadges, loading } = useSelector(state => state.achievements);
  
  useEffect(() => {
    dispatch(getAchievements());
    dispatch(updateClientSideAchievements());
  }, [dispatch]);
  
  if (loading && !earnedBadges.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-gray-600">
          Track your progress and earn badges for your health journey
        </p>
      </div>
      
      {/* Progress overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Your Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center mb-2">
              <Award className="w-5 h-5 text-amber-500 mr-2" />
              <h3 className="font-medium text-amber-700">Badges Earned</h3>
            </div>
            <p className="text-3xl font-bold text-amber-600">{earnedBadges.length}</p>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center mb-2">
              <Flame className="w-5 h-5 text-emerald-500 mr-2" />
              <h3 className="font-medium text-emerald-700">Current Streak</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-600">7 days</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-blue-700">Level</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {Math.floor(earnedBadges.length / 5) + 1}
            </p>
          </div>
        </div>
      </div>
      
      {/* Achievements collection */}
      <AchievementsCollection />
    </div>
  );
};

// Missing imports
const Flame = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2}
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" 
    />
  </svg>
);

const Star = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
    />
  </svg>
);

export default AchievementsPage;