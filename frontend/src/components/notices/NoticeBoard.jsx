import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, AlertTriangle, Calendar, Zap, ChevronRight } from 'lucide-react';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetchNotices();
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const fetchNotices = async () => {
    if (!navigator.onLine) {
      setError('No internet connection. Check DevTools throttling.');
      setLoading(false);
      return;
    }
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

      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      setError('Failed to load notices. Please try again.');
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

  if (error) {
    return (
      <div className="bg-red-50 rounded-[2.5rem] shadow-2xl shadow-red-200/60 border border-red-200 p-6 text-center">
        <Bell size={32} className="mx-auto mb-3 text-red-600" />
        <p className="text-red-700 font-semibold mb-2">Failed to Load Notices</p>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        {!isOnline && (
          <p className="text-xs text-red-500 mb-3">
            💡 Tip: Open DevTools (F12) → Network tab → Disable throttling if set to "Offline"
          </p>
        )}
        <button
          onClick={fetchNotices}
          className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm"
        >
          Retry
        </button>
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
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all"></div>
        <div className="relative z-10">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 text-blue-400">
            <Bell size={18} className="animate-bounce" />
            Intelligence Briefing
          </h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 opacity-60">Latest announcements, meetings & emergencies</p>
        </div>
      </div>

      {/* Notices List */}
      <div className="divide-y divide-slate-50">
        {notices.map((notice) => (
          <div
            key={`${notice.type}-${notice.id}`}
            className={`p-6 border-l-[6px] hover:bg-slate-50 transition-all cursor-pointer group/item ${
              notice.type === 'sos' ? 'border-l-red-600 bg-red-50/30' : 
              notice.type === 'meeting' ? 'border-l-indigo-600' : 'border-l-amber-500'
            }`}
          >
            <div className="flex gap-6 items-start">
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/item:scale-110 ${
                notice.type === 'sos' ? 'bg-red-600 text-white shadow-red-200' : 
                notice.type === 'meeting' ? 'bg-indigo-600 text-white shadow-indigo-200' : 
                'bg-amber-500 text-white shadow-amber-200'
              }`}>
                {getIcon(notice.type, notice.icon)}
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <h4 className="font-black text-slate-900 text-sm leading-tight line-clamp-1 group-hover/item:text-blue-600 transition-colors">
                    {notice.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(notice.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <ChevronRight size={16} className="text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 mb-2">
                  {notice.content}
                </p>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${notice.type === 'sos' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                   <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                     Ref: {notice.type} // {new Date(notice.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-center">
        <button className="flex items-center gap-2 text-slate-900 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all group/btn">
          Access Archival Data 
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default NoticeBoard;
