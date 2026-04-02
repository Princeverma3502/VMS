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
    <aside className="h-full w-full bg-slate-900/95 backdrop-blur-xl text-white flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.2)] border-r border-white/5">
      
      {/* Senior Branding: Large 'Menu', Subtle 'NSS Portal' */}
      {!hideHeader && (
        <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/5 to-transparent">
          <div className="bg-white p-2 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] ring-1 ring-white/20 transform hover:scale-110 transition-transform duration-500">
            <img src="/logo.png" alt="NSS Logo" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] bg-white border border-slate-200 rounded-full object-contain p-1 shadow" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">Console</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mt-2 opacity-60">NSS OS v2.0</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto no-scrollbar">
        <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 opacity-50">Operational Modules</p>
        
        {currentMenu.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
              ${isActive 
                ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)] translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }
            `}
          >
            {/* Active Glow Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 group-[.active]:opacity-100 transition-opacity" />
            
            <span className={`transition-transform duration-300 group-hover:scale-110 ${item.path === window.location.pathname ? 'text-white' : 'text-current opacity-70 group-hover:opacity-100'}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
        <button 
          onClick={() => { localStorage.clear(); navigate('/login'); }}
          className="w-full py-4 px-5 text-xs font-black text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all flex items-center gap-3 group uppercase tracking-widest"
        >
           <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Sign Out System
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;