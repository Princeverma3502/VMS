import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const TemplateExecutivePro = ({ user, accentColor, config, isBack }) => {
  if (isBack) {
    return (
      <div className="w-[320px] h-[500px] bg-slate-900 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6">
          <QRCodeSVG value={user._id} size={180} />
        </div>
        <p className="text-xs font-black tracking-widest opacity-60">SCAN TO VERIFY</p>
        <div className="mt-8 text-center opacity-50">
           <p className="text-[10px] uppercase font-bold">{config.orgName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-[500px] bg-white flex flex-col relative overflow-hidden shadow-2xl">
      <div className="h-36 w-full relative pt-4 pb-4 px-4 text-center flex flex-col justify-start" style={{ backgroundColor: accentColor }}>
        <div className="flex justify-between items-start w-full relative z-10 mb-2">
           {config.collegeLogo ? <img src={config.collegeLogo} className="h-10 w-10 object-contain bg-white/20 rounded p-1" alt="L"/> : <div className="w-10"></div>}
           {config.councilLogo ? <img src={config.councilLogo} className="h-10 w-10 object-contain bg-white/20 rounded p-1" alt="R"/> : <div className="w-10"></div>}
        </div>
        <h2 className="text-sm font-black text-white uppercase tracking-tighter leading-tight relative z-10">{config.orgName}</h2>
        <p className="text-[8px] font-bold text-white/90 uppercase tracking-widest relative z-10 mt-1">{config.subHeader}</p>
      </div>

      <div className="flex flex-col items-center -mt-12 z-20 relative w-full">
        {config.visibleFields.photo && (
          <div className="w-36 h-36 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-100 mx-auto">
            <img src={user.profileImage || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Student" />
          </div>
        )}
        <h1 className="mt-3 text-2xl font-black text-gray-900 tracking-tight text-center px-4 leading-none w-full truncate">{user.name}</h1>
        {config.visibleFields.role && (
          <div className="mt-2 px-4 py-1 rounded-full text-[10px] font-black text-white shadow-md uppercase tracking-widest" style={{ backgroundColor: accentColor }}>
            {user.role}
          </div>
        )}
      </div>

      <div className="px-6 py-4 grid grid-cols-2 gap-y-4 gap-x-2 mt-2">
        {config.visibleFields.rollNumber && <DataField label={config.labels.rollNumber || "ID No"} value={user.rollNumber} />}
        {config.visibleFields.bloodGroup && <DataField label="Blood Group" value={user.bloodGroup} color="text-red-600" />}
        {config.visibleFields.branch && <DataField label={config.labels.branch || "Branch"} value={user.branch} />}
        {config.visibleFields.year && <DataField label={config.labels.year || "Year"} value={user.year} />}
      </div>

      <div className="mt-auto px-6 pb-3 flex justify-between items-end">
        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-1">Valid Thru<br/><span className="text-gray-800 text-[10px]">Dec 2025</span></div>
        <div className="flex flex-col items-end text-right">
          {config.signatureUrl && <img src={config.signatureUrl} alt="Sign" className="h-10 object-contain mb-1" />}
          <div className="h-px w-24 bg-gray-300"></div>
          <p className="text-[9px] font-bold text-gray-800 uppercase mt-1">{config.signatureName}</p>
          <p className="text-[8px] font-medium text-gray-500 uppercase">{config.signatureRole}</p>
        </div>
      </div>
      <div className="h-2 w-full" style={{ backgroundColor: accentColor }}></div>
    </div>
  );
};

const DataField = ({ label, value, color = "text-gray-800" }) => (
  <div className="leading-tight">
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{label}</p>
    <p className={`text-xs font-bold uppercase truncate ${color}`}>{value || '---'}</p>
  </div>
);

export default TemplateExecutivePro;