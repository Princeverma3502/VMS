import React, { useState, useEffect, useContext } from 'react';
import { Plus, ClipboardCheck, Clock, Trash2, AlertCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ManageTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Open', 'In Progress', 'Completed', 'Verified'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    xpReward: 20,
    category: 'Cleanliness'
  });

  useEffect(() => {
    if (activeTab === 'view') {
      fetchTasks();
    }
  }, [activeTab, filterStatus]);

  const fetchTasks = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  const handleVerify = async (taskId) => {
    if (!window.confirm("Are you sure you want to verify this task and award XP?")) return;
    try {
      await api.put(`/tasks/${taskId}/verify`);
      alert("Task verified successfully!");
      fetchTasks();
    } catch (err) {
      alert("Error verifying task");
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      alert("Task deleted successfully!");
      fetchTasks();
    } catch (err) {
      alert("Error deleting task");
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', formData);
      setFormData({ title: '', description: '', deadline: '', xpReward: 20, category: 'Cleanliness' });
      setActiveTab('view');
      fetchTasks();
    } catch (err) {
      alert("Error creating task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole={user?.role} showBackButton={true}>
      
      <div className="pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 uppercase italic">Task Command</h1>
        <p className="text-gray-500 text-sm font-medium">Manage and deploy volunteer missions</p>
      </header>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('view')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'view' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          Active Tasks
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'create' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          Create New
        </button>
      </div>

      {activeTab === 'view' ? (
        <>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {['all', 'Open', 'In Progress', 'Completed', 'Verified'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filterStatus === status ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        <div className="space-y-4">
          {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-400 font-medium">No tasks deployed for this status.</div>
          )}
          {tasks.map(task => (
            <div key={task._id} className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {task.category}
                </span>
                <span className="text-blue-600 font-black text-sm">+{task.xpReward} XP</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{task.title}</h3>
              <p className="text-gray-500 text-xs mb-4 line-clamp-2">{task.description}</p>
              
              <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase">{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${task.status === 'Completed' ? 'bg-green-100 text-green-600' : task.status === 'Verified' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                  {task.status}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 mt-4 pt-4">
                {task.status === 'Completed' && (
                  <button onClick={() => handleVerify(task._id)} className="flex items-center gap-2 text-xs font-bold text-white bg-green-500 px-3 py-2 rounded-lg">
                    <ClipboardCheck size={14} />
                    VERIFY
                  </button>
                )}
                 <button onClick={() => handleDelete(task._id)} className="flex items-center gap-2 text-xs font-bold text-white bg-red-500 px-3 py-2 rounded-lg">
                    <Trash2 size={14} />
                    DELETE
                  </button>
              </div>

            </div>
          ))}
        </div>
        </>
      ) : (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Mission Title</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Campus Cleaning Drive"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Description</label>
            <textarea 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">Deadline</label>
              <input 
                type="date" 
                required
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-2">XP Reward</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold"
                value={formData.xpReward}
                onChange={(e) => setFormData({...formData, xpReward: e.target.value})}
              />
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 mt-4 active:scale-95 transition-all"
          >
            {loading ? "DEPLOYING..." : "DEPLOY MISSION"}
          </button>
        </form>
      )}
      </div>
    </Layout>
  );
};

export default ManageTasks;