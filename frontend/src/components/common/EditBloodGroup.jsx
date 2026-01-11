import React, { useState } from 'react';
import api from '../../services/api';
import { Save, X, Droplet } from 'lucide-react';

const EditBloodGroup = ({ currentGroup, onUpdate, onClose }) => {
  const [selected, setSelected] = useState(currentGroup || 'O+');
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Direct API call to update profile
      const { data } = await api.put('/users/profile', { bloodGroup: selected });
      
      // Update parent state and close modal
      if (onUpdate) onUpdate(selected);
      if (onClose) onClose();
      
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update blood group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
            <Droplet className="text-red-600 fill-red-600" size={24} /> 
            Select Blood Group
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {bloodTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={`
                py-3 px-1 rounded-xl text-sm font-bold border transition-all duration-200
                ${selected === type 
                  ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save size={20} /> Update Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditBloodGroup;