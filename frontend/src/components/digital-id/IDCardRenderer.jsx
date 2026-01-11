import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Globe } from 'lucide-react';

const IDCardRenderer = ({ user, config, verified, isBack }) => {
  if (!user) return null;

  // Design Constants
  const HEADER_COLOR = 'bg-[#2563eb]'; // Deep Blue
  
  // --- BACK SIDE ---
  if (isBack) {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 relative rounded-[2.5rem] overflow-hidden">
        <div className="z-10 bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4">
          <QRCodeSVG 
            value={JSON.stringify({ id: user._id, email: user.email, valid: !!user.isApproved })} 
            size={150}
            level="M"
          />
        </div>
        <h3 className="text-slate-900 font-black text-lg mb-1">SCAN TO VERIFY</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">NSS VOLUNTEER</p>
        
        <div className="w-full space-y-3 text-center">
           <p className="text-xs text-slate-600 font-semibold flex flex-col items-center gap-1">
             <MapPin size={16} className="text-blue-600" /> 
             {config.subHeader || "NSS Unit"}
           </p>
           <p className="text-xs text-slate-600 font-semibold flex flex-col items-center gap-1">
             <Globe size={16} className="text-blue-600" /> 
             www.nss.gov.in
           </p>
        </div>
      </div>
    );
  }

  // --- FRONT SIDE ---
  return (
    <div className="w-full h-full bg-white relative flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl font-sans">
      
      {/* 1. HEADER (35% Height) */}
      <div className={`${HEADER_COLOR} h-[35%] relative w-full`}>
        
        {/* Top Left: Sub-council / NSS Logo */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full p-1 shadow-md flex items-center justify-center overflow-hidden">
           {config.councilLogo ? (
             <img src={config.councilLogo} alt="NSS" className="w-full h-full object-contain" />
           ) : (
             <span className="text-[#2563eb] font-black text-[10px]">NSS</span>
           )}
        </div>

        {/* Top Right: College Logo */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-lg p-1 shadow-md flex items-center justify-center overflow-hidden">
           {config.collegeLogo ? (
             <img src={config.collegeLogo} alt="College" className="w-full h-full object-contain" />
           ) : (
             <span className="text-[#2563eb] font-black text-[10px]">CLG</span>
           )}
        </div>
      </div>

      {/* 2. OVERLAPPING AVATAR */}
      <div className="relative w-full flex justify-center -mt-16 mb-2">
        <div className="w-32 h-32 rounded-full border-[4px] border-white bg-white shadow-md overflow-hidden relative z-10 flex items-center justify-center">
          <img 
            src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
            alt="User" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* 3. NAME & BADGE */}
      <div className="text-center px-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
          {user.name}
        </h1>
        {/* Blue Pill Badge */}
        <span className={`${HEADER_COLOR} text-white px-6 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm inline-block`}>
          {user.role || 'VOLUNTEER'}
        </span>
      </div>

      {/* 4. DETAILS GRID (2x2) */}
      <div className="px-8 grid grid-cols-2 gap-y-4 gap-x-2 mb-auto">
        {/* Row 1 */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Roll No.</p>
          <p className="text-sm font-black text-slate-800 break-words leading-none">
            {user.rollNumber || '---'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Blood Group</p>
          {/* Shows Value or '---' in Red */}
          <p className="text-sm font-black text-red-600 tracking-wider leading-none">
            {user.bloodGroup || '---'}
          </p>
        </div>

        {/* Row 2 */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Branch</p>
          <p className="text-sm font-black text-slate-800 uppercase leading-none">{user.branch || '---'}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Year</p>
          <p className="text-sm font-black text-slate-800 uppercase leading-none">{user.year || '---'}</p>
        </div>
      </div>

      {/* 5. FOOTER */}
      <div className="px-8 pb-5 flex justify-between items-end mt-2">
        {/* Left: Valid Thru */}
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Valid Thru</p>
          <p className="text-xs font-black text-slate-900">{config.validThru || 'DEC 2025'}</p>
        </div>

        {/* Right: Auth Signature */}
        <div className="flex flex-col items-end">
          <div className="h-8 mb-1 flex items-end">
             {/* Dynamic Signature or Script Font */}
             <span className="font-script text-sm text-slate-800 font-bold italic" style={{ fontFamily: 'cursive' }}>
               {config.authName || "Prince Verma"}
             </span>
          </div>
          <div className="w-28 h-[1px] bg-slate-300 mb-1"></div>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">
            {config.designation || "Program Officer"}
          </p>
        </div>
      </div>

      {/* Bottom Stripe */}
      <div className={`${HEADER_COLOR} h-2 w-full absolute bottom-0`}></div>
    </div>
  );
};

export default IDCardRenderer;