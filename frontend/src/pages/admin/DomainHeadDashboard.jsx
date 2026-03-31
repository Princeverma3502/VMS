import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import { 
  Users, ClipboardList, Calendar, Zap, 
  MessageSquare, ShieldCheck, TrendingUp 
} from 'lucide-react';

const DomainHeadDashboard = () => {
  const { user } = useContext(AuthContext);
  const [domainStats, setDomainStats] = useState({ volunteers: 0, pendingTasks: 0, activeEvents: 0 });
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDomainData();
  }, []);

  const fetchDomainData = async () => {
    try {
      setLoading(true);
      // Fetch domain-specific volunteers (filtered by domainId in backend)
      const usersRes = await api.get('/users?role=Volunteer');
      setVolunteers(usersRes.data || []);
      
      // Fetch domain-specific tasks
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data || []);

      setDomainStats({
        volunteers: usersRes.data.length,
        pendingTasks: tasksRes.data.filter(t => t.status === 'Completed').length,
        activeEvents: 0 // Fetch from events if domain-scoped events exist
      });
      setLoading(false);
    } catch (err) {
      console.error("Domain Data Fetch Error:", err);
      setLoading(false);
    }
  };

  return (
    <Layout userRole={user?.role} showBackButton={true}>
      <div className="max-w-7xl mx-auto py-4">
        
        {/* DASHBOARD HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-teal-700 rounded-xl text-cyan-300 shadow-lg shadow-teal-500/20">
                <ShieldCheck size={28} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-700">Administrative Oversight</span>
            </div>
            <h1 className="text-4xl font-black text-teal-900 tracking-tight leading-none">
              {user?.domainName || 'Domain'} <span className="text-teal-600">Command</span>
            </h1>
            <p className="text-teal-700 font-bold mt-3 text-sm">Strategic management and impact tracking for your domain fleet.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="h-12 w-[1px] bg-teal-200 hidden md:block mx-4"></div>
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest mb-1">Current Sector</p>
                <p className="text-sm font-black text-teal-900">{user?.collegeName || 'Main Campus'}</p>
             </div>
          </div>
        </div>

        {/* TOP LEVEL INTELLIGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Active Personnel" value={domainStats.volunteers} icon={<Users size={20}/>} type="default" className="shadow-xl shadow-slate-200/50 rounded-[2rem] border-none" />
          <StatCard label="Pending Deployments" value={domainStats.pendingTasks} icon={<ClipboardList size={20}/>} type="purple" className="shadow-xl shadow-purple-100 rounded-[2rem] border-none" />
          <StatCard label="Operational Impact" value="1,240 XP" icon={<TrendingUp size={20}/>} type="success" className="shadow-xl shadow-emerald-100 rounded-[2rem] border-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PERSONNEL ROSTER (Left) */}
          <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-teal-200/60 border border-teal-100/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-teal-900 text-lg tracking-tight">Personnel Roster</h3>
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">Live Team Status</p>
              </div>
              <button className="text-[10px] font-black text-teal-700 bg-teal-100 px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-teal-700 hover:text-white transition-all">
                Full Registry
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {volunteers.map(v => (
                <div key={v._id} className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-200 hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-900 flex items-center justify-center font-black text-cyan-300 shadow-lg group-hover:bg-teal-700 group-hover:text-white transition-colors">
                      {v.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-teal-900 text-sm leading-tight">{v.name}</p>
                      <p className="text-[10px] text-teal-700 font-bold uppercase tracking-widest mt-1">{v.branch} • Year {v.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <p className="font-black text-teal-900 text-xs">Lv. {v.gamification?.level || 1}</p>
                    </div>
                    <p className="text-[10px] text-teal-700 font-black uppercase tracking-tighter bg-teal-100 px-2 py-0.5 rounded-md inline-block">{v.gamification?.xpPoints || 0} XP</p>
                  </div>
                </div>
              ))}
              {volunteers.length === 0 && (
                 <div className="py-20 text-center text-teal-300">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest text-teal-600">No personnel detected</p>
                 </div>
              )}
            </div>
          </div>

          {/* UTILITIES & VERIFICATION (Right) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* QUICK ACTIONS */}
            <div className="bg-teal-900 p-8 rounded-[2.5rem] shadow-2xl shadow-teal-900/30 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all"></div>
              <h3 className="font-black mb-8 flex items-center gap-3 text-cyan-400 uppercase tracking-[0.2em] text-[10px] relative z-10">
                <Zap size={16}/> Comms Hub
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <button className="group/btn p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 hover:border-cyan-400">
                  <MessageSquare size={24} className="text-white group-hover/btn:scale-110 group-hover/btn:text-cyan-400 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Broadcast</span>
                </button>
                <button className="group/btn p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center gap-3 hover:border-teal-400">
                  <Calendar size={24} className="text-white group-hover/btn:scale-110 group-hover/btn:text-teal-400 transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Deployment</span>
                </button>
              </div>
            </div>

            {/* TASK REVIEW STACK */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-teal-200/50 border border-teal-100 overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-teal-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                   <ClipboardList size={18} className="text-teal-700" /> Verify Ops
                 </h3>
                 {tasks.filter(t => t.status === 'Completed').length > 0 && (
                    <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg animate-pulse">
                       ACTION REQ
                    </span>
                 )}
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.filter(t => t.status === 'Completed').map(task => (
                  <div key={task._id} className="p-5 border border-teal-200 rounded-2xl bg-teal-50 hover:bg-white hover:shadow-lg transition-all border-l-4 border-l-teal-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-teal-900 text-sm tracking-tight">{task.title}</h4>
                        <p className="text-[10px] text-teal-700 font-bold uppercase mt-1">Status: Pending Proof</p>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg active:scale-95">
                      Verify Deployment
                    </button>
                  </div>
                ))}

                {tasks.filter(t => t.status === 'Completed').length === 0 && (
                  <div className="text-center py-12">
                     <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <ShieldCheck size={32} />
                     </div>
                     <p className="text-teal-700 text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};

export default DomainHeadDashboard;
