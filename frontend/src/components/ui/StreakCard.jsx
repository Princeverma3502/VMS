import React from 'react';
import { Flame } from 'lucide-react';

const StreakCard = ({ days = 5 }) => {
  return (
    <div className="glass-card p-3 rounded-xl flex items-center gap-3">
      <div className="bg-white/10 p-3 rounded-lg">
        <Flame
          size={24}
          className={`${days > 10 ? 'animate-pulse text-orange-500' : 'text-white'}`}
        />
      </div>
      <div>
        <div className="text-xs text-white/80">Streak</div>
        <div className="text-lg font-bold text-white">{days} days</div>
      </div>
    </div>
  );
};

export default StreakCard;
