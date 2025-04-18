import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addWorkout, updateWorkout } from '../store/slices/workoutSlice';
import { X, Calendar, Clock, Flame, MapPin, Activity } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Spinner from '../components/Spinner';

const WorkoutForm = ({ workout = null, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'cardio',
    duration: '',
    date: new Date().toISOString().substring(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    caloriesBurned: '',
    distance: '',
    location: '',
    notes: ''
  });
  
  // Set form data if workout is provided (edit mode)
  useEffect(() => {
    if (workout) {
      setFormData({
        title: workout.title || '',
        type: workout.type || 'cardio',
        duration: workout.duration || '',
        date: workout.date ? new Date(workout.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        time: workout.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        caloriesBurned: workout.caloriesBurned || '',
        distance: workout.distance || '',
        location: workout.location || '',
        notes: workout.notes || ''
      });
    }
  }, [workout]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle number inputs
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const workoutData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration, 10) : 0,
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned, 10) : undefined,
        distance: formData.distance ? parseFloat(formData.distance) : undefined
      };
      
      if (workout) {
        // Update existing workout
        await dispatch(updateWorkout({ id: workout._id, workoutData })).unwrap();
        toast({
          title: 'Success',
          description: 'Workout updated successfully',
          variant: 'success'
        });
      } else {
        // Add new workout
        await dispatch(addWorkout(workoutData)).unwrap();
        toast({
          title: 'Success',
          description: 'Workout added successfully',
          variant: 'success'
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save workout',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const workoutTypes = [
    { id: 'cardio', label: 'Cardio' },
    { id: 'strength', label: 'Strength' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'balance', label: 'Balance' },
    { id: 'sport', label: 'Sport' },
    { id: 'other', label: 'Other' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {workout ? 'Edit Workout' : 'Add Workout'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workout Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., Morning Run, Gym Session"
          />
        </div>
        
        {/* Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Workout Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {workoutTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Duration, Distance, and Calories */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (min)
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleNumberChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="E.g., 30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)
            </label>
            <input
              type="text"
              name="distance"
              value={formData.distance}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Flame className="h-4 w-4 mr-1 text-orange-500" />
              Calories
            </label>
            <input
              type="text"
              name="caloriesBurned"
              value={formData.caloriesBurned}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>
        
        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Location (optional)
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., City Park, Gym"
          />
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
            placeholder="How did it go? Any achievements?"
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
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <Spinner size="sm" color="white" />
            ) : (
              workout ? 'Update Workout' : 'Save Workout'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;