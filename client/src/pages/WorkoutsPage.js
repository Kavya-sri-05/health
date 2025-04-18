import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getWorkouts, addWorkout, updateWorkout, deleteWorkout } from '../store/slices/workoutSlice';
import { Dumbbell, Calendar, Clock, Flame, MapPin, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '../components/Spinner';

const WorkoutsPage = () => {
  const dispatch = useDispatch();
  const { workoutList, loading } = useSelector(state => state.workouts);
  
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'cardio',
    duration: '',
    date: new Date().toISOString().substr(0, 10),
    caloriesBurned: '',
    notes: '',
    location: ''
  });
  
  // Fetch workouts on component mount
  useEffect(() => {
    dispatch(getWorkouts());
  }, [dispatch]);
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      type: 'cardio',
      duration: '',
      date: new Date().toISOString().substr(0, 10),
      caloriesBurned: '',
      notes: '',
      location: ''
    });
    setEditingWorkout(null);
  };
  
  // Open form to add workout
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  // Open form to edit workout
  const openEditForm = (workout) => {
    setFormData({
      title: workout.title,
      type: workout.type,
      duration: workout.duration,
      date: new Date(workout.date).toISOString().substr(0, 10),
      caloriesBurned: workout.caloriesBurned || '',
      notes: workout.notes || '',
      location: workout.location || ''
    });
    setEditingWorkout(workout);
    setShowForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const workoutData = {
      ...formData,
      duration: parseInt(formData.duration, 10),
      caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned, 10) : undefined
    };
    
    if (editingWorkout) {
      dispatch(updateWorkout({ id: editingWorkout._id, workoutData }));
    } else {
      dispatch(addWorkout(workoutData));
    }
    
    setShowForm(false);
    resetForm();
  };
  
  // Handle workout deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      dispatch(deleteWorkout(id));
    }
  };
  
  // Group workouts by month
  const groupedWorkouts = () => {
    const grouped = {};
    
    workoutList.forEach(workout => {
      const date = new Date(workout.date);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(workout);
    });
    
    return grouped;
  };
  
  // Workout type options
  const workoutTypes = [
    { id: 'cardio', name: 'Cardio', color: 'text-red-500 bg-red-100' },
    { id: 'strength', name: 'Strength', color: 'text-blue-500 bg-blue-100' },
    { id: 'flexibility', name: 'Flexibility', color: 'text-green-500 bg-green-100' },
    { id: 'balance', name: 'Balance', color: 'text-purple-500 bg-purple-100' },
    { id: 'other', name: 'Other', color: 'text-gray-500 bg-gray-100' }
  ];
  
  // Get color class for workout type
  const getWorkoutTypeColor = (type) => {
    const workout = workoutTypes.find(t => t.id === type);
    return workout ? workout.color : 'text-gray-500 bg-gray-100';
  };
  
  if (loading && !workoutList.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Workouts</h1>
          <p className="text-gray-600">
            Track and manage your fitness activities
          </p>
        </div>
        
        <button 
          onClick={openAddForm}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Workout
        </button>
      </div>
      
      {/* Workouts list */}
      {workoutList.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedWorkouts()).map(([monthYear, workouts]) => (
            <div key={monthYear}>
              <h2 className="text-lg font-medium text-gray-700 mb-4">{monthYear}</h2>
              <div className="space-y-4">
                {workouts.map(workout => (
                  <div 
                    key={workout._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className={`p-3 rounded-md ${getWorkoutTypeColor(workout.type)} mr-4`}>
                          <Dumbbell className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{workout.title}</h3>
                          <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(workout.date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {workout.duration} min
                            </span>
                            {workout.caloriesBurned && (
                              <span className="flex items-center">
                                <Flame className="w-4 h-4 mr-1 text-orange-500" />
                                {workout.caloriesBurned} kcal
                              </span>
                            )}
                            {workout.location && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {workout.location}
                              </span>
                            )}
                          </div>
                          {workout.notes && (
                            <p className="mt-3 text-gray-600 text-sm">{workout.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditForm(workout)}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(workout._id)}
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
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-700 font-medium text-lg mb-2">No Workouts Yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking your fitness activities to see them here.
          </p>
          <button 
            onClick={openAddForm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Your First Workout
          </button>
        </div>
      )}
      
      {/* Add/Edit workout form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingWorkout ? 'Edit Workout' : 'Add Workout'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Morning Run, Gym Session"
                />
              </div>
              
              {/* Type */}
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Workout Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workoutTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Duration and Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Calories and Location */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700 mb-1">
                    Calories Burned
                  </label>
                  <input
                    id="caloriesBurned"
                    name="caloriesBurned"
                    type="number"
                    min="0"
                    value={formData.caloriesBurned}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Optional: How did it go? Any achievements?"
                />
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
                  {editingWorkout ? 'Update' : 'Save'} Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;