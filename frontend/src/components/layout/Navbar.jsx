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
      <div className="flex items-center gap-3">
        
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
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <p className="font-bold text-slate-900 text-sm">Notifications</p>
                <span className="text-xs font-bold text-blue-600 cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-4">
                <p className="text-slate-500 text-center text-xs font-medium">No new notifications</p>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-3 py-1 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-900 leading-none">{displayName}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mt-0.5">Online</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold overflow-hidden">
               {user?.profileImage ? (
                 <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <UserCircle size={24} />
               )}
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 md:hidden">
                <p className="font-bold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              
              <nav className="p-2 space-y-1">
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-700 text-sm font-bold flex items-center gap-3"
                >
                  <Settings size={18} className="text-slate-500" /> Settings
                </button>
                
              </nav>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;