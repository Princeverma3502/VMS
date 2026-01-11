import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, QrCode, ClipboardList, UserCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const SecretaryBottomNav = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 pb-safe">
      {/* Dashboard Link */}
      <NavLink 
        to="/secretary/dashboard" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
        }
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-bold uppercase">Home</span>
      </NavLink>

      {/* Task Management Link */}
      <NavLink 
        to="/secretary/tasks" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
        }
      >
        <ClipboardList size={24} />
        <span className="text-[10px] font-bold uppercase">Tasks</span>
      </NavLink>

      {/* Primary Action: QR Scanner */}
      <NavLink 
        to="/secretary/scan" 
        className="relative -top-8 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200 border-4 border-white active:scale-90 transition-transform"
      >
        <QrCode size={28} />
      </NavLink>

      {/* User Management / Stats */}
      <NavLink 
        to="/admin/users" 
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
        }
      >
        <UserCircle size={24} />
        <span className="text-[10px] font-bold uppercase">Users</span>
      </NavLink>

      {/* Profile/Settings */}
      <NavLink 
        to={(() => {
          const roleRoutes = {
            'Secretary': '/secretary/profile',
            'Domain Head': '/domain-head/profile',
            'Associate Head': '/associate-head/profile',
            'Volunteer': '/volunteer/profile'
          };
          return roleRoutes[user?.role] || '/volunteer/profile';
        })()}
        className={({ isActive }) => 
          `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
        }
      >
        {user?.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-[10px] font-bold uppercase">Profile</span>
      </NavLink>
    </nav>
  );
};

export default SecretaryBottomNav;