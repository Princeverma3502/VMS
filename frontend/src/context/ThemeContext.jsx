import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [palette, setPalette] = useState({
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#1d4ed8',
    secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || '#10b981',
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-color') || '#f59e0b',
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState('glassmorphic');

  useEffect(() => {
    const initializeTheme = async () => {
      await fetchPreferences();
    };
    initializeTheme();
  }, []);

  // Load college settings (selected template / palette) when user is present
  useEffect(() => {
    const loadCollegeSettings = async () => {
      try {
        if (!user?.collegeId) return;
        const res = await api.get(`/college-settings/${user.collegeId}`);
        const data = res.data;
        const primary = data.primaryColor || data.colorPalette?.brandPrimary;
        const secondary = data.secondaryColor || data.colorPalette?.brandSecondary;
        const accent = data.accentColor || data.colorPalette?.brandAccent;
        if (primary && secondary && accent) {
          applyCSSVars(primary, secondary, accent, data.logoUrl);
          setPalette({ primary, secondary, accent });
        }
        if (data.selectedTemplateId) setSelectedTemplateId(data.selectedTemplateId);
      } catch (err) {
        console.error('Failed to load college settings', err);
      }
    };
    loadCollegeSettings();
  }, [user?.collegeId]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        applyTheme('light');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/preferences', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
        applyTheme(data.data.theme || 'light');
      } else {
        applyTheme('light');
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setPreferences(null);
      applyTheme('light');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (themeName) => {
    const themes = {
      light: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
        input: 'bg-gray-50 border-gray-300',
      },
      dark: {
        bg: 'bg-gray-900',
        text: 'text-gray-100',
        border: 'border-gray-700',
        input: 'bg-gray-800 border-gray-600',
      },
      'nss-blue': {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        text: 'text-gray-900',
        border: 'border-blue-200',
        input: 'bg-blue-50 border-blue-300',
      },
    };

    const selectedTheme = themes[themeName] || themes.light;
    setTheme(themeName);

    // Apply CSS classes to document root
    document.documentElement.className = '';
    Object.keys(selectedTheme).forEach((key) => {
      const classes = selectedTheme[key].split(' ');
      classes.forEach(cls => {
        document.documentElement.classList.add(cls);
      });
    });

    // Apply CSS variables
    const cssVars = {
      light: {
        '--bg-primary': '#ffffff',
        '--text-primary': '#111827',
        '--border-color': '#e5e7eb',
      },
      dark: {
        '--bg-primary': '#111827',
        '--text-primary': '#f3f4f6',
        '--border-color': '#374151',
      },
      'nss-blue': {
        '--bg-primary': '#f0f9ff',
        '--text-primary': '#111827',
        '--border-color': '#bfdbfe',
      },
    };

    Object.entries(cssVars[themeName] || cssVars.light).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  };

  const updateTheme = async (newTheme) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // If payload contains colors/template, update college-settings
      if (newTheme?.primary || newTheme?.secondary || newTheme?.accent || newTheme?.selectedTemplateId) {
        if (!user?.collegeId) throw new Error('No collegeId');
        const payload = {};
        if (newTheme.primary) payload.primaryColor = newTheme.primary;
        if (newTheme.secondary) payload.secondaryColor = newTheme.secondary;
        if (newTheme.accent) payload.accentColor = newTheme.accent;
        if (newTheme.selectedTemplateId) payload.selectedTemplateId = newTheme.selectedTemplateId;
        payload.colorPalette = {
          brandPrimary: newTheme.primary,
          brandSecondary: newTheme.secondary,
          brandAccent: newTheme.accent,
        };

        const res = await api.put(`/college-settings/${user.collegeId}`, payload);
        const data = res.data;
        // apply new CSS vars
        if (payload.primaryColor && payload.secondaryColor && payload.accentColor) {
          applyCSSVars(payload.primaryColor, payload.secondaryColor, payload.accentColor, data.logoUrl);
          setPalette({ primary: payload.primaryColor, secondary: payload.secondaryColor, accent: payload.accentColor });
        }
        if (payload.selectedTemplateId) setSelectedTemplateId(payload.selectedTemplateId);
      } else {
        // legacy behavior: update UI theme name
        applyTheme(newTheme);
        setPreferences({ ...preferences, theme: newTheme });
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  function applyCSSVars(primary, secondary, accent, logoUrl) {
    try {
      const root = document.documentElement;
      root.style.setProperty('--brand-primary', primary);
      root.style.setProperty('--brand-secondary', secondary);
      root.style.setProperty('--brand-accent', accent);
      root.style.setProperty('--primary-color', primary);
      root.style.setProperty('--secondary-color', secondary);
      root.style.setProperty('--accent-color', accent);
      if (logoUrl) root.style.setProperty('--college-logo-url', `url(${logoUrl})`);
    } catch (e) {}
  }

  const value = {
    theme,
    updateTheme,
    preferences,
    loading,
    palette,
    selectedTemplateId,
    setSelectedTemplateId,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
