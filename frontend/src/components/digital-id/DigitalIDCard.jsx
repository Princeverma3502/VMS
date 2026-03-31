import React, { useState, useEffect, useMemo } from 'react';
import IDCardFrame from './IDCardFrame';
import IDCardRenderer from './IDCardRenderer';
import { X, Loader2 } from 'lucide-react';
import api from '../../services/api';

const DigitalIDCard = ({ user, onClose }) => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const { data } = await api.get('/college-settings/id-card');
      setBranding(data);
    } catch (error) {
      console.error("Failed to fetch ID card branding", error);
      // Fallback to local storage for offline/drafts
      const saved = localStorage.getItem('idCardConfig');
      if (saved) setBranding(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const config = useMemo(() => {
    const baseConfig = branding || {};

    // Calculate Dynamic Validity (Current Date + 1 Year)
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() + 1);
    const validString = validDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      templateId: baseConfig.templateId || 'executive-pro',
      orgName: baseConfig.orgName || "NATIONAL SERVICE SCHEME",
      universityName: baseConfig.universityName || "NATIONAL SERVICE SCHEME",
      subHeader: baseConfig.subHeader || user?.collegeName || "NSS Unit",
      collegeLogo: baseConfig.collegeLogo || "",
      councilLogo: baseConfig.councilLogo || "",
      signatureRole: baseConfig.signatureRole || 'Secretary',
      signatureName: baseConfig.signatureName || 'Authorized Signatory',
      validThru: baseConfig.validThru || validString,
      ...baseConfig 
    };
  }, [branding, user]);

  if (!user) return null;

  const verified = !!user.isApproved;
  const displayUser = {
    ...user,
    collegeName: config.subHeader, 
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 p-4 sm:p-8">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white/60 hover:text-white transition p-3 hover:bg-white/10 rounded-full z-50 border border-white/10"
      >
        <X size={28} />
      </button>

      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Rendering ID Card...</p>
          </div>
        ) : (
          <div className="w-full flex justify-center scale-[0.85] sm:scale-100 transform-gpu">
             <IDCardFrame>
               {{
                 front: (
                   <IDCardRenderer 
                     user={displayUser} 
                     verified={verified} 
                     config={config} 
                     isBack={false}
                   />
                 ),
                 back: (
                   <IDCardRenderer 
                     user={displayUser} 
                     verified={verified} 
                     config={config} 
                     isBack={true} 
                   />
                 )
               }}
             </IDCardFrame>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col items-center gap-2 opacity-40">
             <div className="w-1 h-1 rounded-full bg-white/50"></div>
             <p className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Tap Card To Flip</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalIDCard;