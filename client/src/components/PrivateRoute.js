import React from 'react';
import { Route, useLocation } from 'wouter';
import { useSelector } from 'react-redux';
import Spinner from './Spinner';

const PrivateRoute = ({ component: Component, path }) => {
  const { user, loading } = useSelector(state => state.auth);
  const [, setLocation] = useLocation();
  
  return (
    <Route path={path}>
      {() => {
        // Show loading spinner while checking authentication
        if (loading) {
          return (
            <div className="flex justify-center items-center h-screen">
              <Spinner />
            </div>
          );
        }

        // Redirect to login if not authenticated
        if (!user) {
          setLocation('/auth');
          return null;
        }

        // Render the protected component
        return <Component />;
      }}
    </Route>
  );
};

export default PrivateRoute;