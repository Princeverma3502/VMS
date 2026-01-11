import React, { useMemo } from 'react';
import IDCardFrame from './IDCardFrame';
import IDCardRenderer from './IDCardRenderer';
import { X } from 'lucide-react';

const DigitalIDCard = ({ user, onClose }) => {
  if (!user) return null;

  const config = useMemo(() => {
    // 1. Try to get saved config from Secretary
    const saved = localStorage.getItem('idCardConfig');
    const baseConfig = saved ? JSON.parse(saved) : {};

    // 2. Calculate Dynamic Validity (Current Date + 1 Year)
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() + 1);
    const validString = validDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // 3. Construct Robust Config
    return {
      templateId: baseConfig.templateId || 'executive-pro',
      
      // HEADER: Fallback to User's College Name if Admin hasn't set one
      orgName: baseConfig.orgName || "NATIONAL SERVICE SCHEME",
      subHeader: baseConfig.subHeader || user.collegeName || "NSS Unit",
      
      // LOGOS: If empty string, Renderer will hide them (fixing the placeholder issue)
      collegeLogo: baseConfig.collegeLogo || "", 
      councilLogo: baseConfig.councilLogo || "", 
      
      // SIGNATURES: Default to Secretary if missing
      signatureRole: baseConfig.signatureRole || 'Secretary',
      signatureName: baseConfig.signatureName || 'Authorized Signatory',
      validThru: baseConfig.validThru || validString,

      // VISIBILITY DEFAULTS
      showPhoto: true,
      showBranch: true,
      showYear: true,
      showRole: true,
      
      ...baseConfig // Override with any specific saved admin preferences
    };
  }, [user]);

  const verified = !!user.isApproved;

  // Merge User Data for Display
  const displayUser = {
    ...user,
    // Ensure these fields propagate to the renderer
    collegeName: config.subHeader, 
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-full z-50"
      >
        <X size={32} />
      </button>

      <div className="flex flex-col items-center justify-center w-full h-full">
        <IDCardFrame>
          {{
            front: (
              <IDCardRenderer 
                templateId={config.templateId} 
                user={displayUser} 
                verified={verified} 
                config={config} 
                isBack={false}
              />
            ),
            back: (
              <IDCardRenderer 
                templateId={config.templateId} 
                user={displayUser} 
                verified={verified} 
                config={config} 
                isBack={true} 
              />
            )
          }}
        </IDCardFrame>
      </div>
    </div>
  );
};

export default DigitalIDCard;