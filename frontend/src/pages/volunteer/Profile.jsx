import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { AuthContext } from '../../context/AuthContext';
import DigitalIDCard from '../../components/digital-id/DigitalIDCard';
import XPHistoryLog from '../../components/gamification/XPHistoryLog';
import EditBloodGroup from '../../components/common/EditBloodGroup'; 
import api from '../../services/api';
import { triggerHaptic } from '../../utils/haptics';
import { calculateLevel, getProgress } from '../../utils/levels';
import { 
  Shield, IdCard, Camera, Smartphone, Edit2, LogOut, Bell, Droplet
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showID, setShowID] = useState(false);
  const [showBloodEdit, setShowBloodEdit] = useState(false);
  
  // Permissions State
  const [perms, setPerms] = useState({ notification: false, camera: false });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkPermissions();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/profile/${user._id}`);
      setProfileData(data.profile || data);
    } catch (error) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    const notif = "Notification" in window && Notification.permission === 'granted';
    setPerms(p => ({...p, notification: notif}));
  };

  const requestPermission = async (type) => {
    triggerHaptic('success');
    if (type === 'notification') {
        const res = await Notification.requestPermission();
        if (res === 'granted') setPerms(p => ({...p, notification: true}));
    } else if (type === 'camera') {
        try {
            // Test Camera Access then close immediately to verify permission
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // STOP CAMERA IMMEDIATELY
            setPerms(p => ({...p, camera: true}));
            alert("Camera Access Granted & Closed ✅");
        } catch (e) {
            alert("Camera Access Denied ❌");
        }
    }
  };

  const handlePhotoClick = () => fileInputRef.current.click();
  
  // Image Upload Logic
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
        const objectUrl = URL.createObjectURL(file);
        setProfileData(prev => ({ ...prev, profileImage: objectUrl }));
        const { data } = await api.put('/users/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        if (data.profileImage) updateUser({ profileImage: data.profileImage });
    } catch (err) { console.error(err); }
  };

  // REAL-TIME BLOOD GROUP SYNC
  const handleBloodGroupUpdate = (newGroup) => {
    // 1. Update Local State (Immediate UI Feedback)
    setProfileData(prev => ({ ...prev, bloodGroup: newGroup }));
    
    // 2. Update Global Context (Persists to ID Card Modal)
    updateUser({ bloodGroup: newGroup }); 
    
    triggerHaptic('success');
  };

  const profile = profileData || {};
  const xp = profile?.gamification?.xpPoints || 0;
  const level = calculateLevel(xp);
  const progress = getProgress(xp);

  if (loading) return <div className="p-10 text-center font-bold text-slate-900">Loading Profile...</div>;

  return (
    <Layout userRole={profile.role || 'Volunteer'} showBackButton={true}>
      
      {/* VISIBILITY PATCH: Force dark text on inputs globally for this page */}
      <style>{`
        input, select, textarea { color: #0f172a !important; background: #ffffff !important; border-color: #cbd5e1 !important; }
        ::placeholder { color: #64748b !important; opacity: 1; }
      `}</style>

      <div className="pb-24 px-4 max-w-2xl mx-auto space-y-6">
        
        {/* 1. PROFILE HEADER */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 p-6 text-center relative overflow-hidden">
           {/* Avatar */}
           <div className="relative w-32 h-32 mx-auto mb-4 group">
             <div className="w-full h-full rounded-full border-4 border-blue-50 shadow-xl overflow-hidden">
               <img src={profile.profileImage || `https://ui-avatars.com/api/?name=${profile.name}`} className="w-full h-full object-cover" />
             </div>
             <button onClick={handlePhotoClick} className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10 hover:bg-blue-700 transition">
               <Camera size={16} />
             </button>
           </div>

           <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
           <p className="text-sm font-bold text-slate-500 uppercase">{profile.role}</p>

           {/* ACTIONS */}
           <div className="grid grid-cols-2 gap-3 mt-6">
             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
               <p className="text-[10px] font-bold text-slate-400 uppercase">ID</p>
               <p className="text-lg font-black text-slate-900">{profile.rollNumber || '--'}</p>
             </div>
             
             {/* LIVE BLOOD GROUP CARD */}
             <div 
               onClick={() => setShowBloodEdit(true)} 
               className="relative bg-red-50 rounded-2xl p-4 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors group"
             >
               {/* Edit Icon (Top Right) */}
               <div className="absolute top-2 right-2 text-red-300 group-hover:text-red-500 transition-colors">
                 <Edit2 size={14}/>
               </div>
               
               <p className="text-[10px] font-bold text-red-400 uppercase flex items-center justify-center gap-1">
                 Blood <Droplet size={10} fill="currentColor"/>
               </p>
               {/* Shows Value or 'Set Now' */}
               <p className="text-xl font-black text-red-600 mt-1">
                 {profile.bloodGroup || <span className="text-sm">Set Now</span>}
               </p>
             </div>
           </div>

           <div className="flex gap-3 mt-4">
             <button onClick={() => setShowID(true)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all">
               View ID Card
             </button>
             <button onClick={() => navigate('/volunteer/qr-scanner')} className="flex-1 bg-white text-slate-900 border-2 border-slate-900 py-3 rounded-xl font-bold active:scale-95 transition-all">
               Scan QR
             </button>
           </div>
        </div>

        {/* 2. PERMISSIONS (Was Preferences) */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
          <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
            <Shield size={20} className="text-blue-600" /> Permissions
          </h3>
          
          <div className="space-y-3">
            {/* Notification */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Bell size={18} /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-[10px] font-bold text-slate-400">Updates & Alerts</p>
                </div>
              </div>
              <button onClick={() => requestPermission('notification')} className={`px-4 py-2 rounded-lg text-xs font-bold ${perms.notification ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {perms.notification ? 'Active' : 'Enable'}
              </button>
            </div>

            {/* Camera */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm"><Camera size={18} /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Camera</p>
                  <p className="text-[10px] font-bold text-slate-400">For QR Scanning</p>
                </div>
              </div>
              <button onClick={() => requestPermission('camera')} className={`px-4 py-2 rounded-lg text-xs font-bold ${perms.camera ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {perms.camera ? 'Active' : 'Allow'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. LOGOUT (Bottom) */}
        <button onClick={logout} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-colors">
          <LogOut size={20} /> Logout
        </button>

      </div>

      {/* Modals */}
      {showID && <DigitalIDCard user={profile} onClose={() => setShowID(false)} />}
      {showBloodEdit && <EditBloodGroup currentGroup={profile.bloodGroup} onUpdate={handleBloodGroupUpdate} onClose={() => setShowBloodEdit(false)} />}
      
      {/* Hidden Upload Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </Layout>
  );
};

export default Profile;