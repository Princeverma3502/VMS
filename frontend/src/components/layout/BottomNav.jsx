import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Trophy, User, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { AuthContext } from '../../context/AuthContext';

const BottomNav = () => {
  const { user } = useContext(AuthContext);

  const profileRoute = (() => {
    const roleRoutes = {
      'Secretary': '/secretary/profile',
      'Domain Head': '/domain-head/profile',
      'Associate Head': '/associate-head/profile',
      'Volunteer': '/volunteer/profile'
    };
    return roleRoutes[user?.role] || '/volunteer/profile';
  })();

  const navItems = [
    { path: '/volunteer/dashboard', icon: <LayoutGrid size={24} />, label: 'Tasks' },
    { path: '/volunteer/leaderboard', icon: <Trophy size={24} />, label: 'Rank' },
    { path: profileRoute, icon: <User size={24} />, label: 'Profile' },
  ];

  return (
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
    </div>
  );
};

export default BottomNav;