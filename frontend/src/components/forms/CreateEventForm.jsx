import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import api from '../../services/api';
import Input from '../common/Input';
import Button from '../common/Button';
import { MapPin, Calendar, QrCode, AlertCircle } from 'lucide-react';

const CreateEventForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    latitude: '',
    longitude: '',
    radius: 100 // Default 100 meters
  });
  const [createdEventId, setCreatedEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper: Get Current GPS for the Event Location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
      },
      (err) => {
        alert("Unable to retrieve location. Please allow GPS access.");
      }
    );
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // API call to create event
      const { data } = await api.post('/events', formData); 
      setCreatedEventId(data._id); // Save ID to generate QR
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT: FORM SECTION */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2 mb-4">
          <Calendar className="text-nss-blue" size={20}/> Create New Event
        </h3>
        
        {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                <AlertCircle size={16}/> {error}
            </div>
        )}

        <Input 
            label="Event Title" 
            name="title" 
            placeholder="e.g. Campus Clean Drive" 
            value={formData.title} 
            onChange={handleChange} 
            required 
        />

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                rows="2"
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
        </div>

        <Input 
            label="Date" 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            required 
        />
        
        {/* Geofence Inputs */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 relative">
          <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <MapPin size={16}/> Geofence Location (For Attendance)
          </label>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input 
              placeholder="Latitude" 
              className="p-2 text-xs rounded border border-blue-200"
              name="latitude"
              value={formData.latitude} 
              onChange={handleChange}
              required
            />
            <input 
              placeholder="Longitude" 
              className="p-2 text-xs rounded border border-blue-200"
              name="longitude"
              value={formData.longitude} 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-xs text-blue-700">Radius (m):</span>
                <input 
                    type="number"
                    name="radius"
                    value={formData.radius}
                    onChange={handleChange}
                    className="w-16 p-1 text-xs border border-blue-200 rounded text-center"
                />
            </div>
            <button 
                type="button" 
                onClick={getCurrentLocation}
                className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-700 transition"
            >
                📍 Use Current Location
            </button>
          </div>
        </div>

        <Button type="submit" isLoading={loading} className="w-full py-3">
            Create Event & Generate QR
        </Button>
      </form>

      {/* RIGHT: QR CODE DISPLAY SECTION */}
      <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-0 lg:pl-8 pt-8 lg:pt-0">
        {createdEventId ? (
          <div className="text-center animate-scale-up">
            <div className="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold inline-block">
                Event Created Successfully!
            </div>
            
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Scan for Attendance</h4>
            
            <div className="p-6 bg-white border-8 border-gray-900 rounded-3xl inline-block shadow-xl">
              {/* Generates QR containing ONLY the Event ID */}
              <QRCode 
                value={createdEventId} 
                size={200} 
                level="H" // High Error Correction
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-6 font-mono bg-gray-50 p-2 rounded">
                ID: {createdEventId}
            </p>
            
            <button 
                onClick={() => window.print()} 
                className="mt-6 flex items-center gap-2 mx-auto text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded transition"
            >
                🖨️ Print QR Code
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-300 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <QrCode size={64} className="opacity-20"/>
            </div>
            <p className="text-sm font-medium text-gray-400">QR Code will appear here<br/>after you create the event.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default CreateEventForm;