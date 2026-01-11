import React from 'react';

const SegmentedTabs = ({ tabs = [], active = 0, onChange }) => {
  return (
    <div className="bg-white/6 p-1 rounded-lg inline-flex">
      {tabs.map((t, i) => (
        <button key={t} onClick={() => onChange(i)} className={`px-3 py-1 rounded-md text-sm ${i === active ? 'bg-white/10 text-white font-semibold' : 'text-white/70'}`}>
          {t}
          {t.unread && <span className="ml-2 bg-red-500 text-white text-xs px-2 rounded-full">{t.unread}</span>}
        </button>
      ))}
    </div>
  );
};

export default SegmentedTabs;
