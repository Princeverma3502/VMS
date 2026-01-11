import React from 'react';

const StatCard = ({ icon, label, value, type = 'default' }) => {
  
  // Color mapping strategy
  const colors = {
    default: 'bg-white border-l-4 border-nss-blue',
    success: 'bg-growth-light border-l-4 border-growth-green',
    gold: 'bg-gamification-accent border-l-4 border-gamification-gold',
    purple: 'bg-collab-light border-l-4 border-collab-purple'
  };

  // Text color mapping for the value
  const textColors = {
    default: 'text-nss-blue',
    success: 'text-growth-green',
    gold: 'text-yellow-600',
    purple: 'text-collab-purple'
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between ${colors[type]}`}>
      
      {/* Text Section */}
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <h3 className={`text-3xl font-bold ${textColors[type]}`}>
          {value}
        </h3>
      </div>

      {/* Icon Section - Bubble background */}
      <div className={`p-3 rounded-full bg-white bg-opacity-60 shadow-inner`}>
        <div className={textColors[type]}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;