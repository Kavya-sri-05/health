import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addMeal, updateMeal } from '../store/slices/mealSlice';
import { X, Camera, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Spinner from '../components/Spinner';

const MealForm = ({ meal = null, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'breakfast',
    date: new Date().toISOString().substring(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    ingredients: [],
    notes: '',
    image: null
  });
  
  const [newIngredient, setNewIngredient] = useState('');
  
  // Set form data if meal is provided (edit mode)
  useEffect(() => {
    if (meal) {
      setFormData({
        title: meal.title || '',
        type: meal.type || 'breakfast',
        date: meal.date ? new Date(meal.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        time: meal.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        calories: meal.calories || '',
        protein: meal.protein || '',
        carbs: meal.carbs || '',
        fat: meal.fat || '',
        ingredients: meal.ingredients || [],
        notes: meal.notes || '',
        image: meal.image || null
      });
    }
  }, [meal]);
  
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
  
  // Add ingredient
  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, newIngredient.trim()]
      });
      setNewIngredient('');
    }
  };
  
  // Remove ingredient
  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'error'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove image
  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const mealData = {
        ...formData,
        calories: formData.calories ? parseFloat(formData.calories) : undefined,
        protein: formData.protein ? parseFloat(formData.protein) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fat: formData.fat ? parseFloat(formData.fat) : undefined
      };
      
      if (meal) {
        // Update existing meal
        await dispatch(updateMeal({ id: meal._id, mealData })).unwrap();
        toast({
          title: 'Success',
          description: 'Meal updated successfully',
          variant: 'success'
        });
      } else {
        // Add new meal
        await dispatch(addMeal(mealData)).unwrap();
        toast({
          title: 'Success',
          description: 'Meal added successfully',
          variant: 'success'
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save meal',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
    { id: 'other', label: 'Other' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {meal ? 'Edit Meal' : 'Add Meal'}
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
            Meal Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E.g., Grilled Chicken Salad"
          />
        </div>
        
        {/* Type, Date, and Time */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mealTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Nutrition info */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories
            </label>
            <input
              type="text"
              name="calories"
              value={formData.calories}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kcal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein
            </label>
            <input
              type="text"
              name="protein"
              value={formData.protein}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carbs
            </label>
            <input
              type="text"
              name="carbs"
              value={formData.carbs}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="g"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat
            </label>
            <input
              type="text"
              name="fat"
              value={formData.fat}
              onChange={handleNumberChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="g"
            />
          </div>
        </div>
        
        {/* Ingredients */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredients
          </label>
          <div className="flex">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add ingredient"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          {formData.ingredients.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.ingredients.map((ingredient, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                >
                  <span className="text-gray-800">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image (optional)
          </label>
          
          {formData.image ? (
            <div className="relative rounded-md overflow-hidden">
              <img 
                src={formData.image} 
                alt="Meal" 
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">Click to upload an image</p>
              <label className="cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
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
            placeholder="Additional notes about the meal"
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
              meal ? 'Update Meal' : 'Save Meal'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;