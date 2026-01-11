import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TemplateGradientFlow = ({ user, accentColor, config, isBack }) => {
  if (isBack) {
    return (
      <div className="w-[320px] h-[500px] flex flex-col items-center justify-center bg-white p-8 relative">
        <div className="bg-slate-50 p-6 rounded-[2rem] shadow-inner relative z-10 border border-slate-200">
            <QRCodeSVG value={user._id} size={180} />
        </div>
        <div className="mt-8 text-center relative z-10">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized By</p>
           <p className="text-xs font-black text-slate-800 uppercase mt-1 leading-tight">{config.orgName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[500px] bg-white flex flex-col overflow-hidden relative">
      <div className="h-[50%] w-full p-6 flex flex-col justify-center items-center relative shadow-lg" style={{ background: `linear-gradient(180deg, ${accentColor}, #ffffff)`, borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}>
         <div className="absolute top-4 w-full px-4 flex justify-between">
            {config.collegeLogo && <img src={config.collegeLogo} className="h-8 object-contain" alt="L"/>}
            {config.councilLogo && <img src={config.councilLogo} className="h-8 object-contain" alt="R"/>}
         </div>
         <div className="absolute top-14 text-center w-full px-4">
            <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">{config.orgName}</p>
         </div>
         <div className="w-36 h-36 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[5px] border-white z-10 bg-white mt-12">
           <img src={user.profileImage || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="" />
         </div>
      </div>

      <div className="flex-1 p-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-black text-slate-800 leading-tight">{user.name}</h1>
        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">{user.role}</p>
        <div className="mt-auto w-full flex justify-between items-end border-t border-slate-100 pt-4">
          <div className="text-left">
             <p className="text-[8px] font-bold text-slate-400 uppercase">{config.labels?.rollNumber}</p>
             <p className="text-sm font-black text-slate-800">{user.rollNumber}</p>
          </div>
          <div className="flex flex-col items-end">
             {config.signatureUrl && <img src={config.signatureUrl} className="h-8 mb-1" alt="Sign" />}
             <p className="text-[8px] font-bold text-slate-400 uppercase">{config.signatureRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGradientFlow;