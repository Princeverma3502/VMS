import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Zap, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import api from '../../services/api';
// Use the shared ID Card component for consistent UI
import DigitalIDCard from '../../components/digital-id/DigitalIDCard';

const QRScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [showID, setShowID] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        setErrorMessage('Camera access denied. Please enable camera permissions.');
      }
    };

    startCamera();

    // CLEANUP: Stop camera on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isCameraActive) return;

    const scanQRCode = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // Process QR Code
          (async () => {
            let payload = null;
            try {
              payload = JSON.parse(code.data);
            } catch (e) {
              payload = code.data;
            }

            let id = null;
            if (typeof payload === 'string') id = payload;
            else if (payload && payload.id) id = payload.id;

            if (!id) {
              // Ignore non-ID QR codes to prevent flashing errors
              return; 
            }

            try {
              // Verify with backend
              const res = await api.get(`/users/verify/${id}`);
              
              // Success: Stop Camera & Show ID
              setScannedData({ ...res.data, id });
              setShowID(true);
              setIsCameraActive(false);
              if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
              }
            } catch (err) {
              setErrorMessage('Invalid ID or Network Error');
              setTimeout(() => setErrorMessage(''), 3000);
            }
          })();
        }
      }

      if (isCameraActive) {
        requestAnimationFrame(scanQRCode);
      }
    };

    const frameId = requestAnimationFrame(scanQRCode);
    return () => cancelAnimationFrame(frameId);
  }, [isCameraActive]);

  const handleRescan = () => {
    setScannedData(null);
    setShowID(false);
    setErrorMessage('');
    setIsCameraActive(true);
    // Restart Camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 bg-black/50 backdrop-blur-md sticky top-0">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white/10 rounded-full active:bg-white/20"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Scan Volunteer ID</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* SCANNER VIEW */}
        {!showID ? (
          <div className="w-full max-w-sm relative">
            {/* Camera Frame */}
            <div className="relative aspect-square bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Overlay UI */}
              {isCameraActive && (
                <>
                  <div className="absolute inset-0 border-[40px] border-black/60 rounded-none pointer-events-none"></div>
                  <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-blue-500/80 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                     {/* Laser Line */}
                     <div className="w-full h-[2px] bg-red-500/80 absolute top-1/2 -translate-y-1/2 animate-[ping_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Corner Markers */}
                  <div className="absolute top-10 left-10 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-10 right-10 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-10 left-10 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-10 right-10 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </>
              )}
            </div>

            {/* Error Toast */}
            {errorMessage && (
              <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl text-center text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-4">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 text-center space-y-2">
              <p className="font-bold text-lg flex items-center justify-center gap-2">
                <Camera size={20} /> Point camera at QR Code
              </p>
              <p className="text-white/60 text-sm">Align the QR code within the frame to verify</p>
            </div>
          </div>
        ) : (
          /* RESULT VIEW (DIGITAL ID CARD) */
          <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="w-full max-w-sm mb-6">
               {/* Reuse the standardized ID Card Component */}
               {/* Pass onClose to handle closing the modal logic inside DigitalIDCard if used as modal, 
                   but here we are using it inline, so we just render it or wrap it */}
               <DigitalIDCard 
                 user={scannedData} 
                 onClose={() => setShowID(false)} // This might not work if DigitalIDCard is strictly a modal.
                 // If DigitalIDCard is a modal, we might need to extract the Renderer.
                 // Assuming DigitalIDCard handles its own modal state, let's use the Renderer directly if possible 
                 // OR wrap it in a div that mocks the modal behavior.
               />
               
               {/* Fallback if DigitalIDCard is strictly a fixed modal: Use Renderer directly? 
                   Ideally DigitalIDCard is a modal wrapper. Let's assume it opens a modal.
                   Actually, looking at your previous code, DigitalIDCard IS a modal.
                   So rendering it here will open it on top of the black screen. Perfect.
               */}
            </div>

            <div className="w-full max-w-sm space-y-3 z-50">
              <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-center font-bold border border-green-500/50 flex items-center justify-center gap-2">
                <Zap size={20} fill="currentColor" /> Verified Successfully
              </div>
              
              <button 
                onClick={handleRescan}
                className="w-full bg-white text-black py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QRScanner;