import React, { useState, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

// Create toast context
const ToastContext = createContext();

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Add new toast
  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto dismiss toast after delay
    if (toast.duration !== Infinity) {
      const duration = toast.duration || 5000;
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  // Dismiss toast by id
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const value = {
    toasts,
    toast: addToast,
    dismissToast
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast component
const Toast = ({ toast, onDismiss }) => {
  const { title, description, variant = 'default' } = toast;
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    destructive: 'bg-red-50 border-red-200 text-red-700'
  };
  
  return (
    <div
      className={`flex items-start p-4 rounded-lg shadow-md border ${variantStyles[variant]} max-w-sm w-full animate-fade-in-up`}
      role="alert"
    >
      <div className="flex-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <div className="text-sm mt-1 text-gray-600">{description}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast container component
const ToastContainer = () => {
  const { toasts, dismissToast } = useContext(ToastContext);
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-h-screen overflow-hidden pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default useToast;