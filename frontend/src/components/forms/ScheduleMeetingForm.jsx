import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { X, Send, AlertCircle, MapPin, Link as LinkIcon, Users } from 'lucide-react';

const ScheduleMeetingForm = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 30,
    meetingType: 'Offline',
    location: '',
    meetLink: '',
    meetScope: 'All',
    domain: ''
  });
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

    if (!formData.title.trim() || !formData.scheduledAt) {
      setError('Title and date/time are required');
      return;
    }

    if (formData.meetingType === 'Online' && !formData.meetLink.trim()) {
      setError('Meeting link is required for online meetings');
      return;
    }

    if (formData.meetingType === 'Offline' && !formData.location.trim()) {
      setError('Location is required for offline meetings');
      return;
    }

    if (formData.meetScope === 'Domain' && !formData.domain) {
      setError('Please select a domain for domain-scoped meetings');
      return;
    }

    // Validate future date
    if (new Date(formData.scheduledAt) <= new Date()) {
      setError('Meeting date must be in the future');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: parseInt(formData.duration),
        meetingType: formData.meetingType,
        location: formData.meetingType === 'Offline' ? formData.location.trim() : undefined,
        meetLink: formData.meetingType === 'Online' ? formData.meetLink.trim() : undefined,
        meetScope: formData.meetScope,
        ...(formData.meetScope === 'Domain' && { domain: formData.domain })
      };

      await api.post('/meetings', payload);
      setFormData({
        title: '',
        description: '',
        scheduledAt: '',
        duration: 30,
        meetingType: 'Offline',
        location: '',
        meetLink: '',
        meetScope: 'All',
        domain: ''
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">Schedule Meeting</h2>
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
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Core Team Sync"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50 placeholder-gray-400"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about the meeting (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none bg-gray-50 placeholder-gray-400"
              maxLength={300}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Duration (Minutes)
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Meeting Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Online', 'Offline'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, meetingType: type }))}
                  className={`py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                    formData.meetingType === type
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {type === 'Online' ? <LinkIcon className="inline mr-2" size={16} /> : <MapPin className="inline mr-2" size={16} />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location or Link */}
          {formData.meetingType === 'Offline' ? (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                <MapPin size={14} /> Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., NSS Office, Building A"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50 placeholder-gray-400"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                <LinkIcon size={14} /> Meeting Link *
              </label>
              <input
                type="url"
                name="meetLink"
                value={formData.meetLink}
                onChange={handleChange}
                placeholder="e.g., https://zoom.us/..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50 placeholder-gray-400"
              />
            </div>
          )}

          {/* Meeting Scope */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Users size={14} /> Who Can Attend?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="meetScope"
                  value="All"
                  checked={formData.meetScope === 'All'}
                  onChange={handleChange}
                  className="w-5 h-5 accent-purple-600"
                />
                <div>
                  <p className="font-bold text-sm text-gray-800">Everyone</p>
                  <p className="text-[10px] text-gray-400">All volunteers across organization</p>
                </div>
              </label>

              {isSecondary && (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="meetScope"
                    value="Core"
                    checked={formData.meetScope === 'Core'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">Core Team</p>
                    <p className="text-[10px] text-gray-400">Leadership & coordinators only</p>
                  </div>
                </label>
              )}

              {isDomainHead && (
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="meetScope"
                    value="Domain"
                    checked={formData.meetScope === 'Domain'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">My Domain</p>
                    <p className="text-[10px] text-gray-400">Your domain members only</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Domain Select (if Domain Head) */}
          {isDomainHead && formData.meetScope === 'Domain' && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                Select Domain *
              </label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50"
              >
                <option value="">-- Choose a domain --</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Environment">Environment</option>
                <option value="Community">Community</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                Scheduling...
              </>
            ) : (
              <>
                <Send size={18} />
                Schedule Meeting
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingForm;
