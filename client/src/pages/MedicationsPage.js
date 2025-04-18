import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMedications, addMedication, updateMedication, deleteMedication } from '../store/slices/medicationSlice';
import { Pill, Plus, X, Pencil, Trash2, AlertTriangle, Calendar, Clock, QrCode } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import Spinner from '../components/Spinner';
import MedicationExpiryWarning from '../components/MedicationExpiryWarning';
import MedicationQRScanner from '../components/MedicationQRScanner';

const MedicationsPage = () => {
  const dispatch = useDispatch();
  const { medicationList, loading } = useSelector(state => state.medications);
  
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    startDate: new Date().toISOString().substr(0, 10),
    endDate: '',
    notes: '',
    active: true
  });
  
  // Fetch medications on component mount
  useEffect(() => {
    dispatch(getMedications());
  }, [dispatch]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      startDate: new Date().toISOString().substr(0, 10),
      endDate: '',
      notes: '',
      active: true
    });
    setEditingMedication(null);
  };
  
  // Open form to add medication
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  // Open form to edit medication
  const openEditForm = (medication) => {
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      time: medication.time,
      startDate: new Date(medication.startDate).toISOString().substr(0, 10),
      endDate: medication.endDate ? new Date(medication.endDate).toISOString().substr(0, 10) : '',
      notes: medication.notes || '',
      active: medication.active
    });
    setEditingMedication(medication);
    setShowForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const medicationData = {
      ...formData,
      endDate: formData.endDate || null
    };
    
    if (editingMedication) {
      dispatch(updateMedication({ id: editingMedication._id, medicationData }));
    } else {
      dispatch(addMedication(medicationData));
    }
    
    setShowForm(false);
    resetForm();
  };
  
  // Handle medication deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      dispatch(deleteMedication(id));
    }
  };
  
  // Handle QR scan complete
  const handleScanComplete = (scanData) => {
    setFormData({
      ...formData,
      ...scanData
    });
    setShowScanner(false);
    setShowForm(true);
  };
  
  // Group medications by activity status
  const groupedMedications = () => {
    return {
      active: medicationList.filter(med => med.active),
      inactive: medicationList.filter(med => !med.active)
    };
  };
  
  // Get color class based on expiry status
  const getExpiryColorClass = (medication) => {
    if (!medication.endDate) return '';
    
    const today = new Date();
    const expiryDate = new Date(medication.endDate);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    if (daysUntilExpiry < 0) return 'border-gray-200';
    if (daysUntilExpiry <= 2) return 'border-red-200';
    if (daysUntilExpiry <= 7) return 'border-orange-200';
    if (daysUntilExpiry <= 14) return 'border-blue-200';
    return 'border-green-200';
  };
  
  if (loading && !medicationList.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  const { active: activeMedications, inactive: inactiveMedications } = groupedMedications();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Medications</h1>
          <p className="text-gray-600">
            Manage your prescriptions and medications
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 flex items-center"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Scan QR Code
          </button>
          
          <button 
            onClick={openAddForm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Medication
          </button>
        </div>
      </div>
      
      {/* Active medications */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Active Medications</h2>
        
        {activeMedications.length > 0 ? (
          <div className="space-y-4">
            {activeMedications.map(medication => (
              <div 
                key={medication._id}
                className={`bg-white rounded-lg shadow-sm border ${getExpiryColorClass(medication)} p-4`}
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="p-3 rounded-md bg-purple-100 text-purple-600 mr-4">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{medication.name}</h3>
                      <p className="text-gray-600 mt-1">{medication.dosage}</p>
                      
                      <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {medication.time}, {medication.frequency}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Started {format(parseISO(medication.startDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      {medication.notes && (
                        <p className="mt-3 text-gray-600 text-sm">{medication.notes}</p>
                      )}
                      
                      {medication.endDate && (
                        <div className="mt-3">
                          <MedicationExpiryWarning medication={medication} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditForm(medication)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(medication._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No active medications.</p>
          </div>
        )}
      </div>
      
      {/* Inactive medications */}
      {inactiveMedications.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Inactive Medications</h2>
          
          <div className="space-y-4">
            {inactiveMedications.map(medication => (
              <div 
                key={medication._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 opacity-70"
              >
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <div className="p-3 rounded-md bg-gray-100 text-gray-500 mr-4">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 text-lg">{medication.name}</h3>
                      <p className="text-gray-500 mt-1">{medication.dosage}</p>
                      
                      <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {medication.time}, {medication.frequency}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(parseISO(medication.startDate), 'MMM d, yyyy')} 
                          {medication.endDate && ` - ${format(parseISO(medication.endDate), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditForm(medication)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(medication._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {medicationList.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-700 font-medium text-lg mb-2">No Medications Yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking your medications to receive timely reminders.
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={() => setShowScanner(true)}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 flex items-center"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </button>
            <button 
              onClick={openAddForm}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Manually
            </button>
          </div>
        </div>
      )}
      
      {/* Add/Edit medication form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingMedication ? 'Edit Medication' : 'Add Medication'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Aspirin, Vitamin D"
                />
              </div>
              
              {/* Dosage */}
              <div className="mb-4">
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  id="dosage"
                  name="dosage"
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., 500mg, 2 tablets"
                />
              </div>
              
              {/* Frequency and Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    id="frequency"
                    name="frequency"
                    type="text"
                    required
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., Daily, Twice daily"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="text"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., Morning, 8:00 AM"
                  />
                </div>
              </div>
              
              {/* Start and End Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Any additional information about this medication"
                />
              </div>
              
              {/* Active status */}
              <div className="mb-6 flex items-center">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  This medication is currently active
                </label>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingMedication ? 'Update' : 'Save'} Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* QR Scanner */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <MedicationQRScanner 
            onScanComplete={handleScanComplete}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;