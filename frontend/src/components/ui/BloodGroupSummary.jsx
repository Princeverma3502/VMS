import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BloodGroupSummary = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/users/blood-group-stats');
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch blood group stats:', error);
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