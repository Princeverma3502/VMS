import React, { useState, useRef } from 'react';
import { RefreshCw, Download, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const IDCardFrame = ({ children }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  
  // Refs for printing specific sides 
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    
    // Select the currently visible side to download
    const element = isFlipped ? backRef.current : frontRef.current;

    setTimeout(async () => {
      if (!element) { setDownloadingFormat(null); return; }
      try {
        const dataUrl = await toPng(element, { 
          cacheBust: true, 
          pixelRatio: 3, 
          backgroundColor: '#ffffff',
          style: { transform: 'none' } // Reset 3D transforms for clean 2D print
        });
        
        if (format === 'pdf') {
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 86] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, 54, 86);
          pdf.save('NSS_Digital_ID.pdf');
        } else {
          const link = document.createElement('a');
          link.download = `NSS_ID_${isFlipped ? 'Back' : 'Front'}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (err) {
        console.error(err);
        alert('Download failed. Please try again.');
      } finally {
        setDownloadingFormat(null);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D Flip Container 
          Relies on the CSS classes defined in index.css for correct perspective 
      */}
      <div 
        className={`flip-card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-inner">
          
          {/* FRONT FACE */}
          <div className="flip-card-front">
            <div ref={frontRef} className="w-full h-full">
              {children.front}
            </div>
          </div>
          
          {/* BACK FACE */}
          <div className="flip-card-back">
            <div ref={backRef} className="w-full h-full">
              {children.back}
            </div>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          className="flex items-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <RefreshCw size={18} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
          Flip
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleDownload('png'); }}
          disabled={downloadingFormat !== null}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} /> {downloadingFormat === 'png' ? 'Processing...' : 'PNG'}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleDownload('pdf'); }}
          disabled={downloadingFormat !== null}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={18} /> {downloadingFormat === 'pdf' ? 'Processing...' : 'PDF'}
        </button>
      </div>
    </div>
  );
};

export default IDCardFrame;