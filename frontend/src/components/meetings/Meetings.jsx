import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SkeletonLoader from '../common/SkeletonLoader';
import { Calendar, MapPin, Link as LinkIcon, Users, Clock, CheckCircle } from 'lucide-react';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Upcoming');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get('/meetings');
      setMeetings(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      setMeetings([]);
      setLoading(false);
    }
  };

  const markAttendance = async (id) => {
    try {
      await api.put(`/meetings/${id}/attend`);
      fetchMeetings();
      alert('Attendance marked successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const addToCalendar = (meeting) => {
    const startDate = new Date(meeting.scheduledAt);
    const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(meeting.description || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const now = new Date();
  const filteredMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledAt);
    if (filter === 'Upcoming') {
      return meetingDate > now;
    } else if (filter === 'Past') {
      return meetingDate <= now;
    }
    return true;
  }).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const canMarkAttendance = (meeting) => {
    const now = new Date();
    const meetingStart = new Date(meeting.scheduledAt);
    const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
    return now >= meetingStart && now <= meetingEnd;
  };

  if (loading) {
    return <SkeletonLoader count={2} type="card" />;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <Calendar size={24} className="text-blue-600" />
        Meetings
      </h2>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['Upcoming', 'Past'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {filteredMeetings.length > 0 ? (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{meeting.title}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                  meeting.meetingType === 'Online'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {meeting.meetingType}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{meeting.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} />
                  {new Date(meeting.scheduledAt).toLocaleString()}
                </div>

                {meeting.meetingType === 'Online' && meeting.meetLink ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <LinkIcon size={14} />
                    <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Join Meeting
                    </a>
                  </div>
                ) : meeting.meetingType === 'Offline' && meeting.location ? (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin size={14} />
                    {meeting.location}
                  </div>
                ) : null}

                {meeting.invitedUsers && meeting.invitedUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Users size={14} />
                    {meeting.invitedUsers.length} invited
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => addToCalendar(meeting)}
                  className="flex-1 text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition"
                >
                  📅 Add to Calendar
                </button>

                {canMarkAttendance(meeting) && (
                  <button
                    onClick={() => markAttendance(meeting._id)}
                    className="flex-1 text-xs bg-green-100 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-200 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} /> Mark Attendance
                  </button>
                )}
              </div>

              {meeting.attendees && meeting.attendees.length > 0 && (
                <div className="mt-2 text-[10px] text-gray-500">
                  {meeting.attendees.length} attended
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Calendar size={40} className="mx-auto mb-2 opacity-50" />
          <p>No {filter.toLowerCase()} meetings</p>
        </div>
      )}
    </div>
  );
};

export default Meetings;
