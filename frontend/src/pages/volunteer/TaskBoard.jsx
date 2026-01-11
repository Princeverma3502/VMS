import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, Clock, PlayCircle, Lock } from 'lucide-react';

const TaskBoard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingTask, setSubmittingTask] = useState(null); // Holds the task object

  // Fetch Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

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

  // Actions
  const handleClaim = async (id) => {
    try {
        await api.put(`/tasks/${id}/claim`);
        fetchTasks(); // Refresh
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleSubmit = async (id, submissionData) => {
    try {
        await api.put(`/tasks/${id}/submit`, { submissionData });
        fetchTasks();
        setSubmittingTask(null); // Close modal on success
    } catch (err) { alert(err.response?.data?.message); }
  };

  // Render a Single Task Card
  const TaskCard = ({ task }) => (
    <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200 mb-2 sm:mb-3 hover:shadow-md transition active:scale-95">
        <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-1 line-clamp-1">{task.title}</h4>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-nss-blue bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                +{task.xpReward || 20} XP
            </span>
            
            {/* Buttons based on Status & Role */}
            {task.status === 'Pending' && (
                <button onClick={() => handleClaim(task._id)} className="text-[10px] sm:text-xs bg-gray-900 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-black transition flex-shrink-0 min-h-[28px] sm:min-h-[32px] flex items-center">
                    Claim
                </button>
            )}
            
            {task.status === 'In Progress' && task.assignedUsers.some(u => u._id === user._id) && (
                <button onClick={() => setSubmittingTask(task)} className="text-[10px] sm:text-xs bg-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded hover:bg-blue-700 transition flex-shrink-0 min-h-[28px] sm:min-h-[32px] flex items-center">
                    Mark Done
                </button>
            )}

            {task.status === 'Completed' && (
                <span className="text-[10px] sm:text-xs text-orange-500 flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <Clock size={12}/> <span className="hidden sm:inline">In Review</span><span className="sm:hidden">Review</span>
                </span>
            )}
        </div>
    </div>
  );

  // Group Tasks
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const myTasks = tasks.filter(t => t.status === 'In Progress' && t.assignedUsers.some(u => u._id === user._id));
  const reviewTasks = tasks.filter(t => t.status === 'Completed');

  // Modal Component
  const SubmissionModal = () => {
    const [notes, setNotes] = useState('');
    if (!submittingTask) return null;

    const handleFinalSubmit = () => {
      handleSubmit(submittingTask._id, notes);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 className="text-lg font-bold mb-2">Submit Task</h2>
          <p className="text-sm text-gray-600 mb-4">You are submitting: <span className="font-bold">{submittingTask.title}</span></p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes, links, or proof of completion here."
            className="w-full h-32 p-2 border rounded-md mb-4"
          ></textarea>
          <div className="flex justify-end gap-2">
            <button onClick={() => setSubmittingTask(null)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200">Cancel</button>
            <button onClick={handleFinalSubmit} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white">Submit Task</button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <Layout userRole={user?.role || 'Volunteer'} showBackButton={true}>
      
      <SubmissionModal />

      <div className="mb-4 sm:mb-6 px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Task Board 📋</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Pick a task, complete it, earn XP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 min-h-[calc(100vh-200px)] md:h-[calc(100vh-200px)] overflow-hidden px-2 sm:px-0">
        
        {/* COLUMN 1: AVAILABLE */}
        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col min-h-[300px] md:h-full">
            <h3 className="font-bold text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex items-center gap-2">
                <Lock size={16} className="sm:block hidden" />
                <Lock size={14} className="sm:hidden block" />
                Available ({pendingTasks.length})
            </h3>
            <div className="overflow-y-auto flex-1 pr-2">
                {pendingTasks.map(task => <TaskCard key={task._id} task={task} />)}
            </div>
        </div>

        {/* COLUMN 2: IN PROGRESS (MY TASKS) */}
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col min-h-[300px] md:h-full border border-blue-100">
            <h3 className="font-bold text-xs sm:text-sm text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
                <PlayCircle size={16} className="sm:block hidden" />
                <PlayCircle size={14} className="sm:hidden block" />
                In Progress ({myTasks.length})
            </h3>
            <div className="overflow-y-auto flex-1 pr-2">
                {myTasks.length === 0 ? <p className="text-xs sm:text-sm text-blue-300 text-center mt-10">No active tasks</p> : 
                 myTasks.map(task => <TaskCard key={task._id} task={task} />)
                }
            </div>
        </div>

        {/* COLUMN 3: IN REVIEW */}
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col min-h-[300px] md:h-full border border-green-100">
            <h3 className="font-bold text-xs sm:text-sm text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="sm:block hidden" />
                <CheckCircle size={14} className="sm:hidden block" />
                Under Review ({reviewTasks.length})
            </h3>
            <div className="overflow-y-auto flex-1 pr-2">
                {reviewTasks.map(task => <TaskCard key={task._id} task={task} />)}
            </div>
        </div>

      </div>
    </Layout>
  );
};

export default TaskBoard;