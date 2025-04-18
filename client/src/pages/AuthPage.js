// client/src/pages/AuthPage.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Fixed import
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useLocation } from 'wouter'; // Add this to handle redirection

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useSelector(state => state.auth);
  const [, setLocation] = useLocation(); // Add this for navigation
  
  console.log('Auth state in AuthPage:', user);
  
  // Redirect to dashboard if already logged in
  if (user) {
    setLocation('/');
    return null;
  }
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left column - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to access your health dashboard' 
                : 'Start tracking your health and wellness journey'}
            </p>
          </div>
          
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
      
      {/* Right column - Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-12 flex-col justify-center">
        <h2 className="text-4xl font-bold mb-6">
          Take control of your health journey
        </h2>
        <p className="text-xl mb-8">
          Track, analyze, and improve your health with our comprehensive health monitoring platform. Connect devices, log workouts, manage medications, and celebrate your achievements.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-start">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Health Monitoring</h3>
              <p>Track vital signs and health metrics in real-time</p>
            </div>
          </div>
          {/* Other feature blocks remain unchanged */}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;