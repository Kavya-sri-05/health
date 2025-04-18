import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import fitbitService from '../services/fitbitService';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

const FitbitCallback = () => {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Extract authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      setStatus('error');
      setError('No authorization code found in URL');
      return;
    }
    
    // Exchange code for token
    const exchangeCode = async () => {
      try {
        await fitbitService.exchangeCodeForToken(code);
        setStatus('success');
        
        // Redirect back to dashboard after 3 seconds
        setTimeout(() => {
          setLocation('/');
          
          // Also try to close this window if it was opened as a popup
          if (window.opener) {
            window.close();
          }
        }, 3000);
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        setStatus('error');
        setError(error.message || 'Error connecting to Fitbit');
      }
    };
    
    exchangeCode();
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Fitbit Connection
        </h1>
        
        {status === 'processing' && (
          <>
            <div className="my-6">
              <Spinner />
            </div>
            <p className="text-gray-600">
              Connecting your Fitbit account...
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="my-6 text-green-500">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">
              Your Fitbit account has been successfully connected!
            </p>
            <p className="text-gray-500 text-sm">
              You will be redirected to the dashboard in a few seconds...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="my-6 text-red-500">
              <XCircle className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">
              There was an error connecting your Fitbit account.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4">
                {error}
              </p>
            )}
            <button 
              onClick={() => setLocation('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FitbitCallback;