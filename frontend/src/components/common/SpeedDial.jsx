import React, { useState } from 'react';
import { Plus, X, Bell, Calendar, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpeedDial = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Post Notice',
      icon: Bell,
      color: 'bg-blue-500',
      action: () => {
        navigate('/secretary/create-notice');
        setIsOpen(false);
      },
      roles: ['Secretary', 'Domain Head'],
    },
    {
      label: 'Schedule Meet',
      icon: Calendar,
      color: 'bg-green-500',
      action: () => {
        navigate('/secretary/schedule-meeting');
        setIsOpen(false);
      },
      roles: ['Secretary', 'Domain Head'],
    },
    {
      label: 'Scan QR',
      icon: QrCode,
      color: 'bg-purple-500',
      action: () => {
        navigate('/secretary/scan');
        setIsOpen(false);
      },
      roles: ['Secretary', 'Domain Head'],
    },
  ];

  const visibleActions = actions.filter((action) => action.roles.includes(userRole));

  if (visibleActions.length === 0) return null;

  return (
    <div className="fixed bottom-32 sm:bottom-24 right-4 z-40">
      {/* Action Buttons */}
      {isOpen && (
        <div className="mb-4 space-y-3">
          {visibleActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.action}
                className={`${action.color} text-white rounded-full p-4 shadow-lg hover:shadow-xl transform transition hover:scale-110 flex items-center gap-3 animate-fade-in`}
                title={action.label}
              >
                <Icon size={20} />
                <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform transition hover:scale-110 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SpeedDial;
