import React from 'react';

const Loader = ({ fullScreen = true }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-nss-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nss-blue font-semibold animate-pulse">Loading VMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <div className="w-8 h-8 border-4 border-nss-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;