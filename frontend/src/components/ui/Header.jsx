import React, { useContext, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBranding from '../../hooks/useBranding';

const Header = ({ onOpenCommand }) => {
  const { logoUrl, primaryColor, collegeName, marqueeText } = useBranding();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
        {logoUrl && (
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="National Service Scheme" className="h-12 w-12 min-w-[3rem] min-h-[3rem] bg-white border border-slate-200 rounded-full object-contain p-1 shadow" />
            <span className="text-base font-black text-blue-700 uppercase tracking-tighter italic ml-2">National Service Scheme</span>
          </div>
        )}
        <div className="flex-1">
          <div className="cmd-palette flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-100 border border-slate-200 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Search className="text-slate-400" size={18} />
            <input
              onFocus={onOpenCommand}
              placeholder="Search people, missions or knowledge..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(query)}`); }}
              className="flex-1 bg-transparent placeholder-slate-400 outline-none text-slate-900 font-bold text-sm"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
             <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 border-t border-blue-600/30 py-2">
        <div className="max-w-5xl mx-auto px-4 text-sm text-white overflow-hidden">
          <div className="whitespace-nowrap animate-marquee font-semibold tracking-wide">{marqueeText || '🔥 No important messages at the moment'}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
