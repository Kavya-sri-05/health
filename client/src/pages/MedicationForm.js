import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addMedication, updateMedication } from '../store/slices/medicationSlice';
import { X, Calendar, Clock, QrCode, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Spinner from '../components/Spinner';
import MedicationQRScanner from '../components/MedicationQRScanner';

const MedicationForm = ({ medication = null, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
    reminders: true,
    notes: '',
    active: true
  });
  
  // Set form data if medication is provided (edit mode)
  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        time: medication.time || '',
        startDate: medication.startDate ? new Date(medication.startDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        endDate: medication.endDate ? new Date(medication.endDate).toISOString().substring(0, 10) : '',
        reminders: medication.reminders !== false,
        notes: medication.notes || '',
        active: medication.active !== false
      });
    }
  }, [medication]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle QR scan result
  const handleScanComplete = (scanData) => {
    setFormData({
      ...formData,
      ...scanData
    });
    setShowQRScanner(false);
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const medicationData = {
        ...formData,
        endDate: formData.endDate || null
      };
      
      if (medication) {
        // Update existing medication
        await dispatch(updateMedication({ id: medication._id, medicationData })).unwrap();
        toast({
          title: 'Success',
          description: 'Medication updated successfully',
          variant: 'success'
        });
      } else {
        // Add new medication
        await dispatch(addMedication(medicationData)).unwrap();
        toast({
          title: 'Success',
          description: 'Medication added successfully',
          variant: 'success'
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save medication',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {medication ? 'Edit Medication' : 'Add Medication'}
          </h2>
          <div className="flex">
            {!medication && (
              <button 
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="mr-2 p-1 text-blue-500 hover:text-blue-700"
                title="Scan QR Code"
              >
                <QrCode className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., Aspirin, Vitamin D"
            />
          </div>
          
          {/* Dosage */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., 500mg, 2 tablets"
            />
          </div>
          
          {/* Frequency and Time */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <input
                type="text"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Daily, Twice daily"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Morning, 8:00 AM"
              />
            </div>
          </div>
          
          {/* Start and End Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                End Date (optional)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              placeholder="Any additional information about this medication"
            />
          </div>
          
          {/* Options */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminders"
                name="reminders"
                checked={formData.reminders}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reminders" className="ml-2 block text-sm text-gray-700">
                Enable reminders
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                This medication is currently active
              </label>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <Spinner size="sm" color="white" />
              ) : (
                medication ? 'Update Medication' : 'Save Medication'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* QR Scanner */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <MedicationQRScanner 
            onScanComplete={handleScanComplete}
            onClose={() => setShowQRScanner(false)}
          />
        </div>
      )}
    </>
  );
};

export default MedicationForm;