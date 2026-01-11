import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, Building2, Users, Settings, Gamepad2, 
  CheckSquare, QrCode, LogOut, Trophy, UserCircle, ShieldAlert, Heart, FileText
} from 'lucide-react';

const Sidebar = ({ userRole = 'Volunteer' }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const menus = {
    Secretary: [
      { name: 'Dashboard', path: '/secretary/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'NGOs', path: '/secretary/ngos', icon: <Building2 size={20} /> },
      { name: 'Domains', path: '/secretary/domains', icon: <Users size={20} /> },
      { name: 'Impact Hub', path: '/impact', icon: <Heart size={20} /> },
      { name: 'Global Settings', path: '/secretary/settings', icon: <Settings size={20} /> },
    ],
    Volunteer: [
      { name: 'Dashboard', path: '/volunteer/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'My Resume', path: '/volunteer/resume', icon: <FileText size={20} /> },
      { name: 'Leaderboard', path: '/volunteer/leaderboard', icon: <Trophy size={20} /> },
      { name: 'My Profile', path: '/volunteer/profile', icon: <UserCircle size={20} /> },
      { name: 'Tasks', path: '/volunteer/tasks', icon: <CheckSquare size={20} /> },
      { name: 'Scan QR', path: '/volunteer/qr-scanner', icon: <QrCode size={20} /> },
    ],
    Default: [{ name: 'Home', path: '/', icon: <LayoutDashboard size={20} /> }]
  };

  const currentMenu = menus[userRole] || menus['Volunteer'];

  return (
    // Force Dark Background (Slate-900) and White Text
    <aside className="h-full w-full bg-slate-900 text-white flex flex-col shadow-xl">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
          V
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide text-white">NSS Portal</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Volunteer System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu</p>
        
        {currentMenu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {/* Force Icon Color to inherit */}
            <span className={({ isActive }) => isActive ? 'text-white' : 'text-current'}>
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="w-full py-3 px-4 text-sm font-bold text-red-400 hover:text-white hover:bg-red-600/20 rounded-xl transition-all flex items-center gap-3"
        >
           <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;