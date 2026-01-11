import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SkeletonLoader from '../common/SkeletonLoader';
import { Bell, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data || []);
      
      // Count unread
      const unread = data?.filter(a => !a.readBy?.some(r => r.userId === localStorage.getItem('userId'))).length || 0;
      setUnreadCount(unread);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/announcements/${id}/read`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'Success':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'Unread') {
      return !a.readBy?.some(r => r.userId);
    }
    if (filter === 'Urgent') {
      return a.priority === 'Urgent';
    }
    return true;
  });

  if (loading) {
    return <SkeletonLoader count={3} type="card" />;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell size={24} className="text-blue-600" />
          Announcements
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['All', 'Unread', 'Urgent'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-3">
          {filteredAnnouncements.map((announcement) => {
            const isRead = announcement.readBy?.some(r => r.userId);
            return (
              <div
                key={announcement._id}
                onClick={() => markAsRead(announcement._id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${getPriorityColor(announcement.priority)} ${
                  !isRead ? 'ring-2 ring-yellow-400' : 'opacity-75'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{announcement.title}</h3>
                    <p className="text-xs line-clamp-2">{announcement.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] opacity-70">
                        By {announcement.createdBy?.name}
                      </span>
                      {!isRead && (
                        <span className="text-[10px] font-bold bg-white/50 px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Bell size={40} className="mx-auto mb-2 opacity-50" />
          <p>No announcements yet</p>
        </div>
      )}
    </div>
  );
};

export default Announcements;
