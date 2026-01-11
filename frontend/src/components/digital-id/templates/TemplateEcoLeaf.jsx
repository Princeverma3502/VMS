import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TemplateEcoLeaf = ({ user, accentColor, config, isBack }) => {
  const leafColor = accentColor === '#1d4ed8' ? '#15803d' : accentColor; 

  if (isBack) {
    return (
      <div className="w-[320px] h-[500px] bg-[#fdfcf0] flex flex-col items-center justify-center p-8 border-8 border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-[100px] opacity-50"></div>
        <div className="bg-white p-2 rounded-xl">
           <QRCodeSVG value={user._id} size={180} fgColor={leafColor} />
        </div>
        <div className="mt-8 text-center relative z-10">
           <p className="text-xs font-serif italic text-gray-500">Scan to verify member</p>
           <p className="text-xs font-bold text-gray-800 uppercase mt-1">{config.orgName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[500px] bg-[#fdfcf0] p-6 rounded-3xl border-8 border-white shadow-xl flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full opacity-20" style={{ backgroundColor: leafColor }}></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: leafColor }}></div>

      <div className="flex justify-between w-full mb-4 relative z-10">
         {config.collegeLogo ? <img src={config.collegeLogo} className="h-8 object-contain" alt="L"/> : <div className="w-8"></div>}
         {config.councilLogo ? <img src={config.councilLogo} className="h-8 object-contain" alt="R"/> : <div className="w-8"></div>}
      </div>

      <div className="text-center mb-6 relative z-10">
         <p className="text-xs font-black text-gray-800 uppercase tracking-widest leading-tight">{config.orgName}</p>
         <p className="text-[8px] font-bold text-gray-500 uppercase">{config.subHeader}</p>
      </div>

      <div className="w-36 h-36 rounded-full border-8 border-[#fdfcf0] overflow-hidden shadow-xl z-10 bg-white">
        <img src={user.profileImage || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="" />
      </div>

      <h1 className="mt-6 text-2xl font-serif font-black text-gray-800 text-center leading-tight">{user.name}</h1>
      <p className="text-xs italic font-medium mt-1 opacity-70 mb-6">{user.role}</p>

      <div className="mt-auto w-full p-4 bg-white/60 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm flex justify-between items-end">
         <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase">{config.labels?.rollNumber}</p>
            <p className="text-sm font-bold text-gray-800">{user.rollNumber}</p>
         </div>
         <div className="text-right">
            {config.signatureUrl && <img src={config.signatureUrl} className="h-8 mb-1 opacity-80" alt="Sign" />}
            <p className="text-[7px] font-bold text-gray-400 uppercase">{config.signatureName}</p>
         </div>
      </div>
    </div>
  );
};

export default TemplateEcoLeaf;