import { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser, logout } from '../store/slices/authSlice';
import { useToast } from './use-toast';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const auth = useSelector(state => state.auth);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  // Check for token on mount and validate it
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      dispatch(getUser())
        .unwrap()
        .catch(error => {
          console.error('Auth token validation failed:', error);
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          });
          
          // Clear invalid token
          dispatch(logout());
        })
        .finally(() => {
          setTokenChecked(true);
        });
    } else {
      setTokenChecked(true);
    }
  }, [dispatch, toast]);
  
  const value = {
    ...auth,
    tokenChecked
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;