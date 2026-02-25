import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/layout/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Heart, Activity, MapPin, AlertCircle, Send } from 'lucide-react';
import useGeoLocation from '../hooks/useGeoLocation';

const ImpactHub = () => {
  const { user } = useContext(AuthContext);
  const { location, getLocation } = useGeoLocation();
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' or 'wall'
  const [sosLoading, setSosLoading] = useState(false);
  
  // SOS Form State
  const [sosData, setSosData] = useState({
    bloodType: 'O+',
    unitsNeeded: 1,
    recipientInfo: '',
    contactName: user?.name || '',
    contactPhone: user?.whatsappNumber || '',
  });

  const handleSOSSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please enable GPS location first");
      getLocation();
      return;
    }
    
    setSosLoading(true);
    try {
      await api.post('/impact/sos/create', {
        ...sosData,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: "Current Location" 
        },
        contactPerson: {
          name: sosData.contactName,
          phone: sosData.contactPhone
        }
      });
      alert("🚨 SOS Broadcast Sent to all nearby volunteers!");
      setSosData({ ...sosData, recipientInfo: '' }); // Reset
    } catch (error) {
      alert("Failed to send SOS: " + error.response?.data?.message);
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <Layout userRole={user?.role}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
          <Heart className="text-red-600" fill="currentColor" /> Impact Hub
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'sos' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600'}`}
          >
            🚨 Emergency SOS
          </button>
          <button 
            onClick={() => setActiveTab('wall')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${activeTab === 'wall' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600'}`}
          >
            🧱 Wall of Kindness
          </button>
        </div>

        {/* SOS SECTION */}
        {activeTab === 'sos' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="bg-red-50 p-4 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                <strong>Emergency Broadcast:</strong> This will send a push notification to all volunteers with the matching blood type within 10km.
              </p>
            </div>

            <form onSubmit={handleSOSSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Blood Type</label>
                  <select 
                    value={sosData.bloodType}
                    onChange={(e) => setSosData({...sosData, bloodType: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Units Needed</label>
                  <input 
                    type="number" 
                    value={sosData.unitsNeeded}
                    onChange={(e) => setSosData({...sosData, unitsNeeded: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Recipient Details (Hospital/Patient)</label>
                <textarea 
                  required
                  value={sosData.recipientInfo}
                  onChange={(e) => setSosData({...sosData, recipientInfo: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 h-24"
                  placeholder="Ex: Patient Amit Kumar at City Hospital, Room 302. Urgent surgery."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Contact Name"
                  value={sosData.contactName}
                  onChange={(e) => setSosData({...sosData, contactName: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                />
                <input 
                  type="tel" placeholder="Phone Number"
                  value={sosData.contactPhone}
                  onChange={(e) => setSosData({...sosData, contactPhone: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                />
              </div>

              {!location && (
                <button type="button" onClick={getLocation} className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2">
                  <MapPin size={20} /> Enable Location to Send
                </button>
              )}

              {location && (
                <button 
                  type="submit" 
                  disabled={sosLoading}
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-lg shadow-xl hover:bg-red-700 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {sosLoading ? "Broadcasting..." : "BROADCAST SOS ALERT"}
                </button>
              )}
            </form>
          </div>
        )}

        {/* WALL OF KINDNESS PLACEHOLDER */}
        {activeTab === 'wall' && (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">Coming Soon</h3>
            <p className="text-gray-400">Share your volunteer stories here.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImpactHub;