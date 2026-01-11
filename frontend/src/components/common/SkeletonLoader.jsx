import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
