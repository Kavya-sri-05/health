import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getHealthMetrics, getHealthMetricsByRange } from '../store/slices/healthMetricSlice';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Droplet, 
  Scale, // Changed from Weight to Scale
  Ruler, 
  Calendar, 
  Plus,
  Filter,
  BarChart2
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Line } from 'react-chartjs-2';
import HealthMetricsCard from '../components/HealthMetricsCard';
import HealthMetricsForm from '../components/HealthMetricsForm';
import Spinner from '../components/Spinner';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Health = () => {
  const dispatch = useDispatch();
  const { metrics, rangeMetrics, loading } = useSelector(state => state.healthMetrics);
  
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [metricType, setMetricType] = useState('heartRate');
  
  // Fetch health metrics on component mount
  useEffect(() => {
    dispatch(getHealthMetrics());
  }, [dispatch]);
  
  // Update range metrics when time range or metric type changes
  useEffect(() => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    dispatch(getHealthMetricsByRange({
      startDate: startOfDay(startDate).toISOString(),
      endDate: endOfDay(now).toISOString(),
      type: metricType
    }));
  }, [dispatch, timeRange, metricType]);
  
  // Metric types and their configurations
  const metricTypes = [
    { id: 'heartRate', name: 'Heart Rate', icon: <Heart />, color: 'text-red-500', bgColor: 'bg-red-100', unit: 'bpm' },
    { id: 'steps', name: 'Steps', icon: <Footprints />, color: 'text-green-500', bgColor: 'bg-green-100', unit: 'steps' },
    { id: 'weight', name: 'Weight', icon: <Scale />, color: 'text-blue-500', bgColor: 'bg-blue-100', unit: 'kg' }, // Changed from Weight to Scale
    { id: 'water', name: 'Water', icon: <Droplet />, color: 'text-blue-500', bgColor: 'bg-blue-100', unit: 'oz' },
    { id: 'bloodPressureSystolic', name: 'Blood Pressure', icon: <Activity />, color: 'text-purple-500', bgColor: 'bg-purple-100', unit: 'mmHg' },
    { id: 'height', name: 'Height', icon: <Ruler />, color: 'text-teal-500', bgColor: 'bg-teal-100', unit: 'cm' }
  ];
  
  // Time range options
  const timeRanges = [
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 90 Days' }
  ];
  
  // Filter metrics by type
  const getMetricsByType = (type) => {
    return metrics.filter(metric => metric.type === type).sort((a, b) => new Date(b.date) - new Date(a.date));
  };
  
  // Get the selected metric type config
  const selectedMetricConfig = metricTypes.find(m => m.id === metricType);
  
  // Chart data
  const chartData = {
    labels: rangeMetrics.map(m => format(new Date(m.date), timeRange === '24h' ? 'HH:mm' : 'MMM d')),
    datasets: [
      {
        label: `${selectedMetricConfig?.name || 'Value'} (${selectedMetricConfig?.unit || ''})`,
        data: rangeMetrics.map(m => m.value),
        borderColor: metricType === 'heartRate' ? 'rgb(239, 68, 68)' : 
                     metricType === 'steps' ? 'rgb(34, 197, 94)' : 
                     'rgb(59, 130, 246)',
        backgroundColor: metricType === 'heartRate' ? 'rgba(239, 68, 68, 0.1)' : 
                          metricType === 'steps' ? 'rgba(34, 197, 94, 0.1)' : 
                          'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2]
        }
      }
    },
    maintainAspectRatio: false
  };
  
  // Handle metric click
  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
  };
  
  // Close metric detail
  const closeMetricDetail = () => {
    setSelectedMetric(null);
  };
  
  if (loading && !metrics.length) {
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Health Metrics</h1>
          <p className="text-gray-600">
            Track and monitor your important health indicators
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddMetricForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Health Metric
        </button>
      </div>
      
      {/* Chart section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 mb-4 md:mb-0">Health Trends</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Metric type selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metricTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Time range selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {rangeMetrics.length > 0 ? (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart2 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No data available for this time range</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Metrics tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 py-2">
          {metricTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setMetricType(type.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap
                ${metricType === type.id 
                  ? `${type.bgColor} ${type.color} border border-${type.color.split('-')[1]}-200` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Metrics grid */}
      {getMetricsByType(metricType).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {getMetricsByType(metricType).map(metric => (
            <HealthMetricsCard
              key={metric._id}
              metric={metric}
              onClick={() => handleMetricClick(metric)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-700 font-medium text-lg mb-2">No {selectedMetricConfig?.name || 'Metric'} Data Yet</h3>
          <p className="text-gray-500 mb-4">
            Start tracking your {selectedMetricConfig?.name.toLowerCase() || 'health metrics'} to see your data here.
          </p>
          <button 
            onClick={() => setShowAddMetricForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Your First {selectedMetricConfig?.name || 'Metric'}
          </button>
        </div>
      )}
      
      {/* Add metric modal */}
      {showAddMetricForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-md w-full">
            <HealthMetricsForm onClose={() => setShowAddMetricForm(false)} />
          </div>
        </div>
      )}
      
      {/* Metric detail modal */}
      {selectedMetric && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeMetricDetail}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {metricTypes.find(m => m.id === selectedMetric.type)?.icon && (
                  <span className={`p-2 rounded-md mr-3 ${metricTypes.find(m => m.id === selectedMetric.type)?.bgColor} ${metricTypes.find(m => m.id === selectedMetric.type)?.color}`}>
                    {metricTypes.find(m => m.id === selectedMetric.type)?.icon}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-gray-800">
                  {metricTypes.find(m => m.id === selectedMetric.type)?.name || 'Metric'} Details
                </h3>
              </div>
              <button 
                onClick={closeMetricDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-baseline mb-4">
                <h4 className="text-3xl font-bold text-gray-800">
                  {selectedMetric.value.toLocaleString()}
                  <span className="ml-1 text-base text-gray-500">
                    {metricTypes.find(m => m.id === selectedMetric.type)?.unit}
                  </span>
                </h4>
                <span className="text-gray-500">
                  {format(new Date(selectedMetric.date), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              {selectedMetric.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h5 className="font-medium text-gray-700">Notes</h5>
                  <p className="text-gray-600 mt-1">{selectedMetric.notes}</p>
                </div>
              )}
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={closeMetricDetail}
                >
                  Close
                </button>
                
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => {
                    // Delete metric functionality would go here
                    closeMetricDetail();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Missing imports
const X = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M6 18L18 6M6 6l12 12" 
    />
  </svg>
);

export default Health;