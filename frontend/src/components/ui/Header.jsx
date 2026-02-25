import React, { useContext, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBranding from '../../hooks/useBranding';

const Header = ({ onOpenCommand }) => {
  const { logoUrl, primaryColor, collegeName, marqueeText } = useBranding();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/10" style={{ borderColor: primaryColor + '20' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {logoUrl && <img src={logoUrl} alt={collegeName} className="h-10 w-auto" />}
        <div className="flex-1">
          <div className="cmd-palette flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: primaryColor + '15' }}>
            <Search className="text-white/90" />
            <input
              onFocus={onOpenCommand}
              placeholder="Quick actions, search people or commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(query)}`); }}
              className="flex-1 bg-transparent placeholder-white/70 outline-none text-white"
            />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/90">
          <div className="text-sm">Welcome back</div>
          <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <div className="bg-transparent border-t border-white/5 py-2">
        <div className="max-w-5xl mx-auto px-4 text-sm text-white/80 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee">{marqueeText || '🔥 No important messages at the moment'}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
