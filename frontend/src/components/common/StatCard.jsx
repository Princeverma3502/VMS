import React from 'react';

const StatCard = ({ icon, label, value, type = 'default' }) => {
  
  // Color mapping strategy - using real Tailwind classes
  const colors = {
    default: 'bg-white border-l-4 border-blue-700',
    success: 'bg-emerald-50 border-l-4 border-emerald-600',
    gold: 'bg-yellow-50 border-l-4 border-yellow-500',
    purple: 'bg-purple-50 border-l-4 border-purple-700'
  };

  // Text color mapping for the value
  const textColors = {
    default: 'text-blue-700',
    success: 'text-emerald-700',
    gold: 'text-yellow-600',
    purple: 'text-purple-700'
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between ${colors[type]}`}>
      
      {/* Text Section */}
      <div>
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
          {label}
        </p>
        <h3 className={`text-3xl font-bold ${textColors[type]}`}>
          {value}
        </h3>
      </div>

      {/* Icon Section - Bubble background */}
      <div className="p-3 rounded-full bg-white bg-opacity-60 shadow-inner">
        <div className={textColors[type]}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;