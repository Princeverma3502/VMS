import React from 'react';
import { Zap, Sparkles, Box, ShieldAlert } from 'lucide-react';

/**
 * EliteEmptyState - High-end replacement for empty lists
 */
export const EliteEmptyState = ({ 
  title = "No Data Found", 
  message = "This sector currently shows no activity.", 
  icon: Icon = Box,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
       <div className="relative mb-8">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full translate-y-4"></div>
          <div className="relative w-24 h-24 bg-white rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-center text-slate-200">
             <Icon size={48} className="opacity-50" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
             <Zap size={14} />
          </div>
       </div>

       <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{title}</h3>
       <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] max-w-[280px] leading-relaxed mx-auto italic">
         {message}
       </p>

       {actionLabel && onAction && (
         <button 
           onClick={onAction}
           className="mt-10 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
         >
           {actionLabel}
         </button>
       )}
    </div>
  );
};

/**
 * EliteSkeleton - Smooth shimmering loading state
 */
export const EliteSkeleton = ({ className = "h-24 w-full" }) => {
  return (
    <div className={`relative overflow-hidden bg-slate-100 rounded-3xl ${className}`}>
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
    </div>
  );
};

// Add shimmer animation via global style if not present (handled in index.css usually)
// For this standalone, we assume Tailwind 'animate-pulse' is a fallback or we add custom CSS.
