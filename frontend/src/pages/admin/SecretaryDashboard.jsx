import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// --- CONTEXT & API ---
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

// --- LAYOUT & COMPONENTS ---
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';

// --- FORMS ---
import RegisterNGOForm from '../../components/forms/RegisterNGOForm';
import DomainForm from '../../components/forms/DomainForm'; 
import CreateEventForm from '../../components/forms/CreateEventForm';
import CreateTaskForm from '../../components/forms/CreateTaskForm';
import CreateAnnouncementForm from '../../components/forms/CreateAnnouncementForm';
import ScheduleMeetingForm from '../../components/forms/ScheduleMeetingForm';

// --- ICONS (Lucide) ---
import { 
  Building2, 
  Activity, 
  UserPlus, 
  Calendar, 
  ClipboardList, 
  CheckCircle, 
  Trash2, 
  RefreshCw, 
  User, 
  ShieldCheck, 
  History,
  MapPin,
  Search,
  MoreVertical,
  Bell,
  Users,
  Plus
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
        
        // Filter domain heads from users list
        const domainHeads = usersRes.data?.filter(u => u.role === 'Domain Head') || [];
        setAllDomainHeads(domainHeads);
        
        setStats({
          ngos: ngoRes.data.length,
          events: eventRes.data.length,
          pendingTasks: taskRes.data.filter(t => t.status === 'Completed').length,
          pendingApprovals: pendingRes.data.length
        });
      } else {
        setStats(prev => ({
          ...prev,
          events: eventRes.data.length,
          pendingTasks: taskRes.data.filter(t => t.status === 'Completed').length
        }));
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSecretary]);

  // --- ACTION HANDLERS ---
  const handleCreateDomain = async (domainData) => {
    try {
      await api.post('/domains', domainData);
      alert("Domain Created!");
      fetchData();
    } catch (err) { alert("Error creating domain"); }
  };

  const handleApproveUser = async (id) => {
    try {
      await api.put(`/auth/approve/${id}`);
      alert("User Approved!");
      fetchData();
    } catch (error) { alert("Approval failed"); }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Reset password to 'Welcome@123'?")) return;
    try {
      await api.put(`/auth/reset-password/${id}`);
      alert("Password Reset to: Welcome@123");
    } catch (error) { alert("Reset failed"); }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task permanently?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (error) { alert("Delete failed"); }
  };

  const handleVerifyTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/verify`);
      alert("Task Verified & XP Awarded!");
      fetchData();
    } catch (error) { alert("Verification failed"); }
  };

  return (
    <Layout userRole={user?.role} showBackButton={true}>
      

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Tasks to Verify" value={stats.pendingTasks} icon={<ClipboardList size={24}/>} type="purple" />
        <StatCard label="Total Events" value={stats.events} icon={<Calendar size={24}/>} type="default" />
        {isSecretary && (
          <>
            <StatCard label="NGOs" value={stats.ngos} icon={<Building2 size={24}/>} type="success" />
            <StatCard label="Pending" value={stats.pendingApprovals} icon={<UserPlus size={24}/>} type="gold" />
          </>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {isSecretary && (
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-bold transition-all ${activeTab === 'overview' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Admin Overview</button>
        )}
        <button onClick={() => setActiveTab('tasks')} className={`px-6 py-3 font-bold transition-all ${activeTab === 'tasks' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Task Mgmt</button>
        <button onClick={() => setActiveTab('events')} className={`px-6 py-3 font-bold transition-all ${activeTab === 'events' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Events</button>
        {isSecretary && (
          <button onClick={() => setActiveTab('audit')} className={`px-6 py-3 font-bold transition-all ${activeTab === 'audit' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Audit Logs</button>
        )}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && isSecretary && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
            >
              <Bell size={20} /> New Announcement
            </button>
            <button 
              onClick={() => setShowMeetingForm(true)}
              className="bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
            >
              <Users size={20} /> Schedule Meeting
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <RegisterNGOForm onSuccess={fetchData} />
              <DomainForm users={allDomainHeads} onSubmit={handleCreateDomain} />
            </div>
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={20}/> Approvals</h3>
                {pendingUsers.length === 0 && <p className="text-gray-400 text-sm italic">No pending registrations.</p>}
                {pendingUsers.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <span className="text-sm font-medium">{u.name}</span>
                    <button onClick={() => handleApproveUser(u._id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Approve</button>
                  </div>
                ))}
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20}/> Volunteers</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {allVolunteers.map(v => (
                    <div key={v._id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                      <span>{v.name}</span>
                      <button onClick={() => handleResetPassword(v._id)} className="text-blue-500 text-[10px] font-bold uppercase"><RefreshCw size={10} className="inline mr-1"/> Reset</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-1"><CreateTaskForm onTaskCreated={fetchData} /></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle className="text-orange-500" size={20}/> Verification Queue</h3>
              {tasks.filter(t => t.status === 'Completed').map(task => (
                <div key={task._id} className="p-4 border rounded-xl flex justify-between items-center bg-orange-50 mb-3 border-orange-200">
                  <h4 className="font-bold text-gray-800">{task.title}</h4>
                  <button onClick={() => handleVerifyTask(task._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Verify</button>
                </div>
              ))}
              {tasks.filter(t => t.status === 'Completed').length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Clear!</p>}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Task List</h3>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task._id} className="p-3 border rounded-xl flex justify-between items-center group">
                    <span className="text-sm font-medium">{task.title}</span>
                    <button onClick={() => handleDeleteTask(task._id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-8 animate-fade-in">
          <CreateEventForm onSuccess={fetchData} />
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity size={20}/> Live Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map(evt => (
                <div key={evt._id} className="p-4 border rounded-2xl bg-gray-50">
                  <h4 className="font-bold text-gray-800">{evt.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase"><Calendar size={10} className="inline"/> {new Date(evt.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === 'audit' && isSecretary && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-lg"><ShieldCheck className="text-blue-600" size={24}/> System Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                <tr><th className="p-4">Time</th><th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4">Entity</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-bold">{log.performedBy?.name}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{log.action}</span></td>
                    <td className="p-4 text-gray-700">{log.targetEntity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAnnouncementForm && (
        <CreateAnnouncementForm 
          onClose={() => setShowAnnouncementForm(false)}
          onSuccess={() => {
            setShowAnnouncementForm(false);
            fetchData();
          }}
        />
      )}

      {showMeetingForm && (
        <ScheduleMeetingForm 
          onClose={() => setShowMeetingForm(false)}
          onSuccess={() => {
            setShowMeetingForm(false);
            fetchData();
          }}
        />
      )}
    </Layout>
  );
};

export default SecretaryDashboard;