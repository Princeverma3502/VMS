import React from 'react';
import { Trophy } from 'lucide-react';

const LeaderboardCard = ({ rank, name, xp, isCurrentUser = false }) => {
  
  // Logic to color code the Top 3 ranks
  const getRankStyle = (r) => {
    switch(r) {
      case 1: return 'bg-yellow-100 text-yellow-700 border-yellow-300'; // Gold
      case 2: return 'bg-gray-200 text-gray-700 border-gray-300';       // Silver
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200'; // Bronze
      default: return 'bg-white text-gray-600 border-gray-100';
    }
  };

  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-lg border mb-2 transition-transform hover:scale-[1.01]
        ${isCurrentUser ? 'ring-2 ring-nss-blue ring-offset-1' : ''}
        ${rank <= 3 ? 'shadow-sm' : ''}
        ${getRankStyle(rank)}
      `}
    >
      <div className="flex items-center gap-3">
        {/* Rank Number Circle */}
        <div className={`
          w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
          ${rank === 1 ? 'bg-yellow-400 text-white' : 'bg-white/50'}
        `}>
          {rank === 1 ? <Trophy size={14} fill="white" /> : `#${rank}`}
        </div>
        
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{name}</span>
          {isCurrentUser && <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">You</span>}
        </div>
      </div>

      <div className="font-mono font-bold text-sm">
        {xp} XP
      </div>
    </div>
  );
};

export default LeaderboardCard;