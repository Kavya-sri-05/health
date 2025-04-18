import React from 'react';

const Spinner = ({ size = 'md', color = 'blue' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };
  
  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} rounded-full border-t-transparent animate-spin ${colorClass}`}></div>
    </div>
  );
};

export default Spinner;