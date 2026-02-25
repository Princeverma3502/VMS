import React from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Globe } from 'lucide-react';

const IDCardRenderer = ({ user, config, verified, isBack }) => {
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
      <div className={`${HEADER_COLOR} h-[35%] relative w-full px-6 py-4`}>
        {/* Top-Left: College Logo */}
        <div className="absolute top-6 left-6 w-14 h-14 bg-white rounded-lg p-2 shadow-md flex items-center justify-center overflow-hidden border-2 border-white">
          {config.collegeLogo ? (
            <img src={config.collegeLogo} alt="College" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[#EBF855] font-black text-xs">CLG</span>
          )}
        </div>

        {/* Top-Right: NGO/NSS Logo */}
        <div className="absolute top-6 right-6 w-14 h-14 bg-white rounded-full p-2 shadow-md flex items-center justify-center overflow-hidden border-2 border-white">
          {config.councilLogo ? (
            <img src={config.councilLogo} alt="NSS" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[#EBF855] font-black text-xs">NSS</span>
          )}
        </div>
      </div>

      {/* 2. PROFILE AVATAR (Overlapping) */}
      <div className="relative w-full flex justify-center mt-0 mb-4">
        <div className="w-28 h-28 rounded-full border-[4px] border-white bg-white shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
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
      <div className="text-center px-4 mb-6">
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight truncate">
          {user.name}
        </h1>
        <span className={`${HEADER_COLOR} text-slate-900 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm inline-block`}>
          {user.role || 'VOLUNTEER'}
        </span>
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
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Volunteer ID</p>
          <p className="text-sm font-black text-slate-800 leading-none truncate">
            {user.rollNumber || user.enrollmentNumber || 'N/A'}
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
      <div className="px-8 pb-4 flex justify-between items-end mt-4">
        {/* Bottom-Left: Secretary Signature */}
        <div className="flex flex-col items-start">
          {config.secretarySig && (
            <div className="h-8 mb-1 flex items-end">
              <img src={config.secretarySig} alt="Secretary Signature" className="h-full object-contain" />
            </div>
          )}
          <div className="w-20 h-[1px] bg-slate-300 mb-1"></div>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">
            {config.secretaryName || "Secretary"}
          </p>
        </div>

        {/* Bottom-Right: Program Officer Signature */}
        <div className="flex flex-col items-end">
          {config.officerSig && (
            <div className="h-8 mb-1 flex items-end">
              <img src={config.officerSig} alt="Officer Signature" className="h-full object-contain" />
            </div>
          )}
          <div className="w-20 h-[1px] bg-slate-300 mb-1"></div>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">
            {config.officerName || "Program Officer"}
          </p>
        </div>
      </div>

      {/* Validity Indicator */}
      <div className="px-8 pb-2 text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Valid Thru: {config.validThru || 'N/A'}
        </p>
      </div>

      {/* Bottom Stripe */}
      <div className={`${HEADER_COLOR} h-2 w-full absolute bottom-0`}></div>
    </div>
  );
};

IDCardRenderer.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    profileImage: PropTypes.string,
    bloodGroup: PropTypes.string,
    rollNumber: PropTypes.string,
    enrollmentNumber: PropTypes.string,
    branch: PropTypes.string,
    department: PropTypes.string,
    year: PropTypes.string,
    academicYear: PropTypes.string,
    isApproved: PropTypes.bool,
  }),
  config: PropTypes.shape({
    collegeLogo: PropTypes.string,
    councilLogo: PropTypes.string,
    secretarySig: PropTypes.string,
    secretaryName: PropTypes.string,
    officerSig: PropTypes.string,
    officerName: PropTypes.string,
    validThru: PropTypes.string,
    subHeader: PropTypes.string,
  }),
  verified: PropTypes.bool,
  isBack: PropTypes.bool,
};

export default IDCardRenderer;