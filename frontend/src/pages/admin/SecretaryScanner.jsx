import React, { useState, useEffect, useContext } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/haptics';
import { ShieldCheck, User, X, Loader2, CheckCircle } from 'lucide-react';

const SecretaryScanner = () => {
  const { user } = useContext(AuthContext);
  const [scannedUser, setScannedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Create the scanner instance
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });

    scanner.render(
      (decodedText) => {
        handleScan(decodedText);
        // We don't necessarily clear here if you want to scan multiple people
      },
      (error) => {
        // Quietly handle scanning noise
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  const handleScan = async (userId) => {
    if (loading || scannedUser) return;
    
    setLoading(true);
    triggerHaptic('success');
    
    try {
      const { data } = await api.get(`/users/verify/${userId}`);
      setScannedUser(data);
    } catch (err) {
      console.error(err);
      alert("User not found or Invalid QR");
    } finally {
      setLoading(false);
    }
  };

  const approveAttendance = async () => {
    setLoading(true);
    try {
      // Assuming you have an attendance endpoint
      await api.post(`/tasks/mark-attendance`, { userId: scannedUser._id });
      setSuccess(true);
      triggerHaptic('success');
      setTimeout(() => {
        setScannedUser(null);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole={user?.role} showBackButton={true}>
      
      <div className="p-4 max-w-md mx-auto pb-24">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
        <ShieldCheck className="text-blue-600" /> Secretary Scanner
      </h2>

      {!scannedUser ? (
        <div className="bg-white p-2 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
          <p className="p-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Place the Volunteer's ID QR in the frame
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[32px] shadow-2xl border-2 border-blue-500 animate-in zoom-in-95 duration-300">
           {success ? (
             <div className="py-12 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle size={48} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Verified & Marked!</h3>
             </div>
           ) : (
             <>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border-2 border-blue-50 shadow-sm">
                    {scannedUser.profileImage ? (
                      <img src={scannedUser.profileImage} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-4 text-gray-300" />
                    )}
                  </div>
                  <button onClick={() => setScannedUser(null)} className="p-2 bg-gray-100 rounded-full active:scale-90">
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-gray-900">{scannedUser.name}</h3>
                <p className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block mt-2 tracking-widest">
                  {scannedUser.role}
                </p>

                <div className="grid grid-cols-2 gap-3 my-6">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Branch</p>
                    <p className="font-bold text-gray-800">{scannedUser.branch}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Year</p>
                    <p className="font-bold text-gray-800">{scannedUser.year}</p>
                  </div>
                </div>

                <button 
                  onClick={approveAttendance}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "APPROVE ATTENDANCE"}
                </button>
             </>
           )}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default SecretaryScanner;