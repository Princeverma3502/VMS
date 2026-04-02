import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, QrCode, ClipboardList, UserCircle, Menu, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const SecretaryBottomNav = () => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center z-[100] pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {/* Dashboard Link */}
        <NavLink 
          to="/secretary/dashboard" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
          }
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </NavLink>

        {/* Task Management Link */}
        <NavLink 
          to="/secretary/tasks" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`
          }
        >
          <ClipboardList size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Tasks</span>
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
          <span className="text-[10px] font-black uppercase tracking-tighter">Users</span>
        </NavLink>

        {/* Menu Toggle (Consistent with BottomNav) */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Menu size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>

       {/* Full-Screen Mobile Drawer */}
       {isMenuOpen && (
         <div className="fixed inset-0 z-[110] bg-slate-900 flex flex-col animate-in fade-in slide-in-from-bottom-5">
            {/* Drawer Header with Logo and Back Button */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg">
                  <img src="/logo.png" alt="NSS Logo" className="w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white border border-slate-200 rounded-full object-contain p-1 shadow" />
                </div>
                <span className="text-white font-black uppercase tracking-widest text-sm">NSS Portal</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 active:scale-95 transition-all"
              >
                <X size={18} />
                <span>Back</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto" onClick={() => setIsMenuOpen(false)}>
             <Sidebar userRole={user?.role} hideHeader={true} />
           </div>
        </div>
      )}
    </>
  );
};

export default SecretaryBottomNav;