import { apiRequest } from '../lib/queryClient';
import { calculateBMI, calculateCaloriesFromSteps } from '../lib/utils';

// Get all health metrics
export const fetchHealthMetrics = async () => {
  const response = await apiRequest('GET', '/health-metrics');
  return response.json();
};

// Get health metrics in a date range
export const fetchHealthMetricsByRange = async (startDate, endDate, type) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (type) queryParams.append('type', type);
  
  const endpoint = `/health-metrics/range?${queryParams.toString()}`;
  const response = await apiRequest('GET', endpoint);
  return response.json();
};

// Get latest health metrics by type
export const fetchLatestHealthMetric = async (type) => {
  const response = await apiRequest('GET', `/health-metrics/latest/${type}`);
  return response.json();
};

// Create a new health metric
export const createHealthMetric = async (metric) => {
  const response = await apiRequest('POST', '/health-metrics', metric);
  return response.json();
};

// Update a health metric
export const updateHealthMetric = async (id, metric) => {
  const response = await apiRequest('PUT', `/health-metrics/${id}`, metric);
  return response.json();
};

// Delete a health metric
export const deleteHealthMetric = async (id) => {
  await apiRequest('DELETE', `/health-metrics/${id}`);
  return { id };
};

// Process new health metric data (calculate derived metrics)
export const processHealthMetric = async (metric) => {
  // Calculate BMI if we have height and weight
  if (metric.type === 'weight') {
    try {
      // Get latest height
      const heightResponse = await fetchLatestHealthMetric('height');
      if (heightResponse.metric && heightResponse.metric.value) {
        const height = heightResponse.metric.value;
        const weight = metric.value;
        
        // Calculate BMI
        const bmi = calculateBMI(height, weight);
        
        if (bmi) {
          // Create BMI metric
          await createHealthMetric({
            type: 'bmi',
            value: bmi,
            date: new Date().toISOString(),
            derived: true,
            notes: `Calculated from weight (${weight}kg) and height (${height}cm)`
          });
        }
      }
    } catch (error) {
      console.error('Error calculating BMI:', error);
    }
  }
  
  // Calculate calories burned from steps
  if (metric.type === 'steps') {
    try {
      // Get latest weight for more accurate calculation
      const weightResponse = await fetchLatestHealthMetric('weight');
      const weight = weightResponse.metric?.value || 70; // Default to 70kg if no weight data
      
      const steps = metric.value;
      const calories = calculateCaloriesFromSteps(steps, weight);
      
      // Create calories burned metric
      await createHealthMetric({
        type: 'caloriesBurned',
        value: calories,
        date: new Date().toISOString(),
        derived: true,
        notes: `Calculated from ${steps} steps and weight ${weight}kg`
      });
    } catch (error) {
      console.error('Error calculating calories burned:', error);
    }
  }
  
  return metric;
};

// Get summary statistics for a health metric type
export const getHealthMetricStats = async (type, period = '30days') => {
  const response = await apiRequest('GET', `/health-metrics/stats/${type}?period=${period}`);
  return response.json();
};

// Generate health report with metrics summary
export const generateHealthReport = async (startDate, endDate) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const endpoint = `/health-metrics/report?${queryParams.toString()}`;
  const response = await apiRequest('GET', endpoint);
  return response.json();
};

// Export to default object
const healthMetricService = {
  fetchHealthMetrics,
  fetchHealthMetricsByRange,
  fetchLatestHealthMetric,
  createHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  processHealthMetric,
  getHealthMetricStats,
  generateHealthReport
};

export default healthMetricService;