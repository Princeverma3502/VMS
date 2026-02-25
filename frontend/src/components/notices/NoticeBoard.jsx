import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, AlertTriangle, Calendar, Zap, ChevronRight } from 'lucide-react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const [announcementsRes, meetingsRes, sosRes] = await Promise.all([
        api.get('/announcements').catch(() => ({ data: [] })),
        api.get('/meetings').catch(() => ({ data: [] })),
        api.get('/impact/sos').catch(() => ({ data: [] }))
      ]);

      const announcements = (announcementsRes.data || []).slice(0, 3).map(a => ({
        type: 'announcement',
        id: a._id,
        title: a.title,
        content: a.content,
        priority: a.priority || 'Normal',
        timestamp: a.createdAt,
        icon: 'bell',
        color: getPriorityColor(a.priority)
      }));

      const now = new Date();
      const upcomingMeetings = (meetingsRes.data || [])
        .filter(m => new Date(m.scheduledAt) > now)
        .slice(0, 3)
        .map(m => ({
          type: 'meeting',
          id: m._id,
          title: m.title,
          content: `${new Date(m.scheduledAt).toLocaleDateString()} at ${new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: m.scheduledAt,
          icon: 'calendar',
          color: 'bg-indigo-100 border-indigo-300 text-indigo-900'
        }));

      const sosBroadcasts = (sosRes.data || [])
        .filter(s => !s.resolved)
        .slice(0, 3)
        .map(s => ({
          type: 'sos',
          id: s._id,
          title: 'SOS BROADCAST',
          content: s.description || 'Emergency assistance needed',
          timestamp: s.createdAt,
          icon: 'alert',
          color: 'bg-red-100 border-red-300 text-red-900'
        }));

      setNotices([...announcements, ...upcomingMeetings, ...sosBroadcasts].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      ).slice(0, 5));

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      setNotices([]);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'Success':
        return 'bg-emerald-100 border-emerald-300 text-emerald-900';
      default:
        return 'bg-amber-100 border-amber-300 text-amber-900';
    }
  };

  const getIcon = (type, iconType) => {
    switch (iconType) {
      case 'bell':
        return <Bell size={18} className="flex-shrink-0" />;
      case 'calendar':
        return <Calendar size={18} className="flex-shrink-0" />;
      case 'alert':
        return <AlertTriangle size={18} className="flex-shrink-0" />;
      default:
        return <Zap size={18} className="flex-shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 text-center shadow-sm">
        <Bell size={32} className="mx-auto mb-2 text-green-600 opacity-50" />
        <p className="text-green-700 font-semibold">All caught up!</p>
        <p className="text-green-600 text-sm">No new announcements, meetings, or SOS broadcasts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bell size={20} />
          Notice Board
        </h3>
        <p className="text-indigo-100 text-xs mt-1">Latest announcements, meetings & emergencies</p>
      </div>

      {/* Notices List */}
      <div className="divide-y divide-gray-100">
        {notices.map((notice) => (
          <div
            key={`${notice.type}-${notice.id}`}
            className={`p-3 border-l-4 hover:bg-gray-50 transition cursor-pointer ${notice.color}`}
          >
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notice.type, notice.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h4 className="font-bold text-sm leading-tight line-clamp-1">
                    {notice.title}
                  </h4>
                  <ChevronRight size={16} className="flex-shrink-0 opacity-50" />
                </div>
                <p className="text-xs line-clamp-2 opacity-80 mb-1">
                  {notice.content}
                </p>
                <span className="text-[10px] opacity-60 font-medium">
                  {new Date(notice.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
        <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs uppercase tracking-wider hover:underline transition">
          View All Notices →
        </button>
      </div>
    </div>
  );
};

export default NoticeBoard;
