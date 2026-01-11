import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center max-w-sm">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ACCESS DENIED</h1>
        <p className="text-gray-500 text-sm mb-8">You don't have permission to access the Secretary area.</p>
        <button 
          onClick={() => navigate('/')} 
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> GO BACK
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;