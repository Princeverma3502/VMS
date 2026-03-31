import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Trophy, Menu, Bot, QrCode, X, UserCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getHomePath = () => {
    const r = user?.role?.toLowerCase();
    if (r === 'secretary') return '/secretary/dashboard';
    if (r === 'domain head') return '/domain-head/dashboard';
    if (r === 'associate head') return '/associate-head/dashboard';
    return '/volunteer/dashboard';
  };

  const navItems = [
    { path: getHomePath(), icon: <LayoutGrid size={24} />, label: 'Home' },
    { path: '/volunteer/qr-scanner', icon: <QrCode size={24} />, label: 'Scan' },
    { path: '/assistant', icon: <Bot size={24} />, label: 'AI' },
    { path: '/volunteer/leaderboard', icon: <Trophy size={24} />, label: 'Rank' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[100] pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => triggerHaptic('success')}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 transition-all
              ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400'}
            `}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {item.label}
            </span>
          </NavLink>
        ))}
        
        {/* Profile Link (Replacing Menu for Students) */}
        <NavLink
          to={
            user?.role === 'Secretary' ? '/secretary/profile' :
            user?.role === 'Domain Head' ? '/domain-head/profile' :
            user?.role === 'Associate Head' ? '/associate-head/profile' :
            '/volunteer/profile'
          }
          onClick={() => triggerHaptic('success')}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all
            ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400'}
          `}
        >
          <UserCircle size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </NavLink>
      </div>
    </>
  );
};

export default BottomNav;