import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Save, Eye, Type, Image as ImageIcon, 
  PenTool, Calendar, Trash2, CheckCircle 
} from 'lucide-react';
import IDCardFrame from '../../components/digital-id/IDCardFrame'; // Adjust path if needed
import IDCardRenderer from '../../components/digital-id/IDCardRenderer'; // Adjust path if needed

// Default Design Config matching your new Blue Theme
const DEFAULT_CONFIG = {
  templateId: 'executive-pro',
  orgName: "NATIONAL SERVICE SCHEME",
  subHeader: "Indian Institute of Technology, Bombay",
  collegeLogo: "", // Top-Left
  councilLogo: "", // Top-Right
  secretarySig: "",
  secretaryName: "A. S. Patel",
  officerSig: "",
  officerName: "Dr. R. K. Singh",
  validThru: "DEC 2026",
  // Legacy color support (optional)
  roleColors: {
    'Secretary': '#dc2626',
    'Volunteer': '#2563eb'
  }
};

const SecretaryCustomizer = ({ userSample }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem('idCardConfig');
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Config load error", e);
      }
    }
  }, []);

  // Generic File Uploader
  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 500KB for base64 storage safety)
      if (file.size > 500000) {
        alert("File too large! Please upload logo under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setConfig(prev => ({ ...prev, [key]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (key) => {
    setConfig(prev => ({ ...prev, [key]: "" }));
  };

  const handleSave = () => {
    localStorage.setItem('idCardConfig', JSON.stringify(config));
    // Trigger a custom event so other tabs/components update instantly
    window.dispatchEvent(new Event('storage')); 
    alert("✅ ID Card Configuration Published Successfully!");
  };

  // Mock User for Preview
  const previewUser = {
    ...userSample,
    name: userSample?.name || "Rahul Sharma",
    role: "Volunteer",
    rollNumber: "VOL-2024-001",
    bloodGroup: "B+",
    branch: "CSE",
    year: "2ND",
    collegeName: config.subHeader, 
    // Use a placeholder image if none exists
    profileImage: userSample?.profileImage || "https://ui-avatars.com/api/?name=Rahul+Sharma&background=random"
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-4 bg-slate-50 min-h-screen">
      
      {/* --- LEFT COLUMN: EDITOR CONTROLS --- */}
      <div className="xl:col-span-7 space-y-6">
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-black text-slate-900">ID Card Designer</h1>
          <button 
            onClick={handleSave} 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-black transition-all active:scale-95"
          >
            <Save size={18} /> Publish Changes
          </button>
        </div>

        {/* 1. HEADER SETTINGS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Type className="text-blue-600" /> 1. Header & Organization
          </h2>
          
          <div className="space-y-5">
            {/* Logos Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Council Logo (Left) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Top-Left Logo (NSS)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer h-32 bg-slate-50">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, 'councilLogo')} />
                  {config.councilLogo ? (
                    <>
                      <img src={config.councilLogo} className="h-20 object-contain" alt="Left Logo" />
                      <button onClick={(e) => {e.stopPropagation(); handleDeleteImage('councilLogo')}} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full z-20 hover:bg-red-200">
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-slate-400">Upload NSS Logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* College Logo (Right) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Top-Right Logo (College)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer h-32 bg-slate-50">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, 'collegeLogo')} />
                  {config.collegeLogo ? (
                    <>
                      <img src={config.collegeLogo} className="h-20 object-contain" alt="Right Logo" />
                      <button onClick={(e) => {e.stopPropagation(); handleDeleteImage('collegeLogo')}} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full z-20 hover:bg-red-200">
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-slate-400">Upload College Logo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sub-Header Text (Back of Card)</label>
              <input 
                type="text" 
                value={config.subHeader}
                onChange={(e) => setConfig({...config, subHeader: e.target.value})}
                placeholder="e.g. Indian Institute of Technology"
                className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. AUTH & VALIDITY */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <PenTool className="text-orange-600" /> 2. Authorization & Footer
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secretary Name</label>
                <input
                  type="text"
                  value={config.secretaryName}
                  onChange={(e) => setConfig({...config, secretaryName: e.target.value})}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secretary Signature</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'secretarySig')}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm"
                />
                {config.secretarySig && (
                  <img src={config.secretarySig} alt="Secretary Signature" className="mt-2 h-8 object-contain" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Program Officer Name</label>
                <input
                  type="text"
                  value={config.officerName}
                  onChange={(e) => setConfig({...config, officerName: e.target.value})}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Program Officer Signature</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'officerSig')}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm"
                />
                {config.officerSig && (
                  <img src={config.officerSig} alt="Officer Signature" className="mt-2 h-8 object-contain" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12}/> Valid Thru Date
            </label>
            <input
              type="text"
              value={config.validThru}
              onChange={(e) => setConfig({...config, validThru: e.target.value})}
              placeholder="e.g. DEC 2026"
              className="w-full mt-1 p-3 border border-slate-300 rounded-xl text-sm font-black text-slate-900 uppercase"
            />
          </div>
        </div>

      </div>

      <div className="xl:col-span-5">
          <div className="sticky top-6">
            <div className="flex flex-col items-center justify-center p-8 bg-slate-200 rounded-[3rem] border-4 border-white shadow-xl min-h-[600px] relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>

              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 z-10 bg-white/50 px-4 py-1 rounded-full">
                 <Eye size={14}/> Live Preview
              </p>
              
              {/* The Actual ID Card Component */}
              <div className="scale-80 sm:scale-90 transform transition-transform duration-500 hover:scale-105">
                  <IDCardFrame>
                      {{
                      front: <IDCardRenderer user={previewUser} config={config} verified={true} />,
                      back: <IDCardRenderer user={previewUser} config={config} verified={true} isBack={true} />
                      }}
                  </IDCardFrame>
              </div>

              <p className="mt-12 text-center text-[10px] font-bold text-slate-500 max-w-[200px] z-10">
                Flip the card to see the QR Code and Return Info.
              </p>
            </div>
          </div>
        </div>

    </div>
  );
};

export default SecretaryCustomizer;