import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import Spinner from './Spinner';
import { useLocation } from 'wouter';

const RegisterForm = ({ onToggleForm }) => {
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('');
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  
  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      setLocation('/'); // Changed from /dashboard to / to match the route in App.js
    }
  }, [user, setLocation]);
  
  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear specific field error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
    
    // Clear submit status when form changes
    if (submitStatus) {
      setSubmitStatus('');
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('Validating form...');
    
    if (validateForm()) {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      console.log('Registering with data:', userData);
      setSubmitStatus('Sending registration request...');
      
      try {
        const resultAction = dispatch(register(userData));
        
        resultAction
          .unwrap()
          .then(user => {
            console.log('Registration successful:', user);
            setSubmitStatus('Registration successful!');
          })
          .catch(err => {
            console.error('Registration error:', err);
            setSubmitStatus('Registration failed: ' + (err.message || 'Unknown error'));
          });
      } catch (err) {
        console.error('Dispatch error:', err);
        setSubmitStatus('Registration error: ' + (err.message || 'Unknown error'));
      }
    } else {
      setSubmitStatus('Please fix the form errors and try again.');
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {submitStatus && (
        <div className={`p-3 rounded-md text-sm ${
          submitStatus.includes('successful') 
            ? 'bg-green-50 text-green-600' 
            : submitStatus.includes('failed') || submitStatus.includes('error')
              ? 'bg-red-50 text-red-500'
              : 'bg-blue-50 text-blue-500'
        }`}>
          {submitStatus}
        </div>
      )}
      
      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="First name"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Last name"
          />
        </div>
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="your.email@example.com"
          />
        </div>
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
        )}
      </div>
      
      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Choose a username"
          />
        </div>
      </div>
      
      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className={`block w-full pl-10 pr-10 py-2 border ${formErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Create a password"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
        )}
      </div>
      
      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2 border ${formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Confirm your password"
          />
        </div>
        {formErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
        )}
      </div>
      
      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : (
            <>
              Create Account
              <UserPlus className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
      
      {/* Toggle to login form */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in instead
          </button>
        </p>
      </div>
      
      {/* Debug section (optional, remove in production) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">Debug Info</summary>
            <div className="mt-2">
              <p>Auth State: {user ? 'Logged In' : 'Not Logged In'}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Submit Status: {submitStatus || 'None'}</p>
            </div>
          </details>
        </div>
      )}
    </form>
  );
};

export default RegisterForm;