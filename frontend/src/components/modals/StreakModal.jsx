import React from 'react';
import { Flame, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

const StreakModal = ({ streak, onClose }) => {
  // Play success vibration when shown
  React.useEffect(() => {
    triggerHaptic('success');
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-3xl shadow-lg relative">
            <Flame size={64} className="text-white fill-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 mb-2">STREAK ON!</h2>
        <p className="text-gray-500 font-medium mb-6">
          You've logged in <span className="text-orange-600 font-bold">{streak} days</span> in a row. Keep the fire burning!
        </p>

        <button 
          onClick={onClose}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
        >
          Let's Go!
        </button>
      </div>
    </div>
  );
};

export default StreakModal;