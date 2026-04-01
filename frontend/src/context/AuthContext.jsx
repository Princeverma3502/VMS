import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      console.log('🟢 AuthContext: Checking if user is logged in');
      
      // Check both persistent (localStorage) and session-only (sessionStorage)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        console.log('🟢 AuthContext: Token found, validating...');
        try {
          const { data } = await api.get('/auth/me', {
             headers: { Authorization: `Bearer ${token}` }
          });
          console.log('🟢 AuthContext: User authenticated:', data?.email);
          setUser(normalizeUserRole(data));
        } catch (error) {
          console.error('🔴 AuthContext: Failed to validate token:', error.message);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('🟢 AuthContext: No token found, user is anonymous');
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // UPDATED: Added rememberMe support
  const login = async (email, password, rememberMe = true) => {
    console.log('🟢 AuthContext: Attempting login for:', email, 'RememberMe:', rememberMe);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log('🟢 AuthContext: Login successful, setting token and user data');
      
      // Store based on preference
      if (rememberMe) {
        localStorage.setItem('token', data.token);
        sessionStorage.removeItem('token'); // Clean up session storage
      } else {
        sessionStorage.setItem('token', data.token);
        localStorage.removeItem('token'); // Clean up local storage
      }
      
      setUser(normalizeUserRole(data));
      console.log('🟢 AuthContext: User state updated:', data?.email);
      return { success: true, user: data };
    } catch (error) {
      console.error('🔴 AuthContext: Login failed:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData, rememberMe = true) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          sessionStorage.removeItem('token');
        } else {
          sessionStorage.setItem('token', data.token);
          localStorage.removeItem('token');
        }
        setUser(normalizeUserRole(data));
        return { success: true };
      } else {
        return { success: true, message: data.message, pending: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  // Update current user object in context (partial updates allowed)
  const updateUser = (patch) => {
    setUser((prev) => normalizeUserRole({ ...(prev || {}), ...(patch || {}) }));
  };

  // Helper: normalize role strings to a consistent Title Case for UI checks
  const normalizeRole = (role) => {
    if (!role) return role;
    const r = role.toString().trim().toLowerCase();
    const map = {
      'volunteer': 'Volunteer',
      'secretary': 'Secretary',
      'admin': 'Admin',
      'administrator': 'Admin',
      'domain head': 'Domain Head',
      'domainhead': 'Domain Head',
      'associate head': 'Associate Head',
      'associatehead': 'Associate Head',
    };
    return map[r] || role.replace(/\b\w/g, c => c.toUpperCase());
  };

  const normalizeUserRole = (userObj) => {
    if (!userObj) return userObj;
    const u = { ...userObj };
    if (u.role) u.role = normalizeRole(u.role);
    // also add a lowercase helper
    u.roleNormalized = (u.role || '').toString().toLowerCase();
    return u;
  };

  // Expose a hasRole helper for components
  const hasRole = (...roles) => {
    if (!user) return false;
    const current = (user.role || '').toString().toLowerCase();
    return roles.some(r => r.toString().toLowerCase() === current);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, updateUser, hasRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};