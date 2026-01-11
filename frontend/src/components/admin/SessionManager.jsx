import React, { useState } from 'react';
import { Calendar, AlertTriangle, Archive } from 'lucide-react';
import api from '../../services/api';

const SessionManager = () => {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    if (!window.confirm("⚠️ DANGER: This will archive all student XP and move 1st years to 2nd year. Are you sure?")) return;
    
    setLoading(true);
    try {
      // Ensure sessionRoutes.js has this endpoint or map it to sessionController
      await api.post('/sessions/end'); 
      alert('Academic Session Ended Successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-red-100 mt-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-red-600" size={20} /> Session Management
      </h3>
      
      <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-1" size={20} />
          <div>
            <p className="font-bold text-red-800 text-sm">Zone of Danger</p>
            <p className="text-xs text-red-600 mt-1">
              Ending the session will archive all current data and promote students to the next year.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleArchive} 
        disabled={loading}
        className="w-full bg-white border-2 border-red-500 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
      >
        <Archive size={18} />
        {loading ? 'Processing Archive...' : 'End Academic Year'}
      </button>
    </div>
  );
};

export default SessionManager;