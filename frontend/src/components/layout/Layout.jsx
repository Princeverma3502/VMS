import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import SecretaryBottomNav from './SecretaryBottomNav';
import Sidebar from './Sidebar';

const Layout = ({ children, showBackButton = true }) => {
  const { user } = useContext(AuthContext);
  
  const MobileNav = user?.role?.toLowerCase() === 'secretary' ? SecretaryBottomNav : BottomNav;

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      {/* 'hidden md:flex' means it SHOWS on screens wider than 768px */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 shadow-2xl">
        <Sidebar userRole={user?.role} />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col md:pl-64 h-full relative w-full transition-all duration-300">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <Navbar showBackButton={showBackButton} />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 no-scrollbar w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* --- MOBILE BOTTOM NAV --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
          <MobileNav />
        </div>
        
      </div>
    </div>
  );
};

export default Layout;