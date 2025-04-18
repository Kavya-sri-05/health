import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { receiveRealtimeMetric } from '../store/slices/healthMetricSlice';
import { SiApple, SiFitbit, SiGarmin, SiSamsung, SiGoogle } from 'react-icons/si';
import { Smartphone, Bluetooth, RefreshCw, Check, X, Heart, Footprints, Flame } from 'lucide-react';
import fitbitService from '../services/fitbitService';

// This would be a real WebSocket connection in production
let socket = null;

const DeviceConnectionManager = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Sample device types with icons and APIs
  const deviceTypes = [
    { 
      id: 'fitbit', 
      name: 'Fitbit', 
      icon: <SiFitbit className="h-5 w-5" />,
      authUrl: fitbitService.getFitbitAuthUrl(),
      metrics: ['heartRate', 'steps', 'caloriesBurned', 'sleep']
    },
    { 
      id: 'applehealth', 
      name: 'Apple Health', 
      icon: <SiApple className="h-5 w-5" />,
      authUrl: 'https://appleid.apple.com/auth/authorize',
      metrics: ['heartRate', 'steps', 'caloriesBurned', 'sleep', 'bloodPressure']
    },
    { 
      id: 'garmin', 
      name: 'Garmin', 
      icon: <SiGarmin className="h-5 w-5" />,
      authUrl: 'https://connect.garmin.com/oauthConfirm',
      metrics: ['heartRate', 'steps', 'caloriesBurned', 'sleep']
    },
    { 
      id: 'samsunghealth', 
      name: 'Samsung Health', 
      icon: <SiSamsung className="h-5 w-5" />,
      authUrl: 'https://samsung.com/oauth/authorize',
      metrics: ['heartRate', 'steps', 'caloriesBurned', 'sleep']
    },
    { 
      id: 'googlefit', 
      name: 'Google Fit', 
      icon: <SiGoogle className="h-5 w-5" />,
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      metrics: ['heartRate', 'steps', 'caloriesBurned', 'distance']
    },
    { 
      id: 'smartphone', 
      name: 'Smartphone Sensors', 
      icon: <Smartphone className="h-5 w-5" />,
      authUrl: null, // Uses browser permissions
      metrics: ['steps', 'activity']
    }
  ];

  // Connect to WebSocket for real-time data
  const connectWebSocket = useCallback(() => {
    if (socket) return; // Already connected
    
    // In production, this would connect to your server's WebSocket endpoint
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/health-metrics-ws?userId=${user?._id}`;
    
    try {
      console.log('Connecting to WebSocket...');
      
      // Create a WebSocket connection
      socket = new WebSocket(wsUrl);
      
      socket.addEventListener('open', () => {
        setSocketConnected(true);
        console.log('WebSocket connected successfully');
        
        // Start fetching data if we have connected devices
        if (connectedDevices.length > 0) {
          startDataFetch();
        }
      });
      
      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        handleIncomingHealthData(data);
      });
      
      socket.addEventListener('close', () => {
        setSocketConnected(false);
        console.log('WebSocket connection closed');
        // Attempt to reconnect
        setTimeout(connectWebSocket, 3000);
      });
      
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setSocketConnected(false);
      });
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [connectedDevices, user]);

  // Disconnect WebSocket when component unmounts
  const disconnectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
      socket = null;
      setSocketConnected(false);
    }

    // Clear any data fetch intervals
    clearDataFetchIntervals();
  }, []);

  // Clear all data fetch intervals
  const clearDataFetchIntervals = () => {
    connectedDevices.forEach(device => {
      if (window[`data-interval-${device.id}`]) {
        clearInterval(window[`data-interval-${device.id}`]);
        window[`data-interval-${device.id}`] = null;
      }
    });
  };

  // Handle incoming health data from WebSocket
  const handleIncomingHealthData = useCallback((data) => {
    if (data && data.type === 'health_metric_update' && data.metric) {
      console.log('Received health data:', data.metric);
      
      // Update Redux store with new health metric
      dispatch(receiveRealtimeMetric(data.metric));
    }
  }, [dispatch]);

  // Start fetching data from connected devices
  const startDataFetch = useCallback(() => {
    // For each connected device, start fetching data
    connectedDevices.forEach(device => {
      const deviceType = deviceTypes.find(type => type.id === device.typeId);
      
      if (deviceType) {
        if (deviceType.id === 'fitbit' && fitbitService.isAuthenticated()) {
          startFitbitDataFetch(device.id);
        } else {
          // For other devices or if Fitbit is not authenticated, simulate data
          simulateDeviceData(device.id, deviceType.metrics);
        }
      }
    });
  }, [connectedDevices, deviceTypes]);

  // Start fetching Fitbit data
  const startFitbitDataFetch = useCallback((deviceId) => {
    // Clear any existing interval
    if (window[`data-interval-${deviceId}`]) {
      clearInterval(window[`data-interval-${deviceId}`]);
    }
    
    // Immediately fetch data
    fetchFitbitData();
    
    // Set interval to fetch data every minute
    window[`data-interval-${deviceId}`] = setInterval(fetchFitbitData, 60000);
    
    // Function to fetch Fitbit data
    async function fetchFitbitData() {
      try {
        // Get heart rate data
        const heartRateData = await fitbitService.getHeartRate();
        if (heartRateData && heartRateData.activities?.heart?.length > 0) {
          const latestHeartRate = heartRateData.activities.heart[0].value;
          
          // Send heart rate data to server via WebSocket
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'health_metric',
              metric: {
                type: 'heartRate',
                value: latestHeartRate,
                deviceId: deviceId,
                timestamp: new Date().toISOString()
              }
            }));
          }
          
          // Update Redux store directly
          dispatch(receiveRealtimeMetric({
            type: 'heartRate',
            value: latestHeartRate,
            date: new Date().toISOString(),
            deviceId: deviceId,
            userId: user._id
          }));
        }
        
        // Get steps data
        const stepsData = await fitbitService.getSteps();
        if (stepsData && stepsData.activities?.steps?.length > 0) {
          const latestSteps = parseInt(stepsData.activities.steps[0].value);
          
          // Send steps data to server via WebSocket
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'health_metric',
              metric: {
                type: 'steps',
                value: latestSteps,
                deviceId: deviceId,
                timestamp: new Date().toISOString()
              }
            }));
          }
          
          // Update Redux store directly
          dispatch(receiveRealtimeMetric({
            type: 'steps',
            value: latestSteps,
            date: new Date().toISOString(),
            deviceId: deviceId,
            userId: user._id
          }));
        }
      } catch (error) {
        console.error('Error fetching Fitbit data:', error);
      }
    }
  }, [dispatch, user]);

  // Simulate device data for testing/development
  const simulateDeviceData = useCallback((deviceId, metricTypes) => {
    // Clear any existing interval
    if (window[`data-interval-${deviceId}`]) {
      clearInterval(window[`data-interval-${deviceId}`]);
    }
    
    // Set interval to send simulated data every 10 seconds
    window[`data-interval-${deviceId}`] = setInterval(() => {
      // Randomly select a metric type
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      
      // Generate random value based on metric type
      let value;
      switch (metricType) {
        case 'heartRate':
          value = Math.floor(60 + Math.random() * 40); // 60-100 bpm
          break;
        case 'steps':
          value = Math.floor(100 + Math.random() * 500); // 100-600 steps
          break;
        case 'caloriesBurned':
          value = Math.floor(5 + Math.random() * 20); // 5-25 calories
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      // Send data to server via WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'health_metric',
          metric: {
            type: metricType,
            value,
            deviceId,
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Update Redux store directly
      dispatch(receiveRealtimeMetric({
        type: metricType,
        value,
        date: new Date().toISOString(),
        deviceId,
        userId: user?._id
      }));
    }, 10000); // Every 10 seconds
  }, [dispatch, user]);

  // Initialize component
  useEffect(() => {
    // Connect to WebSocket when component mounts and user is authenticated
    if (user) {
      connectWebSocket();
    }
    
    // Load connected devices from localStorage
    const savedDevices = localStorage.getItem('connectedDevices');
    if (savedDevices) {
      setConnectedDevices(JSON.parse(savedDevices));
    }
    
    // Check if Fitbit is authenticated
    const isFitbitConnected = fitbitService.isAuthenticated();
    if (isFitbitConnected && !connectedDevices.some(d => d.typeId === 'fitbit')) {
      const fitbitDevice = {
        id: 'fitbit-' + Date.now(),
        name: 'Fitbit Device',
        typeId: 'fitbit',
        connected: true,
        lastSync: new Date().toISOString()
      };
      
      setConnectedDevices(prev => {
        const updated = [...prev, fitbitDevice];
        localStorage.setItem('connectedDevices', JSON.stringify(updated));
        return updated;
      });
    }
    
    // Cleanup when component unmounts
    return () => {
      disconnectWebSocket();
    };
  }, [user, connectWebSocket, disconnectWebSocket]);

  // Start WebSocket and data fetch when devices connect
  useEffect(() => {
    if (connectedDevices.length > 0) {
      // Start WebSocket if not already connected
      if (!socketConnected) {
        connectWebSocket();
      } else {
        // If already connected, start data fetch
        startDataFetch();
      }
    }
  }, [connectedDevices, socketConnected, connectWebSocket, startDataFetch]);

  // Simulate device scanning
  const scanForDevices = () => {
    setIsScanning(true);
    setAvailableDevices([]);
    
    // Simulate finding devices after a delay
    setTimeout(() => {
      const mockDevices = [
        {
          id: 'fitbit-' + Date.now(),
          name: 'Fitbit Charge 5',
          typeId: 'fitbit',
          connected: false
        },
        {
          id: 'garmin-' + Date.now(),
          name: 'Garmin Forerunner',
          typeId: 'garmin',
          connected: false
        },
        {
          id: 'smartphone-' + Date.now(),
          name: 'Your Smartphone',
          typeId: 'smartphone',
          connected: false
        }
      ];
      
      setAvailableDevices(mockDevices);
      setIsScanning(false);
    }, 2000);
  };

  // Connect to a device
  const connectToDevice = (device) => {
    // If device requires authentication, redirect to auth URL
    const deviceType = deviceTypes.find(type => type.id === device.typeId);
    
    if (deviceType && deviceType.authUrl) {
      // For Fitbit and other OAuth services, redirect to auth page
      if (device.typeId === 'fitbit') {
        window.location.href = deviceType.authUrl;
        return;
      }
      
      // For other services, redirect to their auth URLs
      window.open(deviceType.authUrl, '_blank');
      return;
    }
    
    // For devices that don't need external auth (like smartphone)
    const updatedDevice = {
      ...device,
      connected: true,
      lastSync: new Date().toISOString()
    };
    
    // Add to connected devices
    setConnectedDevices(prev => {
      const updated = [...prev, updatedDevice];
      localStorage.setItem('connectedDevices', JSON.stringify(updated));
      return updated;
    });
    
    // Remove from available devices
    setAvailableDevices(prev => prev.filter(d => d.id !== device.id));
  };

  // Disconnect a device
  const disconnectDevice = (deviceId) => {
    // Clear any data fetch interval
    if (window[`data-interval-${deviceId}`]) {
      clearInterval(window[`data-interval-${deviceId}`]);
      window[`data-interval-${deviceId}`] = null;
    }
    
    // Get device details before removing
    const device = connectedDevices.find(d => d.id === deviceId);
    
    // Remove from connected devices
    setConnectedDevices(prev => {
      const updated = prev.filter(d => d.id !== deviceId);
      localStorage.setItem('connectedDevices', JSON.stringify(updated));
      return updated;
    });
    
    // If it's a Fitbit device, disconnect from Fitbit API
    if (device && device.typeId === 'fitbit') {
      fitbitService.disconnect();
    }
  };

  // Get device type icon
  const getDeviceIcon = (typeId) => {
    const deviceType = deviceTypes.find(type => type.id === typeId);
    return deviceType ? deviceType.icon : <Bluetooth className="h-5 w-5" />;
  };

  // Get metric icon
  const getMetricIcon = (type) => {
    switch (type) {
      case 'heartRate':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'steps':
        return <Footprints className="h-4 w-4 text-blue-500" />;
      case 'caloriesBurned':
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Connected Devices</h2>
        <div className="flex space-x-2">
          <button 
            onClick={scanForDevices}
            disabled={isScanning}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
              isScanning 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4 mr-1.5" />
                Scan
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Connected devices list */}
      {connectedDevices.length > 0 ? (
        <div className="space-y-3 mb-4">
          {connectedDevices.map(device => (
            <div key={device.id} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-full mr-3">
                  {getDeviceIcon(device.typeId)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{device.name}</h3>
                  <div className="flex items-center text-xs text-green-600">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    Connected
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => disconnectDevice(device.id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Disconnect device"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-md p-4 text-center mb-4">
          <p className="text-gray-500">No devices connected</p>
          <p className="text-sm text-gray-400 mt-1">Click "Scan" to find available devices</p>
        </div>
      )}
      
      {/* Available devices */}
      {availableDevices.length > 0 && (
        <>
          <h3 className="font-medium text-gray-700 mb-2">Available Devices</h3>
          <div className="space-y-2">
            {availableDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-full mr-3">
                    {getDeviceIcon(device.typeId)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{device.name}</h3>
                    <div className="text-xs text-gray-500">
                      {deviceTypes.find(t => t.id === device.typeId)?.name || 'Unknown device'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => connectToDevice(device)}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* WebSocket status */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center text-sm">
          <div className={`h-2 w-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">
            {socketConnected ? 'Real-time data connected' : 'Real-time data disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceConnectionManager;