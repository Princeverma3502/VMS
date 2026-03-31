import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/ui/Header';
import GamificationStatCard from '../components/ui/GamificationStatCard';
import StreakCard from '../components/ui/StreakCard';
import MeetingPreview from '../components/ui/MeetingPreview';
import ActivityFeed from '../components/gamification/ActivityFeed';
import BloodGroupSummary from '../components/ui/BloodGroupSummary';
import NoticeBoard from '../components/notices/NoticeBoard';
import BottomNav from '../components/layout/BottomNav';
import useBranding from '../hooks/useBranding';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, PlayCircle, Lock, Trophy, ClipboardList } from 'lucide-react';

const BentoDashboard = () => {
  const { user } = useContext(AuthContext);
  const { primaryColor } = useBranding();
  
  const xp = user?.gamification?.xpPoints || 0;
  const level = user?.gamification?.level || 1;
  const progressRatio = (xp % 100) / 100; // Example calc
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const upcoming = { title: 'Unit Meeting', date: 'Dec 30', time: '17:00' };

  // --- EFFECTS ---
  useEffect(() => {
    fetchTasks();
  }, []);

  // --- ACTIONS ---
  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(Array.isArray(data) ? data : []);
      setTaskLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
      setTaskLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await api.put(`/tasks/${id}/claim`);
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleSubmit = async (id) => {
    try {
      await api.put(`/tasks/${id}/submit`, { submissionData: '' });
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message); }
  };

  // --- HELPERS ---
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const myTasks = tasks.filter(t => t.status === 'In Progress' && t.assignedUsers.some(u => u._id === user?._id));
  const reviewTasks = tasks.filter(t => t.status === 'Completed');

  // --- SUB-COMPONENTS (Scoped to this dashboard) ---
  const TaskCard = ({ task }) => (
    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-blue-200 mb-2 hover:shadow-md transition active:scale-95">
        <h4 className="font-bold text-xs text-blue-900 mb-1 line-clamp-1">{task.title}</h4>
        <p className="text-[10px] text-blue-600 mb-2 line-clamp-2">{task.description}</p>

        <div className="flex justify-between items-center gap-1">
            <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded flex-shrink-0">
                +{task.xpReward || 20} XP
            </span>

            {/* Buttons */}
            {task.status === 'Pending' && (
                <button onClick={() => handleClaim(task._id)} className="text-[10px] bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition">
                    Claim
                </button>
            )}

            {task.status === 'In Progress' && task.assignedUsers.some(u => u._id === user?._id) && (
                <button onClick={() => handleSubmit(task._id)} className="text-[10px] bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 transition">
                    Mark Done
                </button>
            )}

            {task.status === 'Completed' && (
                <span className="text-[10px] text-blue-600 flex items-center gap-1">
                    <Clock size={12}/> In Review
                </span>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-blue-900 bg-[#f0f7ff]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 pb-32">

        {/* TOP HERO SECTION */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-4xl font-black text-blue-700 tracking-tight leading-none">
                Volunteer <span className="text-cyan-600">Hub</span>
              </h1>
              <p className="text-blue-600 font-bold mt-2 uppercase tracking-widest text-[10px]">Your personal impact mission control</p>
            </div>
          </div>
        </section>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* STATS & PROGRESS (Left Column) */}
          <div className="md:col-span-4 space-y-6">
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <GamificationStatCard 
                xp={xp} 
                level={level} 
                progress={progressRatio} 
              />
            </div>
            <div className="transform hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-blue-100">
              <StreakCard days={user?.gamification?.streak || 0} />
            </div>
            
            {/* QUICK STATS MINI-GRID */}
            <div className="grid grid-cols-2 gap-4">
              <BloodGroupSummary />
              <div className="bg-indigo-600 rounded-[2rem] p-5 text-white flex flex-col justify-between shadow-lg shadow-indigo-100">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Global Rank</p>
                  <p className="text-2xl font-black tracking-tighter">#12</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA (Right Column) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* UPCOMING & ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="transform hover:scale-[1.01] transition-transform">
                  <MeetingPreview meeting={upcoming} />
                </div>
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
                   <h3 className="text-slate-900 font-black mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                     <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                     Live Activity
                   </h3>
                   <div className="flex-1 overflow-y-auto max-h-[160px] scrollbar-hide">
                     <ActivityFeed limit={4} />
                   </div>
                </div>
            </div>

            {/* NOTICE BOARD (Full Width in column) */}
            <div className="shadow-2xl shadow-indigo-900/5 rounded-[2.5rem] overflow-hidden">
              <NoticeBoard />
            </div>

          </div>
        </div>

        {/* TASK COMMAND SECTION */}
        <section className="mt-12">
            <div className="flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-300">
                      <ClipboardList size={24} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-blue-900 tracking-tighter">Mission Control</h2>
                      <p className="text-blue-500 font-bold text-[10px] uppercase tracking-widest">Active task deployments</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-600 animate-ping"></span>
                    <span className="bg-cyan-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-cyan-200 uppercase tracking-widest">
                        {tasks.length} Operations Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. AVAILABLE - "THE OPPORTUNITIES" */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 min-h-[400px] shadow-xl shadow-slate-200/50">
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] opacity-50">
                        <Lock size={16} className="text-slate-400" /> New Missions
                    </h3>
                    <div className="space-y-4">
                        {pendingTasks.length === 0 && (
                          <div className="py-20 text-center opacity-20">
                            <Lock size={40} className="mx-auto mb-2" />
                            <p className="text-sm font-bold uppercase">Locked</p>
                          </div>
                        )}
                        {pendingTasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                </div>

                {/* 2. IN PROGRESS - "ACTIVE DUTY" */}
                <div className="bg-slate-900 p-6 rounded-[2.5rem] min-h-[400px] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                    <h3 className="font-black text-blue-400 mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] relative z-10">
                        <PlayCircle size={16} /> Active Operations
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {myTasks.length === 0 && (
                           <div className="py-20 text-center opacity-30">
                             <PlayCircle size={40} className="mx-auto mb-2 text-blue-600" />
                             <p className="text-sm font-bold uppercase text-white">Stand By</p>
                           </div>
                        )}
                        {myTasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                </div>

                {/* 3. UNDER REVIEW - "DEBRIEFING" */}
                <div className="bg-[#f1f5f9] p-6 rounded-[2.5rem] border border-slate-200 min-h-[400px] shadow-inner">
                    <h3 className="font-black text-slate-400 mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                        <CheckCircle size={16} /> Data Verification
                    </h3>
                    <div className="space-y-4">
                        {reviewTasks.length === 0 && (
                           <div className="py-20 text-center opacity-20">
                             <CheckCircle size={40} className="mx-auto mb-2" />
                             <p className="text-sm font-bold uppercase">Clean Slate</p>
                           </div>
                        )}
                        {reviewTasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                </div>

            </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
};

export default BentoDashboard;