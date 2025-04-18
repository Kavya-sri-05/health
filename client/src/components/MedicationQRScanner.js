import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import { X, Clipboard, Check, QrCode } from 'lucide-react';

const MedicationQRScanner = ({ onScanComplete, onClose }) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  
  // Handle scan result
  const handleScan = (data) => {
    if (data) {
      // Stop scanning once we get a result
      setIsScanning(false);
      setResult(data.text);
      
      try {
        // Try to parse the QR code data
        const parsedResult = parseQRData(data.text);
        setParsedData(parsedResult);
      } catch (err) {
        setError('Could not parse medication data from QR code');
      }
    }
  };
  
  // Handle camera errors
  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setCameraError(true);
    setError('Could not access camera. Please make sure you have granted camera permissions.');
  };
  
  // Parse QR code data
  const parseQRData = (data) => {
    // This is a simplified example of QR code parsing
    // In a real app, you would handle various QR code formats for medication
    
    try {
      // First try to parse as JSON
      const jsonData = JSON.parse(data);
      return {
        name: jsonData.name || jsonData.medicationName,
        dosage: jsonData.dosage,
        frequency: jsonData.frequency,
        startDate: jsonData.startDate,
        endDate: jsonData.endDate,
        notes: jsonData.notes
      };
    } catch (e) {
      // If not JSON, try to parse as URL or simple text format
      // This is just an example format: name|dosage|frequency|startDate|endDate
      const parts = data.split('|');
      if (parts.length >= 3) {
        return {
          name: parts[0],
          dosage: parts[1],
          frequency: parts[2],
          startDate: parts[3] || new Date().toISOString(),
          endDate: parts[4] || null,
          notes: parts[5] || ''
        };
      }
      
      // If all else fails, just return the text as medication name
      return {
        name: data,
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString(),
        endDate: null,
        notes: 'Scanned from QR code'
      };
    }
  };
  
  // Use the scanned data
  const handleUseData = () => {
    if (parsedData) {
      onScanComplete(parsedData);
    }
  };
  
  // Reset scanner
  const handleReset = () => {
    setResult(null);
    setParsedData(null);
    setError(null);
    setIsScanning(true);
  };
  
  // Handle manual data entry
  const handleManualEntry = () => {
    onClose();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <QrCode className="w-5 h-5 mr-2 text-blue-500" />
          Scan Medication QR Code
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {isScanning && !cameraError && (
        <div className="mb-4 overflow-hidden rounded-lg border-2 border-blue-500">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={{
              video: { facingMode: 'environment' }
            }}
          />
        </div>
      )}
      
      {cameraError && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Camera Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={handleManualEntry}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Enter Details Manually
          </button>
        </div>
      )}
      
      {parsedData && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-700 mb-2">Medication Details Found</h3>
          <div className="space-y-2 text-sm text-gray-800">
            <p><span className="font-medium">Name:</span> {parsedData.name}</p>
            {parsedData.dosage && <p><span className="font-medium">Dosage:</span> {parsedData.dosage}</p>}
            {parsedData.frequency && <p><span className="font-medium">Frequency:</span> {parsedData.frequency}</p>}
          </div>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={handleUseData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
            >
              <Check className="w-4 h-4 mr-1" /> Use These Details
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
      
      {result && !parsedData && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-700 mb-2">QR Code Detected</h3>
          <p className="text-sm text-gray-800 break-all">{result}</p>
          <p className="text-sm text-yellow-600 mt-2">Could not automatically parse medication data.</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => {navigator.clipboard.writeText(result)}}
              className="px-4 py-2 border border-yellow-400 text-yellow-700 rounded-md hover:bg-yellow-100 text-sm flex items-center"
            >
              <Clipboard className="w-4 h-4 mr-1" /> Copy Text
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500 mt-4">
        {isScanning ? (
          <p>Position the QR code within the scanner frame</p>
        ) : (
          <button 
            onClick={handleManualEntry}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Or enter medication details manually
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicationQRScanner;