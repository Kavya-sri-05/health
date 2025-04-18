import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getHealthMetrics } from '../store/slices/healthMetricSlice';
import { getWorkouts } from '../store/slices/workoutSlice';
import { getMedications } from '../store/slices/medicationSlice';
import { getAchievements, updateClientSideAchievements } from '../store/slices/achievementSlice';
import { 
  Activity, 
  Heart, 
  Footprints, 
  ArrowUp, 
  ArrowDown, 
  Award, 
  Calendar, 
  Pill, 
  Dumbbell,
  BarChart2,
  Plus 
} from 'lucide-react';
import { format, subDays, parseISO, isAfter } from 'date-fns';
import { Line } from 'react-chartjs-2';
import HealthMetricsCard from '../components/HealthMetricsCard';
import HealthMetricsForm from '../components/HealthMetricsForm';
import DeviceConnectionManager from '../components/DeviceConnectionManager';
import Spinner from '../components/Spinner';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { metrics, loading: metricsLoading } = useSelector(state => state.healthMetrics);
  const { workoutList, loading: workoutsLoading } = useSelector(state => state.workouts);
  const { medicationList, loading: medicationsLoading } = useSelector(state => state.medications);
  const { earnedBadges, loading: badgesLoading } = useSelector(state => state.achievements);
  
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getHealthMetrics());
    dispatch(getWorkouts());
    dispatch(getMedications());
    dispatch(getAchievements());
    
    // Update achievements based on metrics and other data
    const updateAchievementsInterval = setInterval(() => {
      dispatch(updateClientSideAchievements());
    }, 60000); // Check every minute
    
    return () => clearInterval(updateAchievementsInterval);
  }, [dispatch]);
  
  // Calculate today's metrics
  const getTodayMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMetrics = metrics.filter(metric => {
      const metricDate = new Date(metric.date);
      metricDate.setHours(0, 0, 0, 0);
      return metricDate.getTime() === today.getTime();
    });
    
    return {
      heartRate: todayMetrics.find(m => m.type === 'heartRate')?.value || 0,
      steps: todayMetrics.find(m => m.type === 'steps')?.value || 0,
      calories: todayMetrics.find(m => m.type === 'caloriesBurned')?.value || 0
    };
  };
  
  // Get recent metrics for chart
  const getRecentMetricsByType = (type, days = 7) => {
    const today = new Date();
    const startDate = subDays(today, days);
    
    // Filter metrics by type and date range
    return metrics
      .filter(metric => 
        metric.type === type && 
        isAfter(parseISO(metric.date), startDate)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Chart data for heart rate
  const heartRateChartData = () => {
    const heartRateMetrics = getRecentMetricsByType('heartRate');
    
    return {
      labels: heartRateMetrics.map(m => format(new Date(m.date), 'MMM d')),
      datasets: [
        {
          label: 'Heart Rate (bpm)',
          data: heartRateMetrics.map(m => m.value),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  };
  
  // Chart data for steps
  const stepsChartData = () => {
    const stepsMetrics = getRecentMetricsByType('steps');
    
    return {
      labels: stepsMetrics.map(m => format(new Date(m.date), 'MMM d')),
      datasets: [
        {
          label: 'Steps',
          data: stepsMetrics.map(m => m.value),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.2,
          fill: true
        }
      ]
    };
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
  
  // Get medications due today
  const getTodayMedications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return medicationList.filter(med => 
      med.active && 
      (!med.endDate || new Date(med.endDate) >= today)
    );
  };
  
  // Today's data
  const todayMetrics = getTodayMetrics();
  const todayMedications = getTodayMedications();
  const recentWorkouts = workoutList.slice(0, 3);
  
  // Loading state
  const isLoading = metricsLoading || workoutsLoading || medicationsLoading || badgesLoading;
  
  if (isLoading && !metrics.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.firstName || user?.username || 'Friend'}!
        </h1>
        <p className="text-gray-600">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>
      
      {/* Today's summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center text-red-500 mb-2">
            <Heart className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Heart Rate</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-800">
              {todayMetrics.heartRate ? Math.round(todayMetrics.heartRate) : '--'}
            </span>
            <span className="ml-1 text-gray-500">bpm</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center text-green-500 mb-2">
            <Footprints className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Steps</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-800">
              {todayMetrics.steps ? todayMetrics.steps.toLocaleString() : '--'}
            </span>
            <span className="ml-1 text-gray-500">steps</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center text-amber-500 mb-2">
            <Activity className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Calories Burned</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-800">
              {todayMetrics.calories ? Math.round(todayMetrics.calories) : '--'}
            </span>
            <span className="ml-1 text-gray-500">kcal</span>
          </div>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Health Trends</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-600">
                  Heart Rate
                </button>
                <button className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                  Steps
                </button>
              </div>
            </div>
            
            <div className="h-64">
              <Line data={heartRateChartData()} options={chartOptions} />
            </div>
          </div>
          
          {/* Recent metrics */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Recent Health Metrics</h2>
              <button 
                onClick={() => setShowAddMetricForm(true)}
                className="flex items-center px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Metric
              </button>
            </div>
            
            {metrics.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {metrics.slice(0, 6).map(metric => (
                  <HealthMetricsCard
                    key={metric._id}
                    metric={metric}
                    onClick={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-700 font-medium mb-2">No Health Metrics Yet</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Start tracking your health by adding your first metric.
                </p>
                <button 
                  onClick={() => setShowAddMetricForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Your First Metric
                </button>
              </div>
            )}
          </div>
          
          {/* Recent workouts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Recent Workouts</h2>
              <Link href="/workouts" className="text-blue-500 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
            
            {recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map(workout => (
                  <div key={workout._id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-md mr-4">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{workout.title}</h3>
                      <div className="flex text-sm text-gray-500 space-x-3 mt-1">
                        <span>{workout.type}</span>
                        <span>{workout.duration} minutes</span>
                        {workout.caloriesBurned && <span>{workout.caloriesBurned} kcal</span>}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {format(new Date(workout.date), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No workouts recorded yet.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Device connection manager */}
          <DeviceConnectionManager />
          
          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h2>
              <Link href="/achievements" className="text-blue-500 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
            
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {earnedBadges.slice(0, 6).map(badgeId => (
                  <div key={badgeId} className="flex flex-col items-center">
                    <AchievementBadge type={badgeId} earned={true} size="md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No achievements earned yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Keep tracking your health to earn badges!
                </p>
              </div>
            )}
          </div>
          
          {/* Today's medications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-purple-500" />
                Today's Medications
              </h2>
              <Link href="/medications" className="text-blue-500 hover:text-blue-700 text-sm">
                View All
              </Link>
            </div>
            
            {todayMedications.length > 0 ? (
              <div className="space-y-3">
                {todayMedications.slice(0, 5).map(medication => (
                  <div key={medication._id} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <div className="mr-3">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{medication.name}</h3>
                      <p className="text-sm text-gray-500">{medication.dosage}, {medication.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No medications scheduled for today.</p>
              </div>
            )}
          </div>
          
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              <h2 className="text-lg font-medium text-gray-800">Upcoming</h2>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No upcoming events.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add metric modal */}
      {showAddMetricForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div onClick={e => e.stopPropagation()} className="max-w-md w-full">
            <HealthMetricsForm onClose={() => setShowAddMetricForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

// Missing imports
const Link = ({ href, className, children }) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

// Import AchievementBadge here to avoid circular dependency
const AchievementBadge = ({ type, earned }) => {
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
      <Award className="w-6 h-6" />
    </div>
  );
};

export default Dashboard;
