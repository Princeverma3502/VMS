import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TemplateHologram = ({ user, accentColor, config, isBack }) => {
  if (isBack) {
    return (
      <div className="w-[320px] h-[500px] bg-white rounded-[2.5rem] flex flex-col items-center justify-center p-8 border border-slate-100 shadow-inner relative overflow-hidden">
        <div className="relative z-10 bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
           <QRCodeSVG value={user._id} size={180} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] opacity-40">Identity Verify</p>
        <p className="text-[8px] font-bold uppercase mt-2 opacity-60">{config.orgName}</p>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[500px] bg-white rounded-[2.5rem] p-6 flex flex-col relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(120deg, ${accentColor} 0%, transparent 50%, ${accentColor} 100%)` }} />
      
      <div className="flex justify-between items-center mb-4 relative z-10">
         {config.collegeLogo && <img src={config.collegeLogo} className="h-8 object-contain" alt="L"/>}
         {config.councilLogo && <img src={config.councilLogo} className="h-8 object-contain" alt="R"/>}
      </div>

      <div className="text-center relative z-10 mb-4">
         <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] leading-tight">{config.orgName}</p>
         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{config.subHeader}</p>
      </div>

      <div className="relative z-10 w-full aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl bg-white mx-auto" style={{ width: '144px', height: '144px' }}>
         <img src={user.profileImage || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="" />
      </div>

      <div className="relative z-10 mt-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{user.name}</h1>
        <p className="mt-3 inline-block px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm" style={{ color: accentColor }}>
          {user.role}
        </p>
      </div>

      <div className="mt-auto relative z-10 flex justify-between items-end bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
         <div>
            <p className="text-[8px] font-bold text-gray-400 uppercase">{config.labels?.rollNumber}</p>
            <p className="text-sm font-mono font-bold text-slate-600">{user.rollNumber}</p>
         </div>
         <div className="text-right">
            {config.signatureUrl && <img src={config.signatureUrl} className="h-8 opacity-60 mb-1" alt="Sign" />}
            <p className="text-[7px] font-bold text-gray-400 uppercase">{config.signatureName}</p>
         </div>
      </div>
    </div>
  );
};

export default TemplateHologram;