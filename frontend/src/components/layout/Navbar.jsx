import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserCircle, Settings, ArrowLeft, Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDebounce } from '../../utils/debounce';

const Navbar = ({ userName = "User", showBackButton = false }) => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [realTimeUserName, setRealTimeUserName] = useState(user?.name || "User");
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  // navigation hook (declared once)
  const navigate = useNavigate();

  // Fetch real-time user name
  useEffect(() => {
    setRealTimeUserName(user?.name || userName || "User");
  }, [user?.name, userName]);

  // Constants
  const displayName = realTimeUserName;

  const handleProfileClick = () => {
    const roleRoutes = {
      'Secretary': '/secretary/profile',
      'Domain Head': '/domain-head/profile',
      'Volunteer': '/volunteer/profile'
    };
    const profileRoute = roleRoutes[user?.role] || '/volunteer/profile';
    navigate(profileRoute);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 mb-6 shadow-sm flex justify-between items-center sticky top-0 z-40">
      
      {/* 1. LEFT: Back Button or Search */}
      <div className="flex-1 flex items-center">
        {showBackButton ? (
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-700 font-bold hover:text-blue-600 transition bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
        ) : (
          <div className="relative w-full max-w-xs hidden sm:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search..." 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(query)}`); }}
               className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
             />
          </div>
        )}
      </div>

      {/* 2. RIGHT: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Unit Branding (Mobile Only) */}
        <div className="sm:hidden flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
            <img src="/logo.png" alt="NSS" className="w-5 h-5 object-contain" />
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter italic">NSS Portal</span>
        </div>
        {/* Notification Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-[-70px] sm:right-0 mt-4 px-4 sm:px-0 z-[60] w-screen max-w-[320px] sm:w-80 transform-gpu animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <p className="font-bold text-slate-900 text-sm italic tracking-tight">Notifications</p>
                   <span className="text-[10px] font-black text-blue-600 cursor-pointer uppercase tracking-widest hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-md">Mark all read</span>
                 </div>
                 <div className="max-h-80 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="text-slate-300" size={24} />
                   </div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">No new notifications</p>
                   <p className="text-[10px] text-slate-300 font-medium mt-1">We'll alert you when something happens.</p>
                 </div>
               </div>
            </div>
          )}
        </div>
        
        {/* User Profile Section (All Roles) */}
        {user && (
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{user?.role || 'User'}</p>
              <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
            </div>
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;