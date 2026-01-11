import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../../services/api';

const GeofenceCheckIn = ({ eventId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [distance, setDistance] = useState(null);
  const [allowedRadius, setAllowedRadius] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
      setHasLocationPermission(true);
    }
  }, []);

  const handleCheckIn = async () => {
    if (!hasLocationPermission) {
      alert('Geolocation is not available on your device');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await api.post('/geofence/check-in', {
              eventId,
              userLat: latitude,
              userLon: longitude,
            });

            setDistance(response.data.distance);
            setAllowedRadius(response.data.allowedRadius);
            setStatus(response.data.isWithinGeofence ? 'success' : 'outside');

            if (response.data.isWithinGeofence && onSuccess) {
              onSuccess();
            }
          } catch (error) {
            setStatus('error');
            console.error('Check-in failed:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setStatus('error');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Check-in error:', error);
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={24} className="text-blue-600" />
        Location-Based Check-in
      </h3>

      <p className="text-gray-600 mb-6">
        Check in to the event to verify your presence and earn XP. You must be within the event location.
      </p>

      {!hasLocationPermission && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Location Not Available</p>
            <p className="text-sm text-yellow-700">
              Geolocation is not available on your device. Please use a device with GPS support.
            </p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">✓ Check-in Successful!</p>
            <p className="text-sm text-green-700">
              You are within the event location ({distance?.toFixed(0)}m away, allowed up to {allowedRadius}m).
            </p>
          </div>
        </div>
      )}

      {status === 'outside' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Outside Event Location</p>
            <p className="text-sm text-red-700">
              You are {distance?.toFixed(0)}m away from the event (limit: {allowedRadius}m). Please move closer to check in.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800">Check-in Failed</p>
            <p className="text-sm text-orange-700">
              Unable to determine your location. Please check your location permissions and try again.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckIn}
        disabled={loading || !hasLocationPermission}
        className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : hasLocationPermission
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Checking Location...
          </>
        ) : (
          <>
            <MapPin size={20} />
            Check In Now
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your location will be used only to verify event attendance. We do not store your location data.
      </p>
    </div>
  );
};

export default GeofenceCheckIn;
