import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Save, Eye, Type, Image as ImageIcon, 
  PenTool, Calendar, Trash2 
} from 'lucide-react';
import IDCardFrame from '../../components/digital-id/IDCardFrame';
import IDCardRenderer from '../../components/digital-id/IDCardRenderer';

const DEFAULT_CONFIG = {
  templateId: 'executive-pro',
  orgName: "NATIONAL SERVICE SCHEME",
  universityName: "NATIONAL SERVICE SCHEME",
  collegeSubheading: "Harcourt Butler Technical University",
  subHeader: "Indian Institute of Technology, Bombay",
  collegeLogo: "",
  councilLogo: "",
  secretarySig: "",
  secretaryName: "A. S. Patel",
  officerSig: "",
  officerName: "Dr. R. K. Singh",
  validThru: "DEC 2026",
  roleColors: {
    'Secretary': '#EBF855',
    'DomainHead': '#EBF855',
    'AssociateHead': '#EBF855',
    'Volunteer': '#EBF855'
  }
};

const SecretaryCustomizer = ({ userSample }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [previewRole, setPreviewRole] = useState('Volunteer');

  useEffect(() => {
    const saved = localStorage.getItem('idCardConfig');
    if (saved) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) }); }
      catch (e) { console.error("Config load error", e); }
    }
  }, []);

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { alert("File too large!"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setConfig(prev => ({ ...prev, [key]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('idCardConfig', JSON.stringify(config));
    window.dispatchEvent(new Event('storage')); 
    alert("✅ ID Card Configuration Published!");
  };

  const previewUser = {
    ...userSample,
    name: userSample?.name || "Rahul Sharma",
    role: previewRole,
    rollNumber: userSample?.rollNumber || "VOL-2024-001",
    bloodGroup: userSample?.bloodGroup || "B+",
    branch: userSample?.branch || userSample?.department || "CSE",
    year: userSample?.year || userSample?.academicYear || "2ND",
    collegeName: config.subHeader, 
    profileImage: userSample?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userSample?.name || 'Rahul Sharma')}&background=EBF855&color=000`
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-4 bg-slate-50 min-h-screen">
      
      {/* --- LEFT COLUMN: EDITOR CONTROLS --- */}
      <div className="xl:col-span-7 space-y-6">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-black text-slate-900">ID Designer</h1>
          <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all active:scale-95">
            <Save size={18} /> Publish
          </button>
        </div>

        {/* 1. HEADER & ORGANIZATION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Type className="text-blue-600" /> 1. Header & Organization
          </h2>
          
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                {['collegeLogo', 'councilLogo'].map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{key === 'collegeLogo' ? 'College Logo' : 'NSS Logo'}</label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center h-24 bg-slate-50">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, key)} />
                      {config[key] ? (
                        <img src={config[key]} className="h-16 object-contain" alt="Logo" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Upload {key === 'collegeLogo' ? 'College' : 'NSS'}</span>
                      )}
                    </div>
                  </div>
                ))}
             </div>

             <input
                type="text"
                value={config.universityName}
                onChange={(e) => setConfig({...config, universityName: e.target.value})}
                placeholder="Main Heading"
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold"
              />
              <input
                type="text"
                value={config.collegeSubheading}
                onChange={(e) => setConfig({...config, collegeSubheading: e.target.value})}
                placeholder="Sub Heading"
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold"
              />
          </div>
        </div>

        {/* 2. AUTH & FOOTER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <PenTool className="text-orange-600" /> 2. Authorization & Footer
          </h2>
          <div className="grid grid-cols-2 gap-4">
              <input type="text" value={config.secretaryName} onChange={(e) => setConfig({...config, secretaryName: e.target.value})} placeholder="Secretary Name" className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold" />
              <input type="text" value={config.officerName} onChange={(e) => setConfig({...config, officerName: e.target.value})} placeholder="Officer Name" className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold" />
          </div>
          <input type="text" value={config.validThru} onChange={(e) => setConfig({...config, validThru: e.target.value})} placeholder="Valid Thru (e.g. DEC 2026)" className="w-full mt-4 p-3 border border-slate-300 rounded-xl text-sm font-bold uppercase" />
        </div>

        {/* 3. ROLE-BASED BRANDING */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <LayoutTemplate className="text-purple-600" /> 3. Role-Based Branding
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(config.roleColors).map((role) => (
              <div key={role} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="color"
                  value={config.roleColors[role]}
                  onChange={(e) => setConfig({ ...config, roleColors: { ...config.roleColors, [role]: e.target.value } })}
                  className="w-8 h-8 rounded-lg cursor-pointer"
                />
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  {role.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: PREVIEW --- */}
      <div className="xl:col-span-5 h-full">
          <div className="sticky top-6">
            <div className="flex flex-col items-center justify-center py-12 px-2 sm:px-8 bg-slate-200 rounded-[3rem] border-4 border-white shadow-xl min-h-[600px] relative overflow-visible">
              
              <div className="mb-4 flex gap-2">
                {['Secretary', 'DomainHead', 'AssociateHead', 'Volunteer'].map(r => (
                  <button
                    key={r}
                    onClick={() => setPreviewRole(r === 'DomainHead' ? 'Domain Head' : r === 'AssociateHead' ? 'Associate Head' : r)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                      (previewRole === r || (r === 'DomainHead' && previewRole === 'Domain Head') || (r === 'AssociateHead' && previewRole === 'Associate Head'))
                        ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'
                    }`}
                  >
                    {r === 'DomainHead' ? 'DH' : r === 'AssociateHead' ? 'AH' : r.charAt(0)}
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                 <Eye size={14}/> ID Preview
              </p>
              
              <div className="scale-75 sm:scale-90 xl:scale-100 transform transition-transform duration-500 hover:scale-105 origin-center bg-white shadow-2xl rounded-3xl">
                  <IDCardFrame>
                      {{
                      front: <IDCardRenderer user={previewUser} config={config} verified={true} />,
                      back: <IDCardRenderer user={previewUser} config={config} verified={true} isBack={true} />
                      }}
                  </IDCardFrame>
              </div>
              <p className="mt-8 text-center text-[10px] font-bold text-slate-500">
                Flip the card to see the QR Code.
              </p>
            </div>
          </div>
        </div>

    </div>
  );
};

export default SecretaryCustomizer;