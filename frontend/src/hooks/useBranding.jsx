import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const useBranding = () => {
  const { user } = useContext(AuthContext);
  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#1d4ed8',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    collegeName: ''
  });

  useEffect(() => {
    const fetchBranding = async () => {
      if (!user?.collegeId) return;
      try {
        // Fetch college settings by ID
        const response = await api.get(`/college-settings/${user.collegeId}`);
        const data = response.data;
        const primary = data.primaryColor || '#1d4ed8';
        const secondary = data.secondaryColor || '#10b981';
        const accent = data.accentColor || '#f59e0b';

        // Apply CSS variables globally
        try {
          document.documentElement.style.setProperty('--primary-color', primary);
          document.documentElement.style.setProperty('--secondary-color', secondary);
          document.documentElement.style.setProperty('--accent-color', accent);
          if (data.logoUrl) document.documentElement.style.setProperty('--college-logo-url', `url(${data.logoUrl})`);
        } catch (e) {
          // ignore (SSR or restricted env)
        }

        setBranding({
          logoUrl: data.logoUrl,
          primaryColor: primary,
          secondaryColor: secondary,
          accentColor: accent,
          collegeName: data.brandName || data.name || ''
        });
      } catch (error) {
        console.error('Failed to fetch branding:', error);
      }
    };
    fetchBranding();
  }, [user?.collegeId]);

  return branding;
};

export default useBranding;
