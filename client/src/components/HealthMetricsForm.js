import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addHealthMetric } from '../store/slices/healthMetricSlice';
import { X } from 'lucide-react';

const HealthMetricsForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [metricType, setMetricType] = useState('heartRate');
  const [metricValue, setMetricValue] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  // Define metric types and their properties
  const metricTypes = [
    { id: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 40, max: 220 },
    { id: 'steps', label: 'Steps', unit: 'steps', min: 0, max: 100000 },
    { id: 'weight', label: 'Weight', unit: 'kg', min: 20, max: 500 },
    { id: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', min: 70, max: 220 },
    { id: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', min: 40, max: 130 },
    { id: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', min: 30, max: 600 },
    { id: 'sleepHours', label: 'Sleep', unit: 'hours', min: 0, max: 24 },
    { id: 'water', label: 'Water', unit: 'oz', min: 0, max: 200 },
    { id: 'caloriesBurned', label: 'Calories Burned', unit: 'kcal', min: 0, max: 10000 },
    { id: 'height', label: 'Height', unit: 'cm', min: 30, max: 250 }
  ];
  
  // Find the selected metric type
  const selectedMetricType = metricTypes.find(type => type.id === metricType);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    const value = parseFloat(metricValue);
    
    if (isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (value < selectedMetricType.min || value > selectedMetricType.max) {
      setError(`Value must be between ${selectedMetricType.min} and ${selectedMetricType.max}`);
      return;
    }
    
    // Create metric object
    const metric = {
      type: metricType,
      value,
      date: new Date().toISOString(),
      notes
    };
    
    // Dispatch action to add health metric
    dispatch(addHealthMetric(metric));
    
    // Close form
    onClose();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Add Health Metric</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Metric type */}
        <div className="mb-4">
          <label htmlFor="metricType" className="block text-sm font-medium text-gray-700 mb-1">
            Metric Type
          </label>
          <select
            id="metricType"
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metricTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Metric value */}
        <div className="mb-4">
          <label htmlFor="metricValue" className="block text-sm font-medium text-gray-700 mb-1">
            Value ({selectedMetricType.unit})
          </label>
          <input
            id="metricValue"
            type="number"
            step="any"
            value={metricValue}
            onChange={(e) => {
              setMetricValue(e.target.value);
              setError('');
            }}
            min={selectedMetricType.min}
            max={selectedMetricType.max}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
          />
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Metric
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthMetricsForm;