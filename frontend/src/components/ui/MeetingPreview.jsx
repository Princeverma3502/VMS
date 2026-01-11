import React from 'react';

const MeetingPreview = ({ meeting = null }) => {
  if (!meeting) {
    return (
      <div className="glass-card p-4 rounded-2xl text-white">
        <div className="text-sm font-medium">No upcoming meetings</div>
        <div className="text-xs opacity-80 mt-2">You're all clear — check announcements for new schedules.</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-2xl text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase font-bold">Next Meeting</div>
          <div className="text-lg font-extrabold mt-1">{meeting.title}</div>
          <div className="text-xs opacity-80 mt-1">{meeting.date} • {meeting.time}</div>
        </div>
        <div>
          <button className="bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold">Join Now</button>
        </div>
      </div>
    </div>
  );
};

export default MeetingPreview;
