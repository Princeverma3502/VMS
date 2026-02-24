import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      console.log('🟢 AuthContext: Checking if user is logged in');
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🟢 AuthContext: Token found, validating...');
        try {
          const { data } = await api.get('/auth/me');
          console.log('🟢 AuthContext: User authenticated:', data?.email);
          setUser(normalizeUserRole(data));
        } catch (error) {
          console.error('🔴 AuthContext: Failed to validate token:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('🟢 AuthContext: No token found, user is anonymous');
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // UPDATED: Back to Email
  const login = async (email, password) => {
    console.log('🟢 AuthContext: Attempting login for:', email);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      console.log('🟢 AuthContext: Login successful, setting token and user data');
      localStorage.setItem('token', data.token);
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

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.token) {
        localStorage.setItem('token', data.token);
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