import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, Clock, PlayCircle, Lock, Target, Zap, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { EliteEmptyState, EliteSkeleton } from '../../components/ui/EliteUI';

const TaskBoard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingTask, setSubmittingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Operation Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
        await api.put(`/tasks/${id}/claim`);
        toast.success("Mission Claimed & Active");
        fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || "Hacking attempt detected"); }
  };

  const handleSubmit = async (id, submissionData) => {
    try {
        await api.put(`/tasks/${id}/submit`, { submissionData });
        toast.success("Data Uploaded - Under Review");
        fetchTasks();
        setSubmittingTask(null);
    } catch (err) { toast.error(err.response?.data?.message || "Encryption failed"); }
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 border border-slate-100 mb-6 hover:shadow-indigo-900/10 transition-all active:scale-95 group relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${
          task.status === 'Pending' ? 'bg-slate-300' : task.status === 'In Progress' ? 'bg-indigo-600' : 'bg-green-500'
        }`}></div>
        
        <h4 className="font-black text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest line-clamp-2 leading-relaxed mb-6 italic">{task.description}</p>
        
        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
               <Zap size={14} className="text-indigo-600" />
               <span className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">+{task.xpReward || 20} XP</span>
            </div>
            
            {task.status === 'Pending' && (
                <button onClick={() => handleClaim(task._id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                    Claim <ArrowRight size={12} />
                </button>
            )}
            
            {task.status === 'In Progress' && task.assignedUsers?.some(u => u._id === user?._id) && (
                <button onClick={() => setSubmittingTask(task)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-lg shadow-indigo-600/20">
                    Mark Done
                </button>
            )}

            {task.status === 'Completed' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg text-green-600 text-[9px] font-black uppercase tracking-widest">
                    <Clock size={12}/> Verified
                </div>
            )}
        </div>
    </div>
  );

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const myTasks = tasks.filter(t => t.status === 'In Progress' && t.assignedUsers?.some(u => u._id === user?._id));
  const reviewTasks = tasks.filter(t => t.status === 'Completed');

  const SubmissionModal = () => {
    const [notes, setNotes] = useState('');
    if (!submittingTask) return null;

    return (
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-6 z-[10000] animate-in fade-in duration-300">
        <div className="bg-white rounded-[3.5rem] p-10 w-full max-w-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-100 animate-in slide-in-from-bottom-8">
           <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <ShieldCheck size={32} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Final Submission</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Deploying Proof for: <span className="text-indigo-600">{submittingTask.title}</span></p>
           
           <div className="relative mb-8">
             <MessageSquare size={16} className="absolute top-4 left-4 text-slate-300" />
             <textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="System notes, completion links, or mission proof..."
               className="w-full h-40 p-6 pl-12 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:bg-white focus:border-indigo-600 transition-all no-scrollbar"
             ></textarea>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setSubmittingTask(null)} className="flex-1 px-4 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200">Cancel</button>
             <button onClick={() => handleSubmit(submittingTask._id, notes)} className="flex-[2] px-4 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-slate-950 transition-all">Upload Proof</button>
           </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <Layout userRole="Volunteer" showBackButton={true}>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-8">
          <EliteSkeleton className="h-[60vh] rounded-[3rem]" />
          <EliteSkeleton className="h-[60vh] rounded-[3rem]" />
          <EliteSkeleton className="h-[60vh] rounded-[3rem]" />
       </div>
    </Layout>
  );

  return (
    <Layout userRole={user?.role || 'Volunteer'} showBackButton={true}>
      <SubmissionModal />

      <div className="max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER BLOCK */}
        <div className="mb-12 relative px-4">
           <div className="flex items-center gap-3 mb-3">
              <Target size={20} className="text-indigo-600" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Operations Center</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Mission <span className="text-indigo-600">Control</span></h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4 italic max-w-lg">Claim active deployments, fulfill requirements, and earn XP signatures.</p>
        </div>

        {/* KANBAN BENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-[calc(100vh-320px)] lg:h-[calc(100vh-320px)] px-4">
           
           {/* 1. AVAILABLE MISSIONS */}
           <div className="bg-white/50 backdrop-blur-sm rounded-[3.5rem] border border-slate-100 shadow-xl p-8 flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center mb-8 relative z-10">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Lock size={14} className="text-slate-300" /> New Deployments
                 </h3>
                 <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg border border-slate-200">{pendingTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-2 relative z-10">
                 {pendingTasks.map(task => <TaskCard key={task._id} task={task} />)}
                 {pendingTasks.length === 0 && <EliteEmptyState message="All Local Missions Cleared" icon={ShieldCheck} />}
              </div>
           </div>

           {/* 2. ACTIVE OPERATIONS */}
           <div className="bg-slate-900 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] p-8 flex flex-col overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-200 transition-transform duration-1000"></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                 <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <PlayCircle size={14} className="animate-pulse" /> Active Duty
                 </h3>
                 <span className="bg-white/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-lg border border-white/5 uppercase tracking-widest">In Motion</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-2 relative z-10">
                 {myTasks.length === 0 ? <EliteEmptyState message="No Operations Active"  /> : 
                  myTasks.map(task => <TaskCard key={task._id} task={task} />)
                 }
              </div>
           </div>

           {/* 3. UNDER REVIEW */}
           <div className="bg-slate-50/50 rounded-[3.5rem] border border-slate-200 p-8 flex flex-col overflow-hidden shadow-inner">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Clock size={14} /> Data Verification
                 </h3>
                 <span className="bg-slate-200 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg border border-slate-300">Debrief</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-2">
                 {reviewTasks.map(task => <TaskCard key={task._id} task={task} />)}
                 {reviewTasks.length === 0 && <EliteEmptyState title="Cleared" message="Verification Queue Blank" icon={CheckCircle} />}
              </div>
           </div>

        </div>

      </div>
    </Layout>
  );
};

export default TaskBoard;