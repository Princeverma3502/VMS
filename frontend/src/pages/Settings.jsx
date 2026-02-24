import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/layout/Layout';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Sun, Bell, Lock, LogOut } from 'lucide-react';

// --- ADMIN COMPONENTS (Crucial for SaaS features) ---
import SecretaryCustomizer from '../components/digital-id/SecretaryCustomizer';
import SessionManager from '../components/admin/SessionManager';

const Settings = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const { theme, updateTheme } = useTheme();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchPreferences();
    if (user) {
      setNewName(user.name);
      setBloodGroup(user.bloodGroup || '');
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data } = await api.get('/preferences');
      setPreferences(data.data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      // Set defaults if fetch fails
      setPreferences({
        theme: 'light',
        language: 'en',
        notifications: {
          activityFeed: true,
          polls: true,
          announcements: true,
          taskReminders: true,
          achievements: true,
          email: false,
          push: true
        },
        privacy: {
          showProfile: true,
          showActivity: true,
          showStats: true,
          allowMessages: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword });
      showNotification('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { name: newName, bloodGroup });
      updateUser(data); // Update user in AuthContext
      showNotification('Profile updated successfully', 'success');
      setIsEditProfileModalOpen(false);
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setSaving(true);
    try {
      await api.put('/preferences/theme', { theme: newTheme });
      updateTheme(newTheme);
      setPreferences(prev => ({ ...prev, theme: newTheme }));
      showNotification('Theme updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update theme', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setSaving(true);
    try {
      await api.put('/preferences/language', { language: newLanguage });
      setPreferences(prev => ({ ...prev, language: newLanguage }));
      showNotification('Language updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update language', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (type, checked) => {
    setSaving(true);
    try {
      const updated = {
        ...preferences.notifications,
        [type]: checked
      };
      await api.put('/preferences/notifications', { notifications: updated });
      setPreferences(prev => ({
        ...prev,
        notifications: updated
      }));
      showNotification('Notification preferences updated', 'success');
    } catch (error) {
      showNotification('Failed to update notifications', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyToggle = async (type, checked) => {
    setSaving(true);
    try {
      const updated = {
        ...preferences.privacy,
        [type]: checked
      };
      await api.put('/preferences/privacy', { privacy: updated });
      setPreferences(prev => ({
        ...prev,
        privacy: updated
      }));
      showNotification('Privacy settings updated', 'success');
    } catch (error) {
      showNotification('Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBackButton={true}>
      
      <div className="max-w-2xl mx-auto pb-10">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Not Set</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditProfileModalOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200">Cancel</button>
                <button onClick={handleUpdateProfile} disabled={saving} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sun size={24} className="text-yellow-500" />
            Appearance
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
              <div className="flex gap-3 flex-wrap">
                {['light', 'dark', 'nss-blue'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      preferences.theme === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t === 'light' && '☀️'} {t === 'dark' && '🌙'} {t === 'nss-blue' && '🔵'}
                    {' '} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={saving}
                className="w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 🚀 ADMIN ZONES (Only visible to Secretary)                  */}
        {/* ----------------------------------------------------------- */}
        {user?.role === 'Secretary' && (
          <div className="space-y-6 mb-6">
            {/* 1. Branding Customizer (White-Label) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Organization Branding</h3>
              <SecretaryCustomizer userSample={user} />
            </div>
            
            {/* 2. Session Manager (End Year / Handover) */}
            <SessionManager />
          </div>
        )}
        {/* ----------------------------------------------------------- */}

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={24} className="text-blue-500" />
            Notifications
          </h2>

          <div className="space-y-4">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label className="text-gray-800 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleNotificationToggle(key, e.target.checked)}
                  disabled={saving}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={24} className="text-red-500" />
            Privacy
          </h2>

          <div className="space-y-4">
            {Object.entries(preferences.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label className="text-gray-800 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handlePrivacyToggle(key, e.target.checked)}
                  disabled={saving}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Old Password</label>
              <input 
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Change Password'}
          </button>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Edit Profile
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold text-blue-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;