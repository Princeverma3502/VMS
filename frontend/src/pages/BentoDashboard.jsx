import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/ui/Header';
import GamificationStatCard from '../components/ui/GamificationStatCard';
import StreakCard from '../components/ui/StreakCard';
import MeetingPreview from '../components/ui/MeetingPreview';
import ActivityFeed from '../components/gamification/ActivityFeed';
import BloodGroupSummary from '../components/ui/BloodGroupSummary';
import BottomNav from '../components/layout/BottomNav';
import useBranding from '../hooks/useBranding';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, PlayCircle, Lock } from 'lucide-react';

const BentoDashboard = () => {
  const { user } = useContext(AuthContext);
  const { primaryColor } = useBranding();
  
  // --- STATE ---
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
    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-200 mb-2 hover:shadow-md transition active:scale-95">
        <h4 className="font-bold text-xs text-gray-800 mb-1 line-clamp-1">{task.title}</h4>
        <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center gap-1">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex-shrink-0">
                +{task.xpReward || 20} XP
            </span>
            
            {/* Buttons */}
            {task.status === 'Pending' && (
                <button onClick={() => handleClaim(task._id)} className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded hover:bg-black transition">
                    Claim
                </button>
            )}
            
            {task.status === 'In Progress' && task.assignedUsers.some(u => u._id === user?._id) && (
                <button onClick={() => handleSubmit(task._id)} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition">
                    Mark Done
                </button>
            )}

            {task.status === 'Completed' && (
                <span className="text-[10px] text-orange-500 flex items-center gap-1">
                    <Clock size={12}/> In Review
                </span>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-800" style={{ background: `linear-gradient(to bottom, ${primaryColor}15, #f8fafc)` }}>
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-6 pb-32">
        
        {/* TOP SECTION: STATS & ACTIVITY */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Left: Stats */}
          <div className="col-span-1 space-y-4">
            <GamificationStatCard 
              xp={user?.gamification?.xpPoints || 0} 
              level={user?.gamification?.level || 1} 
              progress={0.7} // Calculate real progress if needed
            />
            <StreakCard days={user?.gamification?.streak || 0} />
          </div>

          {/* Right: Meeting & Feed */}
          <div className="col-span-2 space-y-4">
            <MeetingPreview meeting={upcoming} />
            <BloodGroupSummary />
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
               <h3 className="text-gray-800 font-bold mb-3 px-2 text-sm uppercase tracking-wider opacity-70">Live Activity</h3>
               <ActivityFeed limit={3} />
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: TASK BOARD WIDGET */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Task Board</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                    {tasks.length} Active
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-2">
                
                {/* 1. AVAILABLE */}
                <div className="bg-white/80 p-3 rounded-xl border border-gray-200 min-h-[300px]">
                    <h3 className="font-bold text-xs text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <Lock size={14} /> Available
                    </h3>
                    <div className="space-y-2">
                        {pendingTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No new tasks</p>}
                        {pendingTasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                </div>

                {/* 2. IN PROGRESS */}
                <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 min-h-[300px]">
                    <h3 className="font-bold text-xs text-blue-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <PlayCircle size={14} /> In Progress
                    </h3>
                    <div className="space-y-2">
                        {myTasks.length === 0 && <p className="text-xs text-blue-300 text-center py-4">No active tasks</p>}
                        {myTasks.map(task => <TaskCard key={task._id} task={task} />)}
                    </div>
                </div>

                {/* 3. UNDER REVIEW */}
                <div className="bg-green-50/80 p-3 rounded-xl border border-green-100 min-h-[300px]">
                    <h3 className="font-bold text-xs text-green-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <CheckCircle size={14} /> Under Review
                    </h3>
                    <div className="space-y-2">
                        {reviewTasks.length === 0 && <p className="text-xs text-green-300 text-center py-4">Nothing in review</p>}
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