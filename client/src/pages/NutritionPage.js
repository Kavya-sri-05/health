import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMeals, addMeal, updateMeal, deleteMeal } from '../store/slices/mealSlice';
import { Utensils, Plus, X, Pencil, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '../components/Spinner';

const NutritionPage = () => {
  const dispatch = useDispatch();
  const { mealList, loading } = useSelector(state => state.meals);
  
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    date: new Date().toISOString().substr(0, 10),
    time: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    notes: ''
  });
  
  // Fetch meals on component mount
  useEffect(() => {
    dispatch(getMeals());
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
      name: '',
      type: 'breakfast',
      date: new Date().toISOString().substr(0, 10),
      time: '',
      calories: '',
      carbs: '',
      protein: '',
      fat: '',
      notes: ''
    });
    setEditingMeal(null);
  };
  
  // Open form to add meal
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  // Open form to edit meal
  const openEditForm = (meal) => {
    setFormData({
      name: meal.name,
      type: meal.type,
      date: new Date(meal.date).toISOString().substr(0, 10),
      time: meal.time || '',
      calories: meal.calories || '',
      carbs: meal.carbs || '',
      protein: meal.protein || '',
      fat: meal.fat || '',
      notes: meal.notes || ''
    });
    setEditingMeal(meal);
    setShowForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mealData = {
      ...formData,
      calories: formData.calories ? parseInt(formData.calories, 10) : undefined,
      carbs: formData.carbs ? parseInt(formData.carbs, 10) : undefined,
      protein: formData.protein ? parseInt(formData.protein, 10) : undefined,
      fat: formData.fat ? parseInt(formData.fat, 10) : undefined
    };
    
    if (editingMeal) {
      dispatch(updateMeal({ id: editingMeal._id, mealData }));
    } else {
      dispatch(addMeal(mealData));
    }
    
    setShowForm(false);
    resetForm();
  };
  
  // Handle meal deletion
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      dispatch(deleteMeal(id));
    }
  };
  
  // Group meals by date
  const groupedMeals = () => {
    const grouped = {};
    
    mealList.forEach(meal => {
      const date = new Date(meal.date);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(meal);
    });
    
    return grouped;
  };
  
  // Meal type options
  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', color: 'text-orange-500 bg-orange-100' },
    { id: 'lunch', name: 'Lunch', color: 'text-green-500 bg-green-100' },
    { id: 'dinner', name: 'Dinner', color: 'text-blue-500 bg-blue-100' },
    { id: 'snack', name: 'Snack', color: 'text-purple-500 bg-purple-100' },
    { id: 'other', name: 'Other', color: 'text-gray-500 bg-gray-100' }
  ];
  
  // Get color class for meal type
  const getMealTypeColor = (type) => {
    const meal = mealTypes.find(t => t.id === type);
    return meal ? meal.color : 'text-gray-500 bg-gray-100';
  };
  
  if (loading && !mealList.length) {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nutrition</h1>
          <p className="text-gray-600">
            Track your meals and nutrition
          </p>
        </div>
        
        <button 
          onClick={openAddForm}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Meal
        </button>
      </div>
      
      {/* Meals list */}
      {mealList.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedMeals()).map(([dateKey, meals]) => (
            <div key={dateKey}>
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="space-y-4">
                {meals.map(meal => (
                  <div 
                    key={meal._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div className={`p-3 rounded-md ${getMealTypeColor(meal.type)} mr-4`}>
                          <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-gray-800 text-lg">{meal.name}</h3>
                            <span className="ml-3 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {mealTypes.find(t => t.id === meal.type)?.name || 'Meal'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-y-1 gap-x-4 mt-2 text-sm text-gray-500">
                            {meal.time && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {meal.time}
                              </span>
                            )}
                            {meal.calories && (
                              <span className="text-orange-600 font-medium">
                                {meal.calories} kcal
                              </span>
                            )}
                          </div>
                          
                          {(meal.carbs || meal.protein || meal.fat) && (
                            <div className="flex gap-x-4 mt-2 text-sm">
                              {meal.carbs && (
                                <span className="text-blue-600">
                                  Carbs: {meal.carbs}g
                                </span>
                              )}
                              {meal.protein && (
                                <span className="text-green-600">
                                  Protein: {meal.protein}g
                                </span>
                              )}
                              {meal.fat && (
                                <span className="text-purple-600">
                                  Fat: {meal.fat}g
                                </span>
                              )}
                            </div>
                          )}
                          
                          {meal.notes && (
                            <p className="mt-3 text-gray-600 text-sm">{meal.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditForm(meal)}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(meal._id)}
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
          <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-700 font-medium text-lg mb-2">No Meals Logged Yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking your nutrition by adding your meals.
          </p>
          <button 
            onClick={openAddForm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Your First Meal
          </button>
        </div>
      )}
      
      {/* Add/Edit meal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingMeal ? 'Edit Meal' : 'Add Meal'}
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
                  Meal Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Chicken Salad, Protein Smoothie"
                />
              </div>
              
              {/* Type */}
              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mealTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Calories */}
              <div className="mb-4">
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Calories
                </label>
                <input
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="kcal (optional)"
                />
              </div>
              
              {/* Macros */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    id="carbs"
                    name="carbs"
                    type="number"
                    min="0"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    id="protein"
                    name="protein"
                    type="number"
                    min="0"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    id="fat"
                    name="fat"
                    type="number"
                    min="0"
                    value={formData.fat}
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
                  placeholder="Optional: Add any additional details about this meal"
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
                  {editingMeal ? 'Update' : 'Save'} Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPage;