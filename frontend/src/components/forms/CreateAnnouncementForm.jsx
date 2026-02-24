import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { X, Send, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

const CreateAnnouncementForm = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Info',
    scope: 'Global',
    domain: '',
    expiresAt: ''
  });
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSecondary = user?.role?.toLowerCase() === 'secretary';
  const isDomainHead = user?.role?.toLowerCase() === 'domain head';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (formData.scope === 'Domain' && !formData.domain) {
      setError('Please select a domain for domain-scoped announcement');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        priority: formData.priority,
        scope: formData.scope,
        ...(formData.scope === 'Domain' && { domainId: formData.domain }),
        ...(formData.expiresAt && { expiresAt: formData.expiresAt })
      };

      await api.post('/announcements', payload);
      setFormData({
        title: '',
        content: '',
        priority: 'Info',
        scope: 'Global',
        domain: '',
        expiresAt: ''
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available domains for Domain Heads / Secretary
  React.useEffect(() => {
    let mounted = true;
    const fetchDomains = async () => {
      try {
        const { data } = await api.get('/domains');
        if (mounted) setDomains(Array.isArray(data) ? data : []);
      } catch (err) {
        // silently ignore – domain list is optional
      }
    };
    fetchDomains();
    return () => { mounted = false; };
  }, []);

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Urgent': return <AlertCircle size={16} className="text-red-500" />;
      case 'Success': return <CheckCircle size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'ring-2 ring-red-200 bg-red-50';
      case 'Success': return 'ring-2 ring-green-200 bg-green-50';
      default: return 'ring-2 ring-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">New Announcement</h2>
          <button
            onClick={onClose}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="announcement-title" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Title *
            </label>
            <input
              id="announcement-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Important Meeting Tomorrow"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50 placeholder-gray-400 text-gray-900"
              maxLength={100}
            />
            <p className="text-[10px] text-gray-400 mt-1">{formData.title.length}/100</p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="announcement-content" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Message *
            </label>
            <textarea
              id="announcement-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your announcement here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none bg-gray-50 placeholder-gray-400 text-gray-900"
              maxLength={500}
            />
            <p className="text-[10px] text-gray-400 mt-1">{formData.content.length}/500</p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Urgent', 'Info', 'Success'].map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    formData.priority === priority
                      ? getPriorityColor(priority)
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {getPriorityIcon(priority)}
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              {isSecondary && (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="Global"
                    checked={formData.scope === 'Global'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">All Volunteers</p>
                    <p className="text-[10px] text-gray-400">Reach everyone in the organization</p>
                  </div>
                </label>
              )}

              {isDomainHead && (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="Domain"
                    checked={formData.scope === 'Domain'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">My Domain</p>
                    <p className="text-[10px] text-gray-400">Only show to your domain members</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Domain Select (if Domain Head) */}
          {isDomainHead && formData.scope === 'Domain' && (
            <div>
              <label htmlFor="announcement-domain" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                Select Domain *
              </label>
              <select
                id="announcement-domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
              >
                <option value="">-- Choose a domain --</option>
                {domains.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Expiration */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock size={14} /> Expires (Optional)
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-gray-50"
            />
            <p className="text-[10px] text-gray-400 mt-1">Announcement will be hidden after this time</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                Publishing...
              </>
            ) : (
              <>
                <Send size={18} />
                Publish Announcement
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementForm;
