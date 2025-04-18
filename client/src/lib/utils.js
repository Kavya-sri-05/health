import { formatDistance, parseISO } from 'date-fns';

// Format date relative to now (e.g. "2 days ago")
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(parsedDate, new Date(), { addSuffix: true });
};

// Format number with commas for thousands
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Check if a string is a valid URL
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Create slug from string
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Get random item from array
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get color class for health metric type
export const getHealthMetricColor = (type) => {
  const colors = {
    heartRate: { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    steps: { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    weight: { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    bloodPressureSystolic: { text: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    bloodPressureDiastolic: { text: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    bloodSugar: { text: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    sleepHours: { text: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    water: { text: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    caloriesBurned: { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    height: { text: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200' }
  };
  
  return colors[type] || { text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
};

// Calculate BMI from height (cm) and weight (kg)
export const calculateBMI = (height, weight) => {
  if (!height || !weight) return null;
  
  // Convert height from cm to m
  const heightInMeters = height / 100;
  
  // BMI formula: weight (kg) / height² (m)
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal place
};

// Get BMI category from BMI value
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Calculate calories burned from steps (approximation)
export const calculateCaloriesFromSteps = (steps, weight = 70) => {
  // Average calories burned per step for a 70kg person is approximately 0.04
  // Adjust based on weight: heavier people burn more calories per step
  const caloriesPerStep = 0.04 * (weight / 70);
  
  return Math.round(steps * caloriesPerStep);
};

export default {
  formatRelativeTime,
  formatNumber,
  isValidUrl,
  getInitials,
  createSlug,
  getRandomItem,
  truncateText,
  getHealthMetricColor,
  calculateBMI,
  getBMICategory,
  calculateCaloriesFromSteps
};