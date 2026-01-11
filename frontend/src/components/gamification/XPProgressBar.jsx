import React from 'react';
import { Trophy, Star } from 'lucide-react';

const XPProgressBar = ({ currentXP, level }) => {
  // Logic: Calculate XP needed for next level (Example: Level * 1000)
  const nextLevelXP = level * 1000;
  
  // Calculate percentage (capped at 100%)
  const progressPercentage = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden mb-6">
      
      {/* Background decoration (faded trophy) */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Trophy size={80} className="text-black" />
      </div>

      <div className="flex justify-between items-end mb-3 relative z-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Level {level}</h2>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Cadet Volunteer</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-blue-700">{currentXP}</span>
          <span className="text-slate-600 font-bold text-sm"> / {nextLevelXP} XP</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        {/* Animated Bar */}
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-1000 ease-out relative"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Shine effect on the bar */}
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
        <span>Current Rank: Cadet</span>
        <span className="flex items-center gap-1 text-blue-700">
          {Math.floor(nextLevelXP - currentXP)} XP to Level Up <Star size={12} fill="currentColor" />
        </span>
      </div>
    </div>
  );
};

export default XPProgressBar;