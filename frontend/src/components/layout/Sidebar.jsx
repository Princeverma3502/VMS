import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, Building2, Users, Settings, Gamepad2, 
  CheckSquare, QrCode, LogOut, Trophy, UserCircle, ShieldAlert, Heart, FileText, Award,
  Bot, Megaphone, Calendar, BarChart2, BookOpen
} from 'lucide-react';

const Sidebar = ({ userRole = 'Volunteer', hideHeader = false }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const menus = {
    Secretary: [
      { name: 'Dashboard', path: '/secretary/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Admin Scanner', path: '/secretary/scan', icon: <QrCode size={20} /> },
      { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} /> },
      { name: 'Meetings', path: '/meetings', icon: <Calendar size={20} /> },
      { name: 'Polls', path: '/polls', icon: <BarChart2 size={20} /> },
      { name: 'AI Assistant', path: '/assistant', icon: <Bot size={20} /> },
      { name: 'Certificates', path: '/admin/certificates', icon: <Award size={20} /> },
      { name: 'Impact Hub', path: '/impact', icon: <Heart size={20} /> },
      { name: 'Global Settings', path: '/settings', icon: <Settings size={20} /> },
    ],
    DomainHead: [
      { name: 'Dashboard', path: '/domain-head/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'My Domain', path: '/domain-head/volunteers', icon: <Users size={20} /> },
      { name: 'Tasks', path: '/volunteer/tasks', icon: <CheckSquare size={20} /> },
      { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} /> },
      { name: 'Meetings', path: '/meetings', icon: <Calendar size={20} /> },
      { name: 'Polls', path: '/polls', icon: <BarChart2 size={20} /> },
      { name: 'Impact Hub', path: '/impact', icon: <Heart size={20} /> },
      { name: 'Certificates', path: '/admin/certificates', icon: <Award size={20} /> },
    ],
    AssociateHead: [
      { name: 'Dashboard', path: '/volunteer/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Team Hub', path: '/domain-head/volunteers', icon: <Users size={20} /> },
      { name: 'Tasks', path: '/volunteer/tasks', icon: <CheckSquare size={20} /> },
      { name: 'Announcements', path: '/announcements', icon: <Megaphone size={20} /> },
      { name: 'Meetings', path: '/meetings', icon: <Calendar size={20} /> },
      { name: 'Polls', path: '/polls', icon: <BarChart2 size={20} /> },
      { name: 'Impact Hub', path: '/impact', icon: <Heart size={20} /> },
    ],
    Volunteer: [
      { name: 'Dashboard', path: '/volunteer/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'My Profile', path: '/volunteer/profile', icon: <UserCircle size={20} /> },
      { name: 'My Resume', path: '/volunteer/resume', icon: <FileText size={20} /> },
      { name: 'Scan QR', path: '/volunteer/qr-scanner', icon: <QrCode size={20} /> },
      { name: 'Tasks', path: '/volunteer/tasks', icon: <CheckSquare size={20} /> },
      { name: 'AI Assistant', path: '/assistant', icon: <Bot size={20} /> },
      { name: 'Knowledge Base', path: '/knowledge-base', icon: <BookOpen size={20} /> },
      { name: 'Leaderboard', path: '/volunteer/leaderboard', icon: <Trophy size={20} /> },
      { name: 'Certificates', path: '/volunteer/certificates', icon: <Award size={20} /> },
    ],
    Default: [{ name: 'Home', path: '/', icon: <LayoutDashboard size={20} /> }]
  };

  const normalizedRole = userRole?.replace(/\s+/g, '');
  const currentMenu = menus[normalizedRole] || menus['Volunteer'];

  return (
    // Force Dark Background (Slate-900) and White Text
    <aside className="h-full w-full bg-slate-900 text-white flex flex-col shadow-xl">
      
      {/* Senior Branding: Large 'Menu', Subtle 'NSS Portal' (Hidden when inside drawers) */}
      {!hideHeader && (
        <div className="p-6 border-b border-slate-700 flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-xl shadow-lg ring-1 ring-white/10">
            <img src="/logo.png" alt="NSS Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Menu</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-2">NSS Portal</p>
          </div>
        </div>
      )}

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
            {/* Icon (inherit color) */}
            <span className="text-current">
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