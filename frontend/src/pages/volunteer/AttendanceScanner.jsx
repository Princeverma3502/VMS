import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import useGeoLocation from '../../hooks/useGeoLocation';
import { MapPin, QrCode, CheckCircle, AlertTriangle } from 'lucide-react';

const AttendanceScanner = () => {
  const { user } = useContext(AuthContext);
  // Destructure values from our custom hook
  const { location, error: geoError, isLoading: isLocating, getLocation } = useGeoLocation();
  
  const [status, setStatus] = useState('idle'); // idle | scanning | success | error
  const [msg, setMsg] = useState('');

  // Effect: Watch for location changes to update status
  useEffect(() => {
    if (location) {
      setStatus('locked');
    }
  }, [location]);

  // Effect: Watch for errors from the hook
  useEffect(() => {
    if (geoError) {
      setStatus('error');
      setMsg(geoError);
    }
  }, [geoError]);

  const handleScanMock = async () => {
    setStatus('scanning');
    
    // In a real app, this triggers a QR Camera Reader.
    // Here we simulate scanning a code "evt_123"
    try {
        // Send the location from our hook to the backend
        const { data } = await api.post('/events/attendance/mark', {
            eventId: '67bd...real_id_here...', 
            userLocation: location 
        });
        
        setStatus('success');
        setMsg(`Success! +${data.newXP - (data.oldXP || 0) || 50} XP`);
    } catch (error) {
        setStatus('error');
        setMsg(error.response?.data?.message || "Attendance Failed");
    }
  };

  return (
    <Layout userRole="Volunteer" showBackButton={true}>
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-2 sm:px-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-sm w-full text-center">
            
            <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-full text-nss-blue">
                    {status === 'success' ? <CheckCircle size={40} className="text-green-500"/> : <MapPin size={40} />}
                </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Smart Attendance</h2>
            
            {/* STATE: Idle / Error - Show Grant Button */}
            {(status === 'idle' || status === 'error') && (
                <button 
                  onClick={getLocation} 
                  className="w-full bg-nss-blue text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-lg font-bold hover:bg-blue-700 transition text-sm sm:text-base min-h-[40px] sm:min-h-[auto]"
                  disabled={isLocating}
                >
                    {isLocating ? 'Acquiring GPS...' : 'Grant Location Access'}
                </button>
            )}

            {/* STATE: Loading */}
            {isLocating && <p className="text-gray-500 animate-pulse mt-2 text-xs sm:text-sm">Acquiring high-accuracy GPS...</p>}

            {/* STATE: Locked - Show Scan Button */}
            {status === 'locked' && location && (
                <div className="animate-fade-in">
                    <div className="bg-green-50 text-green-700 p-2 sm:p-3 rounded-lg sm:rounded-lg mb-3 sm:mb-4 text-[10px] sm:text-xs font-mono border border-green-200 break-all">
                        GPS Locked: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </div>
                    <button 
                      onClick={handleScanMock} 
                      className="w-full bg-gray-900 text-white py-2.5 sm:py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition text-sm sm:text-base min-h-[40px] sm:min-h-[auto]"
                    >
                        {status === 'scanning' ? 'Verifying...' : <><QrCode size={16} className="sm:hidden" /><QrCode size={20} className="hidden sm:block" /> <span className="hidden sm:inline">Scan QR Code</span><span className="sm:hidden">Scan</span></>}
                    </button>
                </div>
            )}

            {/* STATE: Success */}
            {status === 'success' && (
                <div className="text-green-600 font-bold bg-green-50 p-2.5 sm:p-4 rounded-lg border border-green-100 animate-scale-up text-sm sm:text-base">
                    {msg}
                </div>
            )}

            {/* STATE: Error Message Display */}
            {status === 'error' && msg && (
                <div className="text-red-500 flex items-center justify-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm font-medium bg-red-50 p-2 sm:p-3 rounded-lg">
                    <AlertTriangle size={14} className="sm:hidden" />
                    <AlertTriangle size={16} className="hidden sm:block" /> {msg}
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceScanner;