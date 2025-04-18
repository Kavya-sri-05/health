import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import { Activity, Heart, Dumbbell, Pill, Award } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Login = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [isRegisterForm, setIsRegisterForm] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);
  
  // Toggle between login and register forms
  const toggleForm = () => {
    setIsRegisterForm(!isRegisterForm);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side: Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Activity className="h-12 w-12 text-blue-500 mx-auto" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">HealthTracker</h1>
            <p className="mt-2 text-gray-600">
              Your comprehensive health monitoring solution
            </p>
          </div>
          
          {isRegisterForm ? (
            <RegisterForm onToggleForm={toggleForm} />
          ) : (
            <LoginForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
      
      {/* Right side: Hero */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto text-white">
          <h2 className="text-3xl font-bold mb-6">
            Take control of your health journey
          </h2>
          
          <p className="mb-8 text-blue-100">
            Track, analyze, and improve your health with our comprehensive
            health monitoring platform. Connect devices, log workouts, manage
            medications, and celebrate your achievements.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <FeatureItem 
              icon={<Heart className="h-6 w-6 text-red-300" />}
              title="Health Monitoring"
              description="Track vital signs and health metrics in real-time"
            />
            
            <FeatureItem 
              icon={<Dumbbell className="h-6 w-6 text-green-300" />}
              title="Workout Tracking"
              description="Log and analyze your fitness activities"
            />
            
            <FeatureItem 
              icon={<Pill className="h-6 w-6 text-purple-300" />}
              title="Medication Management"
              description="Never miss a dose with reminders and tracking"
            />
            
            <FeatureItem 
              icon={<Award className="h-6 w-6 text-yellow-300" />}
              title="Achievements"
              description="Stay motivated with badges and milestone tracking"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature item component for the hero section
const FeatureItem = ({ icon, title, description }) => (
  <div>
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="ml-2 font-semibold">{title}</h3>
    </div>
    <p className="text-blue-200 text-sm">{description}</p>
  </div>
);

export default Login;