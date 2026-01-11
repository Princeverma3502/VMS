import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 border rounded-lg outline-none transition-all duration-200
          placeholder-gray-400 text-gray-900 bg-white
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;