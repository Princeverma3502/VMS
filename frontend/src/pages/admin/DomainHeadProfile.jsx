import React, { useState, useEffect, useContext, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../../components/layout/Layout';
import { AuthContext } from '../../context/AuthContext';
import DigitalIDCard from '../../components/digital-id/DigitalIDCard';
import api from '../../services/api';
import { LogOut, Camera, X, Shield, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

const DomainHeadProfile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showID, setShowID] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/profile/${user._id}`);
      setProfileData(data.profile || data);
    } catch (error) {
      console.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    triggerHaptic('success');
    logout();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      alert('Image too large. Please select a photo under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const base64Image = reader.result;
        const { data } = await api.put('/users/profile-photo', { image: base64Image });
        if (data?.profileImage) updateUser({ profileImage: data.profileImage });
        await fetchProfile();
        triggerHaptic('success');
      } catch (err) {
        alert('Upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <Layout showBackButton={true}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  const profile = profileData || user;

  return (
    <Layout showBackButton={true}>

      <div className="pb-24 px-2 sm:px-4 max-w-2xl mx-auto">
        {/* Digital ID Card Modal */}
        {showID && profile && (
          <DigitalIDCard 
            user={profile} 
            onClose={() => setShowID(false)}
            profileImage={profile?.profileImage}
            roleColor="purple"
          />
        )}

        {/* Profile Section */}
        <div className="mt-8 space-y-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-3xl font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{profile.name}</h1>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield size={16} className="text-purple-200" />
                    <p className="text-sm font-semibold text-purple-100">Domain Head</p>
                  </div>
                </div>
              </div>

              <label className="cursor-pointer">
                <Camera className="text-white hover:text-purple-100 transition-colors" size={24} />
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs opacity-75 uppercase font-semibold">Branch</p>
                <p className="text-sm font-bold">{profile.branch}</p>
              </div>
              <div>
                <p className="text-xs opacity-75 uppercase font-semibold">Year</p>
                <p className="text-sm font-bold">{profile.year}</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setShowID(true)}
                  className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-xs font-bold transition-colors"
                >
                  Show ID
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-purple-600" size={20} />
                <p className="text-xs text-gray-600 font-semibold">XP Points</p>
              </div>
              <p className="text-3xl font-black text-purple-600">{profile.gamification?.xpPoints || 0}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-purple-600" size={20} />
                <p className="text-xs text-gray-600 font-semibold">Level</p>
              </div>
              <p className="text-3xl font-black text-purple-600">{profile.gamification?.level || 1}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DomainHeadProfile;
