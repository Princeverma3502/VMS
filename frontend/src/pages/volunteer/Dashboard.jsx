import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Layout from '../../components/layout/Layout';
import Announcements from '../../components/announcements/Announcements';
import Meetings from '../../components/meetings/Meetings';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { triggerHaptic } from '../../utils/haptics';
import { triggerConfetti } from '../../utils/confetti';
import { shareContent } from '../../utils/nativeShare';
import { calculateLevel, getProgress } from '../../utils/levels';
import { 
  CheckCircle, Clock, PlayCircle, Lock, 
  Share2, Zap, Trophy, Flame 
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await api.put(`/tasks/${id}/claim`);
      triggerHaptic('success');
      fetchTasks(); 
    } catch (err) { 
      triggerHaptic('error');
      alert(err.response?.data?.message); 
    }
  };

  const handleSubmit = async (id) => {
    try {
      await api.put(`/tasks/${id}/submit`, { submissionData: '' });
      triggerHaptic('success');
      triggerConfetti(2000); // Celebrate task submission
      fetchTasks();
    } catch (err) { 
      triggerHaptic('error');
      alert(err.response?.data?.message); 
    }
  };

  const handleShare = (task) => {
    triggerHaptic('success');
    shareContent("NSS Task", `Join me for: "${task.title}"`, window.location.origin);
  };

  const xp = user?.gamification?.xpPoints || 0;
  const level = calculateLevel(xp);
  const progress = getProgress(xp);

  // --- VISIBILITY FIX: Task Card ---
  const TaskCard = ({ task }) => (
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 mb-3 active:scale-95 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-black text-sm text-slate-900 leading-snug line-clamp-2">{task.title}</h4>
        <button onClick={() => handleShare(task)} className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors">
          <Share2 size={16} />
        </button>
      </div>
      
      <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2 leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
          <Zap size={12} className="text-blue-600 fill-blue-600" />
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
            +{task.xpReward || 20} XP
          </span>
        </div>

        {task.status === 'Pending' && (
          <button onClick={() => handleClaim(task._id)} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-black transition-colors">
            Claim Task
          </button>
        )}
        {task.status === 'In Progress' && task.assignedUsers.some(u => u._id === user?._id) && (
          <button onClick={() => handleSubmit(task._id)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors">
            Mark Done
          </button>
        )}
        {task.status === 'Completed' && (
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 border border-orange-100">
            <Clock size={12}/> In Review
          </span>
        )}
      </div>
    </div>
  );

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const myTasks = tasks.filter(t => t.status === 'In Progress' && t.assignedUsers.some(u => u._id === user?._id));

  return (
    <Layout userRole={user?.role || 'Volunteer'} showBackButton={true}>

      {/* ANNOUNCEMENTS & MEETINGS */}
      {!loading && (
        <div className="space-y-6 mb-6">
          <Announcements />
          <Meetings />
        </div>
      )}

      {loading && <SkeletonLoader count={2} type="card" />}

      {/* GAMIFIED HEADER (High Visibility) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
              <Flame className="text-orange-500 fill-orange-500" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Current Streak</p>
              <p className="text-xl font-black text-slate-900 leading-none">{user?.gamification?.streak || 0} Days</p>
            </div>
          </div>
          <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Current Level</p>
              <p className="text-2xl font-black text-blue-600 leading-none">{level}</p>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Lvl {level}</p>
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
             {Math.round(progress)}% to Level {level + 1}
           </p>
           <p className="text-[10px] font-bold text-slate-400 uppercase">Lvl {level + 1}</p>
        </div>
      </div>

      {/* HORIZONTAL SCROLL TASKS */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
        
        {/* Available Tasks Column */}
        <div className="min-w-[85vw] md:min-w-[320px] snap-center">
          <h3 className="font-black text-slate-700 mb-3 flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
            <Lock size={16} className="text-slate-400" />
            Available Tasks <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md">{pendingTasks.length}</span>
          </h3>
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 min-h-[200px]">
            {pendingTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No tasks available</div>
            ) : (
                pendingTasks.map(task => <TaskCard key={task._id} task={task} />)
            )}
          </div>
        </div>

        {/* My Tasks Column */}
        <div className="min-w-[85vw] md:min-w-[320px] snap-center">
          <h3 className="font-black text-blue-700 mb-3 flex items-center gap-2 px-1 text-sm uppercase tracking-wide">
            <PlayCircle size={16} className="text-blue-600" />
            My Active Tasks <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md">{myTasks.length}</span>
          </h3>
          <div className="bg-blue-50/50 p-2 rounded-2xl border border-blue-100 min-h-[200px]">
            {myTasks.length === 0 ? (
                <div className="text-center py-10 text-blue-300 text-xs font-bold uppercase">No active tasks</div>
            ) : (
                myTasks.map(task => <TaskCard key={task._id} task={task} />)
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default VolunteerDashboard;