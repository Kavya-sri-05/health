import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// API request helper
export const apiRequest = async (method, endpoint, data = null) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...(data && { body: JSON.stringify(data) })
  };
  
  try {
    const response = await fetch(`/api${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `Error: ${response.status} ${response.statusText}`;
      
      // Handle unauthorized errors
      if (response.status === 401) {
        // Clear token if expired/invalid
        if (token) {
          localStorage.removeItem('token');
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Return the response for parsing by the caller
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Default fetch function for react-query that handles common API response patterns
export const defaultQueryFn = async ({ queryKey }) => {
  const [endpoint] = queryKey;
  
  // Handle unauthorized errors
  const on401 = (endpoint === '/api/user') ? 'returnNull' : 'throw';
  
  try {
    const response = await apiRequest('GET', endpoint);
    
    // Return the JSON response
    return response.json();
  } catch (error) {
    // Return null for 401 errors on /api/user endpoint
    if (error.message.includes('401') && on401 === 'returnNull') {
      return null;
    }
    
    throw error;
  }
};

// Set the default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: defaultQueryFn,
  },
});

export default queryClient;