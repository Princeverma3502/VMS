import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner'; 
import { X, Camera, AlertCircle } from 'lucide-react';

const QRScannerComponent = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  // Keep track of the scanner instance
  const scannerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Scanner
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result?.data) {
            handleStop(); // Stop first
            onScan(result.data); // Then process
          }
        },
        { 
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current.start().catch(err => {
        console.error(err);
        setError('Camera permission denied.');
      });
    }

    // 2. CLEANUP FUNCTION (The Fix)
    return () => {
      handleStop();
    };
  }, []);

  const handleStop = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in">
      <button 
        onClick={() => { handleStop(); onClose(); }} 
        className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full active:bg-white/20 transition z-50"
      >
        <X size={28} />
      </button>
      
      <div className="w-full max-w-sm aspect-square bg-black relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
        <video ref={videoRef} className="w-full h-full object-cover"></video>
        <div className="absolute inset-0 border-2 border-blue-500/50 m-12 rounded-xl animate-pulse pointer-events-none"></div>
      </div>
      
      <p className="text-white mt-8 font-bold flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
        <Camera size={20} /> Point at Volunteer ID
      </p>
      
      {error && <p className="text-red-400 mt-4 font-bold">{error}</p>}
    </div>
  );
};

export default QRScannerComponent;