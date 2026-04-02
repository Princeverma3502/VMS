import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Globe } from 'lucide-react';

const IDCardRenderer = ({ user, config, verified = false, isBack = false }) => {
  if (!user) return null;

  // Design Constants
  const HEADER_COLOR = 'bg-[#EBF855]'; // NSS Yellow

  // --- BACK SIDE ---
  if (isBack) {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 relative rounded-3xl overflow-hidden shadow-2xl aspect-[0.63]">
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
      <div className="w-full h-full bg-white relative flex flex-col rounded-3xl overflow-hidden shadow-2xl font-sans pt-6 aspect-[0.63]">

      {/* 1. HEADER (Yellow Zone - 35% Height) */}
      <div className={`${HEADER_COLOR} h-[50%] relative w-full px-3 py-10 mt-[-2em] flex flex-col items-center justify-center`}>
        <div className="flex items-center justify-between w-full mb-2">
          {/* Top-Left: College Logo */}
          <div className="w-14 h-14 rounded-full shadow-sm flex items-center justify-center overflow-hidden border-2 border-transparent bg-white flex-shrink-0">
            {config.collegeLogo ? (
              <img src={config.collegeLogo} alt="College" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-slate-900 font-black text-xs">CLG</span>
            )}
          </div>

          {/* Top-Right: NGO/NSS Logo */}
          <div className="w-14 h-14 rounded-full shadow-sm flex items-center justify-center overflow-hidden border-2 border-transparent bg-white flex-shrink-0">
            <img
              src={config.councilLogo}
              alt="NSS"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </div>

        {/* Center: Heading and Subheading */}
        <div className="flex-1  flex flex-col items-center justify-center px-4 w-full">
          <p className="text-xs font-black mt-[-9em] text-slate-900 uppercase tracking-wider text-center leading-tight">
            {config.universityName || "NATIONAL SERVICE SCHEME"}
          </p>
          <p className="text-[9px] font-bold text-slate-700 text-center leading-tight mt-1">
            {config.collegeSubheading || "National Service Scheme"}
          </p>
        </div>
      </div>

      {/* 2. PROFILE AVATAR (Overlapping) */}
      <div className="relative w-full h-35% flex justify-center mt-[-4em] mb-4">
        <div className="w-45 h-45 rounded-full border-[4px] border-white bg-white shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
          <img
            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EBF855&color=000`}
            alt="Volunteer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=EBF855&color=000`;
            }}
          />
        </div>
      </div>

      {/* 3. NAME & ROLE BADGE */}
      <div className="text-center px-4 mb-4 mt-[-1em]">
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight truncate">
          {user.name}
        </h1>
        <div className="flex flex-col items-center gap-1">
          <span className={`${HEADER_COLOR} text-slate-900 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
            {user.role || 'VOLUNTEER'}
          </span>
        </div>
      </div>

      {/* 4. DATA GRID (2x2) */}
      <div className="px-8 grid grid-cols-2 gap-y-4 gap-x-2 mb-auto">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Blood Group</p>
          <p className="text-sm font-black text-red-600 tracking-wider leading-none truncate">
            {user.bloodGroup || 'Not Set'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Roll No</p>
          <p className="text-sm font-black text-slate-800 leading-none truncate">
            {user.rollNumber || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Branch</p>
          <p className="text-sm font-black text-slate-800 uppercase leading-none truncate">
            {user.branch || user.department || 'N/A'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Year</p>
          <p className="text-sm font-black text-slate-800 uppercase leading-none truncate">
            {user.year || user.academicYear || 'N/A'}
          </p>
        </div>
      </div>

      {/* 5. FOOTER (Signatures & Validity) */}
      <div className="px-8 pb-4 mt-6 relative">
        <div className="flex justify-between items-end">
          {(() => {
            const defaults = [
              { name: config.secretaryName || 'Student Secretary', signature: config.secretarySig || null, designation: 'Student Secretary' },
              { name: config.secretary2Name || '', signature: config.secretary2Sig || null, designation: 'Student Secretary' },
              { name: config.secretary3Name || '', signature: config.secretary3Sig || null, designation: 'Student Secretary' }
            ];

            const secs = (config.studentSecretaries && config.studentSecretaries.length)
              ? config.studentSecretaries
              : defaults;

            return secs.slice(0, 3).map((s, idx) => (
              <div key={idx} className="flex flex-col items-center w-1/3">
                {s.signature && (
                  <div className="h-8 mb-1 flex items-end">
                    <img src={s.signature} alt={`Signature ${idx + 1}`} className="h-full object-contain" />
                  </div>
                )}
                <div className="w-32 h-[1px] bg-slate-200 mb-1"></div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide text-center">
                  {s.name || `Student Secretary ${idx + 1}`}
                </p>
                <p className="text-[10px] font-medium text-slate-400 text-center">{s.designation || 'Student Secretary'}</p>
              </div>
            ));
          })()}
        </div>

        {/* Validity Indicator */}
        <div className="px-8 pb-2 text-center mt-4">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Valid Till: {config.validThru || 'N/A'}
          </p>
        </div>

        {/* Bottom Stripe */}
        <div className={`${HEADER_COLOR} h-2 w-full absolute bottom-0`}></div>
      </div>
    </div>
  );
};

export default IDCardRenderer;