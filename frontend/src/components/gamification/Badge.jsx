import React from 'react';
import { Medal, Lock } from 'lucide-react';

const Badge = ({ name, description, isUnlocked = false, earnedDate }) => {
  return (
    <div 
      className={`
        flex flex-col items-center p-4 rounded-xl border text-center transition-all duration-300 w-32 shrink-0
        ${isUnlocked 
          ? 'bg-white border-yellow-300 shadow-md scale-100' 
          : 'bg-slate-100 border-slate-200 opacity-60 grayscale'
        }
      `}
    >
      <div 
        className={`
          w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner
          ${isUnlocked ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-400'}
        `}
      >
        {isUnlocked ? <Medal size={32} /> : <Lock size={24} />}
      </div>
      
      <h4 className={`font-black text-sm mb-1 leading-tight ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
        {name}
      </h4>
      <p className="text-[10px] font-bold text-slate-500 leading-tight mb-2">
        {description}
      </p>
      
      {isUnlocked && earnedDate && (
        <span className="text-[9px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
          {new Date(earnedDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};

export default Badge;