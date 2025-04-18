import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { receiveRealtimeMetric } from '../store/slices/healthMetricSlice';
import { receiveAchievementNotification } from '../store/slices/achievementSlice';

const WebSocketHandler = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const wsRef = useRef(null);
  
  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) return;
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user._id}`;
    
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        wsRef.current.close();
      };
    };
    
    connectWebSocket();
    
    // Cleanup function to close WebSocket when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, dispatch]);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'health_metric_update':
        // Dispatch action to update health metric in Redux store
        if (data.metric) {
          dispatch(receiveRealtimeMetric(data.metric));
        }
        break;
      
      case 'achievement_earned':
        // Dispatch action to show achievement notification
        if (data.achievement) {
          dispatch(receiveAchievementNotification(data.achievement));
        }
        break;
      
      case 'notification':
        // Handle other notifications
        console.log('Received notification:', data.message);
        break;
      
      default:
        console.log('Received unknown message type:', data);
    }
  };
  
  // This is a utility component that doesn't render anything visible
  return null;
};

export default WebSocketHandler;