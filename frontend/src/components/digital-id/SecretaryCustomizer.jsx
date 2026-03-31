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
  universityName: "NATIONAL SERVICE SCHEME",
  collegeSubheading: "Harcourt Butler Technical University",
  subHeader: "Indian Institute of Technology, Bombay",
  collegeLogo: "", // Top-Left
  councilLogo: "", // Top-Right
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

  // Mock User for Preview - Now more dynamic
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 bg-slate-50 min-h-screen">
      
      {/* --- LEFT COLUMN: EDITOR CONTROLS --- */}
      <div className="p-4 lg:p-8 space-y-8 lg:max-h-screen lg:overflow-y-auto scrollbar-hide">
        
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
              {/* College Logo (Left) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Left Logo (College)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer h-32 bg-slate-50">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, 'collegeLogo')} />
                  {config.collegeLogo ? (
                    <>
                      <img src={config.collegeLogo} className="h-20 object-contain" alt="Left Logo" />
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

              {/* NSS Logo (Right) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Right Logo (NSS)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50 transition cursor-pointer h-32 bg-slate-50">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileUpload(e, 'councilLogo')} />
                  {config.councilLogo ? (
                    <>
                      <img src={config.councilLogo} className="h-20 object-contain" alt="Right Logo" />
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
            </div>

            {/* Text Inputs */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Heading (Between Logos)</label>
              <input
                type="text"
                value={config.universityName}
                onChange={(e) => setConfig({...config, universityName: e.target.value})}
                placeholder="e.g. NATIONAL SERVICE SCHEME"
                className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sub Heading (Below Main Heading)</label>
              <input
                type="text"
                value={config.collegeSubheading}
                onChange={(e) => setConfig({...config, collegeSubheading: e.target.value})}
                placeholder="e.g. Harcourt Butler Technical University"
                className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Back of Card Subheader</label>
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

        {/* 3. ROLE-BASED BRANDING */}
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 relative overflow-hidden group mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-purple-500/10"></div>
          
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
               <LayoutTemplate size={20} />
            </div>
            3. Role-Based Branding
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.keys(config.roleColors).map((role) => (
              <div key={role} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white transition-all group/item">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">
                  {role.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={config.roleColors[role]}
                      onChange={(e) => setConfig({
                        ...config, 
                        roleColors: { ...config.roleColors, [role]: e.target.value }
                      })}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white shadow-md p-0 bg-transparent overflow-hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={config.roleColors[role]}
                      onChange={(e) => setConfig({
                        ...config, 
                        roleColors: { ...config.roleColors, [role]: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- RIGHT COLUMN: STUDIO PREVIEW STAGE --- */}
      <div className="h-screen lg:sticky lg:top-0 bg-[#0c111d] relative overflow-hidden flex flex-col items-center justify-center p-6 lg:p-12 border-l border-white/5 order-first lg:order-last">
          
          {/* Elite Background Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          </div>

          {/* Designer Controls Overlay */}
          <div className="absolute top-8 left-8 right-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 w-fit">
                Design Stage
              </span>
              <h2 className="text-white/40 text-[9px] font-bold uppercase tracking-widest px-1">Studio Viewport v2.0</h2>
            </div>

            <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl overflow-x-auto max-w-full no-scrollbar">
              {['Secretary', 'DomainHead', 'AssociateHead', 'Volunteer'].map(r => (
                <button
                  key={r}
                  onClick={() => setPreviewRole(r === 'DomainHead' ? 'Domain Head' : r === 'AssociateHead' ? 'Associate Head' : r)}
                  className={`px-3 lg:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    (previewRole === r || (r === 'DomainHead' && previewRole === 'Domain Head') || (r === 'AssociateHead' && previewRole === 'Associate Head'))
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                      : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {r === 'DomainHead' ? 'DH' : r === 'AssociateHead' ? 'AH' : r}
                </button>
              ))}
            </div>
          </div>
          
          {/* Card Engine Section - Aspect Ratio Preserved */}
          <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center gap-12 group animate-fade-in mt-20 lg:mt-0">
              <div className="relative w-full transition-all duration-700 hover:scale-[1.02] transform-gpu shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl">
                <IDCardFrame>
                    {{
                    front: <IDCardRenderer user={previewUser} config={config} verified={true} />,
                    back: <IDCardRenderer user={previewUser} config={config} verified={true} isBack={true} />
                    }}
                </IDCardFrame>
              </div>

              {/* Status & Feedback */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Real-time Rendering Active</span>
                </div>
                <p className="text-[11px] font-medium text-white/30 max-w-[240px] leading-relaxed">
                  Card proportions are strictly locked to <span className="text-white/60">CR-80</span> standard for production accuracy.
                </p>
              </div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-8 text-white/5 font-black text-2xl lg:text-4xl tracking-tighter select-none hidden sm:block">
            NSS DIGITAL ENGINE
          </div>
        </div>

    </div>
  );
};

export default SecretaryCustomizer;