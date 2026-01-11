import React from 'react';

const StatCard = ({ xp = 420, level = 4, progress = 0.65 }) => {
  const stroke = 10;
  const size = 120;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="glass-card p-4 rounded-2xl shadow-lg flex items-center gap-4">
      <div className="relative w-28 h-28">
        <svg width={size} height={size} className="block">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} stroke="#e6eefc" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={radius} stroke="url(#g1)" strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm text-white/80">XP</div>
          <div className="text-xl font-bold text-white">{xp}</div>
          <div className="text-xs text-white/70">Level {level}</div>
        </div>
      </div>
      <div className="flex-1 text-white">
        <div className="text-sm font-medium">Experience</div>
        <div className="text-xs opacity-80 mt-1">Keep volunteering to level up and unlock badges.</div>
      </div>
    </div>
  );
};

export default StatCard;
