import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- CONTEXT & API ---
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// --- LAYOUT & COMPONENTS ---
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import { triggerHaptic } from '../../utils/haptics';

// --- FORMS ---
import RegisterNGOForm from '../../components/forms/RegisterNGOForm';
import DomainForm from '../../components/forms/DomainForm'; 
import CreateEventForm from '../../components/forms/CreateEventForm';
import CreateTaskForm from '../../components/forms/CreateTaskForm';
import CreateAnnouncementForm from '../../components/forms/CreateAnnouncementForm';
import ScheduleMeetingForm from '../../components/forms/ScheduleMeetingForm';

// --- ICONS (Lucide) ---
import { 
  Building2, Activity, UserPlus, Calendar, ClipboardList, 
  CheckCircle, Trash2, RefreshCw, User, ShieldCheck, 
  Bell, Users, Plus, LayoutGrid, Zap, Sparkles, LogOut,
  ChevronRight, ArrowRight
} from 'lucide-react';

const SecretaryDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isSecretary = user?.role === 'Secretary';

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(isSecretary ? 'overview' : 'tasks');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [stats, setStats] = useState({ ngos: 0, events: 0, pendingTasks: 0, pendingApprovals: 0 });
  const [ngos, setNgos] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [allDomainHeads, setAllDomainHeads] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      const [eventRes, taskRes] = await Promise.all([
        api.get('/events'),
        api.get('/tasks')
      ]);

      setEvents(eventRes.data);
      setTasks(taskRes.data);

      if (isSecretary) {
        const [ngoRes, pendingRes, volRes, auditRes, usersRes] = await Promise.all([
          api.get('/ngos'),
          api.get('/auth/pending'),
          api.get('/users/leaderboard'),
          api.get('/audit/logs'),
          api.get('/users')
        ]);
        setNgos(ngoRes.data);
        setPendingUsers(pendingRes.data);
        setAllVolunteers(volRes.data);
        setAuditLogs(auditRes.data || []);
        
        const domainHeads = usersRes.data?.filter(u => u.role === 'Domain Head') || [];
        setAllDomainHeads(domainHeads);
        
        setStats({
          ngos: ngoRes.data.length,
          events: eventRes.data.length,
          pendingTasks: taskRes.data.filter(t => t.status === 'Completed').length,
          pendingApprovals: pendingRes.data.length
        });
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSecretary]);

  // --- ACTION HANDLERS ---
  const handleApproveUser = async (id) => {
    try {
      await api.put(`/auth/approve/${id}`);
      toast.success("Identity Verified & Approved");
      triggerHaptic('success');
      fetchData();
    } catch (error) { toast.error("Approval sequence failed"); }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Initialize password reset for this user?")) return;
    try {
      await api.put(`/auth/reset-password/${id}`);
      toast.success("Security Credentials Reset to Default");
      triggerHaptic('warning');
    } catch (error) { toast.error("Reset failed"); }
  };

  const handleVerifyTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/verify`);
      toast.success("Task Synchronized & XP Awarded");
      triggerHaptic('success');
      fetchData();
    } catch (error) { toast.error("Verification failed"); }
  };

  const EmptyState = ({ message, icon: Icon = Zap }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
         <Icon size={32} />
       </div>
       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
  );

  return (
    <Layout userRole={user?.role} showBackButton={false}>
      
      {/* 1. HERO HEADER */}
      <div className="mb-12 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 text-indigo-600">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Terminal</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                Unit <span className="text-indigo-600">Command</span>
              </h1>
              <p className="mt-4 text-slate-500 font-medium max-w-lg leading-relaxed text-sm italic">
                Strategic oversight, multi-tenancy controls, and global volunteer authorization.
              </p>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                {['overview', 'tasks', 'events', 'audit'].map(tab => (
                 (tab === 'overview' || tab === 'audit') && !isSecretary ? null : (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                       activeTab === tab ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
                     }`}
                   >
                     {tab}
                   </button>
                 )
                ))}
            </div>
        </div>
      </div>

      {/* 2. STATS BENTO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-900/5 group hover:scale-[1.02] transition-transform">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><ClipboardList size={20}/></div>
              <Zap className="text-indigo-100 group-hover:text-indigo-400 transition-colors" size={24}/>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
           <p className="text-3xl font-black text-slate-900">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 group hover:scale-[1.02] transition-transform">
           <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600"><Calendar size={20}/></div>
              <Sparkles className="text-slate-100 group-hover:text-indigo-400 transition-colors" size={24}/>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Events</p>
           <p className="text-3xl font-black text-slate-900">{stats.events}</p>
        </div>
        {isSecretary && (
          <>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-green-900/5 group hover:scale-[1.02] transition-transform">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-50 p-2.5 rounded-xl text-green-600"><Building2 size={20}/></div>
                  <ArrowRight className="text-green-100 group-hover:text-green-400 transition-colors" size={24}/>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partners</p>
               <p className="text-3xl font-black text-slate-900">{stats.ngos}</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-orange-900/5 group hover:scale-[1.02] transition-transform ring-2 ring-orange-500/20">
               <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600"><UserPlus size={20}/></div>
                  <Activity className="text-orange-100 group-hover:text-orange-400 animate-pulse transition-colors" size={24}/>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requests</p>
               <p className="text-3xl font-black text-slate-900">{stats.pendingApprovals}</p>
            </div>
          </>
        )}
      </div>

      {/* 3. TAB CONTENT */}
      <div className="transition-all duration-500">
        
        {/* TAB: OVERVIEW (Secretary Only) */}
        {activeTab === 'overview' && isSecretary && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ACTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowAnnouncementForm(true)}
                  className="group relative overflow-hidden bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 active:scale-95 transition-all text-left"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <Bell className="mb-6 opacity-40" size={32} />
                    <h3 className="text-xl font-black tracking-tight mb-2">Deploy Announcement</h3>
                    <p className="text-xs text-indigo-300 font-medium">Broadcast critical mission updates to all unit volunteers.</p>
                  </div>
                  <ChevronRight className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </button>

                <button 
                  onClick={() => setShowMeetingForm(true)}
                  className="group relative overflow-hidden bg-white text-slate-900 p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-200 shadow-xl hover:shadow-indigo-900/5 active:scale-95 transition-all text-left"
                >
                  <div className="relative z-10">
                    <Users className="mb-6 text-indigo-600 opacity-40" size={32} />
                    <h3 className="text-xl font-black tracking-tight mb-2">Orchestrate Meeting</h3>
                    <p className="text-xs text-slate-400 font-medium">Synchronize unit goals and schedule upcoming field operations.</p>
                  </div>
                  <ChevronRight className="absolute bottom-8 right-8 text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-10">
                   <div className="bg-white p-2 rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-100">
                      <RegisterNGOForm onSuccess={fetchData} />
                   </div>
                   <div className="bg-white p-2 rounded-[3.5rem] shadow-xl shadow-slate-100 border border-slate-100">
                      <DomainForm users={allDomainHeads} onSubmit={async (data) => {
                         try {
                           await api.post('/domains', data);
                           toast.success("New Domain Established");
                           fetchData();
                         } catch(e) { toast.error("Failed to establish domain"); }
                      }} />
                   </div>
                </div>

                <div className="space-y-10">
                  {/* Approvals Card */}
                  <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl shadow-slate-900/20">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                         <UserPlus size={16} className="text-indigo-400" /> Identity Queue
                       </h3>
                       {pendingUsers.length > 0 && <span className="bg-indigo-600 text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse">{pendingUsers.length}</span>}
                    </div>
                    {pendingUsers.length === 0 ? <EmptyState message="All Identities Verified" icon={ShieldCheck} /> : (
                       <div className="space-y-3">
                         {pendingUsers.map(u => (
                           <div key={u._id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                             <div>
                               <p className="text-sm font-bold tracking-tight">{u.name}</p>
                               <p className="text-[10px] opacity-40 font-medium">{u.email}</p>
                             </div>
                             <button onClick={() => handleApproveUser(u._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">Invoke</button>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>

                  {/* Volunteers List Card */}
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                       <Users size={16} /> Asset Repository
                    </h3>
                    <div className="max-h-80 overflow-y-auto space-y-4 no-scrollbar">
                      {allVolunteers.map(v => (
                        <div key={v._id} className="flex justify-between items-center group p-3 hover:bg-indigo-50 rounded-2xl transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                {v.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{v.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{v.role}</p>
                              </div>
                           </div>
                           <button onClick={() => handleResetPassword(v._id)} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 p-2"><RefreshCw size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* TAB: TASKS */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="lg:col-span-1 bg-white p-2 rounded-[3.5rem] shadow-xl border border-slate-100">
                <CreateTaskForm onTaskCreated={() => { fetchData(); toast.success("Mission Deployed"); }} />
             </div>
             
             <div className="lg:col-span-2 space-y-8">
                {/* Verification List */}
                <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100">
                  <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                    <CheckCircle className="text-indigo-600" size={16}/> Data Verification Hub
                  </h3>
                  <div className="space-y-4">
                    {tasks.filter(t => t.status === 'Completed').map(task => (
                      <div key={task._id} className="p-5 bg-white rounded-3xl flex justify-between items-center shadow-sm border border-indigo-100 hover:shadow-indigo-900/5 transition-all">
                        <div>
                          <h4 className="font-black text-slate-900 leading-tight">{task.title}</h4>
                          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Ready for debrief</p>
                        </div>
                        <button onClick={() => handleVerifyTask(task._id)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">Authorize</button>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'Completed').length === 0 && <EmptyState message="Verification Queue Clear" icon={CheckCircle} />}
                  </div>
                </div>

                {/* All Tasks */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Active Operations</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.map(task => (
                        <div key={task._id} className="p-5 border border-slate-100 bg-slate-50 rounded-[2rem] flex justify-between items-center group hover:border-indigo-200 transition-all">
                           <div>
                             <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{task.title}</p>
                             <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
                               task.status === 'Completed' ? 'text-green-600' : task.status === 'In Progress' ? 'text-indigo-600' : 'text-slate-400'
                             }`}>{task.status}</p>
                           </div>
                           <button onClick={async () => {
                              if (!window.confirm("Permanently wipe this mission data?")) return;
                              try {
                                await api.delete(`/tasks/${task._id}`);
                                toast.success("Operation Terminated");
                                setTaskLoading(true);
                                fetchData();
                              } catch(e) { toast.error("Termination failed"); }
                           }} className="text-slate-300 hover:text-red-600 p-2 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      {tasks.length === 0 && <EmptyState message="No Operations Deployed" />}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-2 rounded-[3.5rem] shadow-xl border border-slate-100">
                <CreateEventForm onSuccess={() => { fetchData(); toast.success("Event Sequence Initiated"); }} />
             </div>
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-900/5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2"><Activity size={16}/> Live Operational Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(evt => (
                    <div key={evt._id} className="p-6 border border-slate-100 rounded-[2.5rem] bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group">
                      <h4 className="font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{evt.title}</h4>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-400" />
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(evt.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <div className="col-span-full"><EmptyState message="No Live Events Found" /></div>}
                </div>
             </div>
          </div>
        )}

        {/* TAB: AUDIT LOGS */}
        {activeTab === 'audit' && isSecretary && (
          <div className="bg-slate-900 text-white rounded-[3.5rem] shadow-2xl p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                    <ShieldCheck className="text-indigo-500" size={32}/> System Audit log
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest italic leading-relaxed">Immutable track of all administrative commands</p>
               </div>
               <Activity className="text-indigo-500 opacity-20 animate-pulse" size={48} />
            </div>
            
            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/20">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-white/5 text-slate-500 uppercase text-[9px] font-black tracking-[0.3em]">
                  <tr><th className="p-6">Timestamp</th><th className="p-6">Executive</th><th className="p-6">Action Sequence</th><th className="p-6">Target Entity</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map(log => (
                    <tr key={log._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6 text-indigo-400 text-[10px] font-black">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-6">
                         <p className="font-black text-slate-200 tracking-tight">{log.performedBy?.name}</p>
                         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{log.performedBy?.role}</p>
                      </td>
                      <td className="p-6 mx-auto"><span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{log.action}</span></td>
                      <td className="p-6 text-slate-400 font-medium italic">{log.targetEntity}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && <tr><td colSpan="4" className="p-12"><EmptyState message="System Integrity Verified - No Logs" /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODALS */}
      {showAnnouncementForm && (
        <CreateAnnouncementForm 
          onClose={() => setShowAnnouncementForm(false)}
          onSuccess={() => {
            setShowAnnouncementForm(false);
            fetchData();
            toast.success("Broadcast Successful");
          }}
        />
      )}

      {showMeetingForm && (
        <ScheduleMeetingForm 
          onClose={() => setShowMeetingForm(false)}
          onSuccess={() => {
            setShowMeetingForm(false);
            fetchData();
            toast.success("Schedule Updated");
          }}
        />
      )}
    </Layout>
  );
};

export default SecretaryDashboard;