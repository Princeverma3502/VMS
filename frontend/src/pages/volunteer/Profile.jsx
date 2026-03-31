import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { AuthContext } from '../../context/AuthContext';
import DigitalIDCard from '../../components/digital-id/DigitalIDCard';
import EditBloodGroup from '../../components/common/EditBloodGroup'; 
import api from '../../services/api';
import { triggerHaptic } from '../../utils/haptics';
import { calculateLevel, getProgress } from '../../utils/levels';
import { 
  Shield, IdCard, Camera, Smartphone, Edit2, LogOut, Bell, Droplet,
  ChevronRight, Award, Box, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showID, setShowID] = useState(false);
  const [showBloodEdit, setShowBloodEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  
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
      toast.error("Cloud synchronization failed");
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
        if (!("Notification" in window)) {
          toast.error("Browser unsupported");
          return;
        }
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          setPerms(p => ({...p, notification: true}));
          toast.success("Alerts Synchronized");
        }
    } else if (type === 'camera') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setPerms(p => ({...p, camera: true}));
            toast.success("Optics Authorized");
        } catch (e) {
            toast.error("Hardware bypass failed");
        }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
        const { data } = await api.put('/users/profile/image', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        if (data.profileImage) {
          updateUser({ profileImage: data.profileImage });
          setProfileData(prev => ({ ...prev, profileImage: data.profileImage }));
          toast.success("Identity Visual Updated");
        }
    } catch (err) { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleBloodGroupUpdate = (newGroup) => {
    setProfileData(prev => ({ ...prev, bloodGroup: newGroup }));
    updateUser({ bloodGroup: newGroup }); 
    triggerHaptic('success');
  };

  const profile = profileData || user || {};
  const xp = profile?.gamification?.xpPoints || 0;
  const level = calculateLevel(xp);
  const progress = getProgress(xp);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Identity...</p>
    </div>
  );

  return (
    <Layout userRole={profile.role || 'Volunteer'} showBackButton={true}>
      
      <div className="pb-32 px-4 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. ELITE PROFILE CARD */}
        <div className="group relative bg-white rounded-[3rem] shadow-xl shadow-slate-900/5 border border-slate-100 p-8 text-center overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
           
           {/* Avatar Section */}
           <div className="relative z-10 w-40 h-40 mx-auto mb-6">
              <div className="w-full h-full rounded-[2.5rem] border-8 border-white shadow-2xl shadow-indigo-900/10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=4f46e5&color=fff`} 
                  className="w-full h-full object-cover" 
                  alt="Profile"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current.click()} 
                disabled={uploading}
                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-slate-950 transition-all active:scale-90 border-4 border-white"
              >
                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={20} />}
              </button>
           </div>

           <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{profile.name}</h1>
           <div className="flex items-center justify-center gap-2 mb-8">
              <Shield size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{profile.role} • Unit Asset</span>
           </div>

           {/* Quick Stats Bento */}
           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-5 border border-slate-100 flex flex-col items-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Number</p>
                <p className="text-lg font-black text-slate-900 tracking-tight">{profile.rollNumber || '--'}</p>
              </div>
              
              <div 
                onClick={() => setShowBloodEdit(true)} 
                className="relative bg-red-50/80 backdrop-blur-sm rounded-3xl p-5 border border-red-100 cursor-pointer hover:bg-red-100/50 transition-all group/blood flex flex-col items-center"
              >
                <Edit2 size={12} className="absolute top-3 right-3 text-red-200 group-hover/blood:text-red-500" />
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  Blood Group <Droplet size={8} fill="currentColor"/>
                </p>
                <p className="text-lg font-black text-red-600 tracking-tight">
                  {profile.bloodGroup || 'Set'}
                </p>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setShowID(true)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <IdCard size={18} /> Digital Identity
              </button>
              <button onClick={() => navigate('/volunteer/qr-scanner')} className="flex-1 bg-white text-slate-900 border-2 border-slate-950 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2">
                <Smartphone size={18} /> Optic Scan
              </button>
           </div>
        </div>

        {/* 2. PROGRESS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-indigo-600 text-white p-8 rounded-[3rem] shadow-xl shadow-indigo-900/10 flex flex-col justify-between group overflow-hidden relative">
              <Award className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-150 transition-transform duration-1000" size={160} />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Operational Level</p>
                <h3 className="text-4xl font-black tracking-tighter mb-6">Expert <span className="opacity-40">Lvl {level}</span></h3>
                
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-white transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                   <span>{xp} XP Earned</span>
                   <span>{100 - progress}% to Lvl {level + 1}</span>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                 <Shield size={16} className="text-indigo-600" /> Security Clearances
              </h3>
              
              <div className="space-y-4">
                <button onClick={() => requestPermission('notification')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 transition-all group">
                   <div className="flex items-center gap-3">
                      <Bell size={18} className="text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Alert System</span>
                   </div>
                   <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${perms.notification ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                     {perms.notification ? 'Online' : 'Initialize'}
                   </div>
                </button>

                <button onClick={() => requestPermission('camera')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-indigo-50 transition-all group">
                   <div className="flex items-center gap-3">
                      <Camera size={18} className="text-slate-400 group-hover:text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Optic Access</span>
                   </div>
                   <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${perms.camera ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                     {perms.camera ? 'Authorized' : 'Grant'}
                   </div>
                </button>
              </div>
           </div>
        </div>

        {/* 3. LOGOUT SYSTEM */}
        <button 
           onClick={() => {
             triggerHaptic('warning');
             logout();
           }} 
           className="w-full bg-slate-50 text-slate-400 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300"
        >
          <LogOut size={18} /> Sign Out Identity
        </button>

      </div>

      {/* MODALS */}
      {showID && <DigitalIDCard user={profile} onClose={() => setShowID(false)} />}
      {showBloodEdit && <EditBloodGroup currentGroup={profile.bloodGroup} onUpdate={handleBloodGroupUpdate} onClose={() => setShowBloodEdit(false)} />}
      
      {/* HIDDEN LOGIC */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </Layout>
  );
};

export default Profile;