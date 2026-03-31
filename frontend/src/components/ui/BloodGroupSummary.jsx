import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BloodGroupSummary = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetchStats();
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const fetchStats = async () => {
    if (!navigator.onLine) {
      setError('No internet connection. Check DevTools throttling.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/users/blood-group-stats');
      setStats(data);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch blood group stats:', error);
      setError('Failed to load blood donation stats. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-3 px-2 text-sm uppercase tracking-wider opacity-70">
          Blood Donation Stats
        </h3>
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-red-200 bg-red-50 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-3 px-2 text-sm uppercase tracking-wider opacity-70">
          Blood Donation Stats
        </h3>
        <div className="text-center text-red-600 text-sm mb-2">{error}</div>
        {!isOnline && (
          <p className="text-xs text-red-500 text-center">
            💡 Tip: Open DevTools (F12) → Network tab → Disable throttling if set to "Offline"
          </p>
        )}
        <button
          onClick={fetchStats}
          className="mt-2 w-full px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-sm">
      <h3 className="text-gray-800 font-bold mb-3 px-2 text-sm uppercase tracking-wider opacity-70">
        Blood Donation Stats
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat._id} className="bg-red-50 p-3 rounded-lg border border-red-100">
            <div className="text-lg font-bold text-red-600">{stat._id}</div>
            <div className="text-sm text-red-500">{stat.count} donors</div>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="col-span-2 text-center text-gray-500 py-4">
            No blood group data available
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodGroupSummary;