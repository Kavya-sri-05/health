import React from 'react';
import { 
  Heart, 
  Footprints,
  Droplet,
  Scale,
  Activity,
  Ruler,
  Timer,
  Thermometer,
  Zap,
  ArrowUp,
  ArrowDown,
  BarChart2
} from 'lucide-react';
import { format } from 'date-fns';

const HealthMetricsCard = ({ metric, onClick }) => {
  // Determine icon and color based on metric type
  const getMetricDetails = (type) => {
    switch (type) {
      case 'heartRate':
        return { 
          icon: <Heart className="w-5 h-5" />, 
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Heart Rate',
          unit: 'bpm',
          formatValue: (val) => Math.round(val)
        };
      case 'steps':
        return { 
          icon: <Footprints className="w-5 h-5" />, 
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Steps',
          unit: 'steps',
          formatValue: (val) => val.toLocaleString()
        };
      case 'Scale':
        return { 
          icon: <Scale className="w-5 h-5" />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Scale',
          unit: 'kg',
          formatValue: (val) => val.toFixed(1)
        };
      case 'bloodPressureSystolic':
        return { 
          icon: <Activity className="w-5 h-5" />, 
          color: 'text-purple-500',
          bgColor: 'bg-purple-100',
          label: 'Blood Pressure (Systolic)',
          unit: 'mmHg',
          formatValue: (val) => Math.round(val)
        };
      case 'bloodPressureDiastolic':
        return { 
          icon: <Activity className="w-5 h-5" />, 
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-100',
          label: 'Blood Pressure (Diastolic)',
          unit: 'mmHg',
          formatValue: (val) => Math.round(val)
        };
      case 'bloodSugar':
        return { 
          icon: <Thermometer className="w-5 h-5" />, 
          color: 'text-orange-500',
          bgColor: 'bg-orange-100',
          label: 'Blood Sugar',
          unit: 'mg/dL',
          formatValue: (val) => Math.round(val)
        };
      case 'sleepHours':
        return { 
          icon: <Timer className="w-5 h-5" />, 
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-100',
          label: 'Sleep',
          unit: 'hours',
          formatValue: (val) => val.toFixed(1)
        };
      case 'water':
        return { 
          icon: <Droplet className="w-5 h-5" />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          label: 'Water',
          unit: 'oz',
          formatValue: (val) => Math.round(val)
        };
      case 'caloriesBurned':
        return { 
          icon: <Zap className="w-5 h-5" />, 
          color: 'text-amber-500',
          bgColor: 'bg-amber-100',
          label: 'Calories Burned',
          unit: 'kcal',
          formatValue: (val) => Math.round(val)
        };
      case 'height':
        return { 
          icon: <Ruler className="w-5 h-5" />, 
          color: 'text-teal-500',
          bgColor: 'bg-teal-100',
          label: 'Height',
          unit: 'cm',
          formatValue: (val) => Math.round(val)
        };
      default:
        return { 
          icon: <BarChart2 className="w-5 h-5" />, 
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: type,
          unit: '',
          formatValue: (val) => val
        };
    }
  };

  const { icon, color, bgColor, label, unit, formatValue } = getMetricDetails(metric.type);
  
  // Format date
  const formattedDate = metric.date ? format(new Date(metric.date), 'MMM d, yyyy h:mm a') : 'Unknown';
  
  // Check if the value is higher or lower than previous
  const getComparisonIndicator = () => {
    if (!metric.previousValue) return null;
    
    const diff = metric.value - metric.previousValue;
    const percentChange = (diff / metric.previousValue) * 100;
    
    if (Math.abs(percentChange) < 1) return null;
    
    const isPositive = diff > 0;
    const isNegativeGood = ['Scale', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'bloodSugar'].includes(metric.type);
    
    // Determine if this change is good or bad (just an example logic, might need adjustments)
    const isGood = (isPositive && !isNegativeGood) || (!isPositive && isNegativeGood);
    
    return (
      <div className={`flex items-center text-xs font-medium ${isGood ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <ArrowUp className="w-3 h-3 mr-1" />
        ) : (
          <ArrowDown className="w-3 h-3 mr-1" />
        )}
        {Math.abs(percentChange).toFixed(1)}%
      </div>
    );
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`flex items-center justify-center ${bgColor} ${color} p-2 rounded-md`}>
          {icon}
        </div>
        {getComparisonIndicator()}
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      
      <div className="mt-1 flex items-end">
        <span className="text-2xl font-bold text-gray-800">
          {formatValue(metric.value)}
        </span>
        {unit && <span className="text-sm text-gray-500 ml-1 mb-0.5">{unit}</span>}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">{formattedDate}</div>
    </div>
  );
};

export default HealthMetricsCard;