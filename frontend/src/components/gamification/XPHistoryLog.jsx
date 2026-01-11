import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Zap, TrendingUp, Award } from 'lucide-react';
import SkeletonLoader from '../common/SkeletonLoader';

const XPHistoryLog = ({ userId, limit = 10 }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get(`/users/${userId}/xp-history?limit=${limit}`);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch XP history");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchHistory();
  }, [userId, limit]);

  const getSourceIcon = (source) => {
    switch(source) {
      case 'Task Verified':
        return <Zap size={16} className="text-blue-500" />;
      case 'Event Attended':
        return <Award size={16} className="text-yellow-500" />;
      case 'Spin Wheel':
        return <TrendingUp size={16} className="text-purple-500" />;
      default:
        return <Zap size={16} className="text-gray-400" />;
    }
  };

  const getSourceColor = (source) => {
    switch(source) {
      case 'Task Verified':
        return 'bg-blue-50 text-blue-700';
      case 'Event Attended':
        return 'bg-yellow-50 text-yellow-700';
      case 'Spin Wheel':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return <SkeletonLoader count={5} type="list" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-600" />
        XP Transaction History
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Zap size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">No XP transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${getSourceColor(entry.source)}`}>
                  {getSourceIcon(entry.source)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{entry.source}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(entry.timestamp).toLocaleDateString()} at{' '}
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-blue-600">+{entry.points}</p>
                <p className="text-[10px] text-gray-400 font-bold">XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Showing Latest {Math.min(history.length, limit)} Transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default XPHistoryLog;
