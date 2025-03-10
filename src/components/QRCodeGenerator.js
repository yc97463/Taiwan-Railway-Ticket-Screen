import React, { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

const GenerateQRCode = ({ text, width = 200 }) => {
  const canvasRef = useRef(null);

  const generateQRCode = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas size
      canvas.width = width;
      canvas.height = width;

      // Generate QR code on canvas
      await QRCode.toCanvas(canvas, text, {
        width: width,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000ff',
          light: '#ffffffff'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [text, width]);

  useEffect(() => {
    if (text && canvasRef.current) {
      generateQRCode();
    }
  }, [text, width, generateQRCode]);

  return (
    <div className="flex justify-center items-center">
      <canvas 
        ref={canvasRef} 
        className="border border-gray-300 rounded-md transition-all duration-300 ease-in-out"
        style={{ width: `${width}px`, height: `${width}px` }}
      ></canvas>
    </div>
  );
};

export default GenerateQRCode;