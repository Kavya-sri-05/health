import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './hooks/use-toast';
import { AuthProvider } from './hooks/use-auth';

// Components
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import WebSocketHandler from './components/WebSocketHandler';

// Pages
import Dashboard from './pages/Dashboard';
import Health from './pages/Health';
import WorkoutsPage from './pages/WorkoutsPage';
import MedicationsPage from './pages/MedicationsPage';
import AchievementsPage from './pages/AchievementsPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FitbitCallback from './pages/FitbitCallback';

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="pt-16">
                <AppRoutes />
              </div>
              <WebSocketHandler />
            </div>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const AppRoutes = () => {
  return (
    <Switch>
      <PrivateRoute path="/" component={Dashboard} />
      <Route path="/dashboard">
        {() => {
          window.location.href = '/'; // Redirect to home page
          return null;
        }}
      </Route>
      <PrivateRoute path="/health" component={Health} />
      <PrivateRoute path="/workouts" component={WorkoutsPage} />
      <PrivateRoute path="/medications" component={MedicationsPage} />
      <PrivateRoute path="/achievements" component={AchievementsPage} />
      <PrivateRoute path="/profile" component={ProfilePage} />
      <PrivateRoute path="/settings" component={SettingsPage} />
      <PrivateRoute path="/fitbit/callback" component={FitbitCallback} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
};

export default App;