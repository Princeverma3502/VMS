import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-hot-toast';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notices');
      setNotices(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notices.');
      toast.error('Failed to fetch notices.');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const markAsRead = async (noticeId) => {
    try {
      await api.put(`/notices/${noticeId}/read`);
      setNotices(notices.map(notice =>
        notice._id === noticeId ? { ...notice, read: true } : notice
      ));
    } catch (error) {
      toast.error('Failed to mark notice as read.');
      console.error(error);
    }
  };

  const filteredNotices = notices.filter(notice => {
    if (filter === 'unread') return !notice.read;
    if (filter === 'read') return notice.read;
    return true;
  });

  if (loading) return <Layout><Loader /></Layout>;
  if (error) return <Layout><div className="text-red-500 text-center">{error}</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Notices</h1>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All ({notices.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Unread ({notices.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded ${filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Read ({notices.filter(n => n.read).length})
          </button>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No notices found.
            </div>
          ) : (
            filteredNotices.map(notice => (
              <div
                key={notice._id}
                className={`border rounded-lg p-4 ${!notice.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{notice.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${notice.priority === 'high' ? 'bg-red-100 text-red-800' : notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {notice.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{notice.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>From: {notice.sender?.name || 'Admin'}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                {!notice.read && (
                  <button
                    onClick={() => markAsRead(notice._id)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notices;