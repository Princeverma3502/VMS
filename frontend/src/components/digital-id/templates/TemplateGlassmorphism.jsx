import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TemplateModernGlass = ({ user, accentColor, config, isBack }) => {
  if (isBack) {
    return (
      <div className="w-[320px] h-[500px] bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden text-white">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-2xl mb-4 relative z-10">
          <QRCodeSVG value={user._id} size={160} bgColor="#ffffff" />
        </div>
        <div className="mt-6 text-center relative z-10 opacity-70">
           <p className="text-[9px] uppercase tracking-widest">Return Property Of</p>
           <p className="text-xs font-bold mt-1 uppercase">{config.orgName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[500px] relative p-6 flex flex-col justify-between overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor}, #0f172a)` }}>
      <div className="relative z-10 border-b border-white/10 pb-4">
        <div className="flex justify-between items-center mb-2">
           {config.collegeLogo && <img src={config.collegeLogo} className="h-8 object-contain" alt="L"/>}
           {config.councilLogo && <img src={config.councilLogo} className="h-8 object-contain" alt="R"/>}
        </div>
        <p className="text-[12px] font-black text-white uppercase tracking-[0.1em] text-center leading-tight">{config.orgName}</p>
        <p className="text-[8px] font-bold text-white/60 uppercase mt-1 text-center">{config.subHeader}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-2xl">
          <img src={user.profileImage || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Profile" />
        </div>
        <h1 className="text-3xl font-black text-white mt-6 text-center leading-none drop-shadow-lg">{user.name}</h1>
        <span className="mt-3 px-5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">{user.role}</span>
      </div>

      <div className="relative z-10 bg-black/20 backdrop-blur-xl p-5 rounded-2xl border border-white/10 grid grid-cols-2 gap-4 text-white">
        <div>
          <p className="text-[8px] font-bold text-white/40 uppercase">{config.labels?.rollNumber}</p>
          <p className="text-sm font-mono font-bold tracking-wider">{user.rollNumber}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          {config.signatureUrl && <img src={config.signatureUrl} className="h-8 invert opacity-80 mb-1" alt="Sign" />}
          <p className="text-[7px] font-bold text-white/40 uppercase">{config.signatureName}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateModernGlass;