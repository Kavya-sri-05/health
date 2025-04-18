import React, { useState } from 'react';
import { Settings, Bell, Shield, Smartphone, Moon, Sun, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true,
    achievements: true
  });
  
  const [privacy, setPrivacy] = useState({
    shareData: false,
    analytics: true
  });
  
  const [appearance, setAppearance] = useState('light');
  
  // Handle notification settings change
  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    });
  };
  
  // Handle privacy settings change
  const handlePrivacyChange = (e) => {
    setPrivacy({
      ...privacy,
      [e.target.name]: e.target.checked
    });
  };
  
  // Handle appearance change
  const handleAppearanceChange = (value) => {
    setAppearance(value);
  };
  
  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </h1>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-blue-500" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="email"
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="push"
                    checked={notifications.push}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Medication Reminders</h3>
                  <p className="text-sm text-gray-500">Get reminded about your medications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="reminders"
                    checked={notifications.reminders}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Achievement Alerts</h3>
                  <p className="text-sm text-gray-500">Be notified when you earn a badge</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="achievements"
                    checked={notifications.achievements}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Privacy */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Privacy
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Share Health Data</h3>
                  <p className="text-sm text-gray-500">Allow sharing with your healthcare provider</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="shareData"
                    checked={privacy.shareData}
                    onChange={handlePrivacyChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-700">Anonymous Analytics</h3>
                  <p className="text-sm text-gray-500">Help us improve with anonymous data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="analytics"
                    checked={privacy.analytics}
                    onChange={handlePrivacyChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Device Connections */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
              Device Connections
            </h2>
            
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">
                Manage your connected devices in the Device section.
              </p>
              <a 
                href="/"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-block"
              >
                Go to Device Manager
              </a>
            </div>
          </div>
          
          {/* Appearance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <Moon className="w-5 h-5 mr-2 text-blue-500" />
              Appearance
            </h2>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleAppearanceChange('light')}
                className={`flex flex-col items-center p-4 rounded-lg ${appearance === 'light' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-gray-200'}`}
              >
                <Sun className={`h-8 w-8 mb-2 ${appearance === 'light' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={appearance === 'light' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  Light
                </span>
              </button>
              
              <button
                onClick={() => handleAppearanceChange('dark')}
                className={`flex flex-col items-center p-4 rounded-lg ${appearance === 'dark' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-gray-200'}`}
              >
                <Moon className={`h-8 w-8 mb-2 ${appearance === 'dark' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={appearance === 'dark' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  Dark
                </span>
              </button>
              
              <button
                onClick={() => handleAppearanceChange('system')}
                className={`flex flex-col items-center p-4 rounded-lg ${appearance === 'system' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-gray-200'}`}
              >
                <DevicesIcon className={`h-8 w-8 mb-2 ${appearance === 'system' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={appearance === 'system' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  System
                </span>
              </button>
            </div>
          </div>
          
          {/* Logout */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-800 flex items-center mb-4">
              <LogOut className="w-5 h-5 mr-2 text-red-500" />
              Account
            </h2>
            
            <div className="text-center py-2">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing icons
const DevicesIcon = ({ className }) => (
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
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
    />
  </svg>
);

export default SettingsPage;