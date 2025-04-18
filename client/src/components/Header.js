import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  Home, Heart, Dumbbell, Utensils, Pill, Award, Settings, User, LogOut, Menu, X 
} from 'lucide-react';

const Header = () => {
  const dispatch = useDispatch();
  const [location, setLocation] = useLocation();
  const { user } = useSelector(state => state.auth); // Just use user directly
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Health', path: '/health', icon: <Heart className="h-5 w-5" /> },
    { name: 'Workouts', path: '/workouts', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'Nutrition', path: '/nutrition', icon: <Utensils className="h-5 w-5" /> },
    { name: 'Medications', path: '/medications', icon: <Pill className="h-5 w-5" /> },
    { name: 'Achievements', path: '/achievements', icon: <Award className="h-5 w-5" /> },
  ];

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setLocation('/auth');
    setIsMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-white/90 backdrop-blur-md py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-blue-600 text-xl font-bold flex items-center">
            <Heart className="h-6 w-6 mr-1.5 fill-blue-600" />
            HealthTracker
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? ( // Use user directly instead of isAuthenticated
              <>
                {/* Main nav links */}
                {navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    href={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition hover:bg-blue-50 hover:text-blue-600 flex items-center ${
                      location === link.path 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}

                {/* User menu */}
                <div className="ml-3 relative border-l border-gray-200 pl-3">
                  <Link 
                    href="/profile"
                    className={`p-1.5 rounded-md text-sm font-medium transition hover:bg-blue-50 hover:text-blue-600 flex items-center ${
                      location === '/profile' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600'
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </Link>
                </div>

                {/* Settings */}
                <Link 
                  href="/settings"
                  className={`p-1.5 rounded-md text-sm font-medium transition hover:bg-blue-50 hover:text-blue-600 flex items-center ${
                    location === '/settings' 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-md text-sm font-medium transition hover:bg-red-50 hover:text-red-600 text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth"
                  className="px-4 py-2 rounded-md text-sm font-medium transition bg-blue-500 text-white hover:bg-blue-600"
                >
                  Login / Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 border-t border-gray-200 mt-2">
            {user ? ( // Use user directly instead of isAuthenticated
              <>
                {/* User info */}
                <div className="px-4 py-2 mb-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">
                        {user?.firstName
                          ? `${user.firstName} ${user.lastName || ''}`
                          : user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation links */}
                <div className="space-y-1">
                  {navLinks.map(link => (
                    <Link 
                      key={link.path} 
                      href={link.path}
                      className={`block px-4 py-2 rounded-md text-base font-medium flex items-center ${
                        location === link.path 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}

                  {/* Profile link */}
                  <Link 
                    href="/profile"
                    className={`block px-4 py-2 rounded-md text-base font-medium flex items-center ${
                      location === '/profile' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>

                  {/* Settings link */}
                  <Link 
                    href="/settings"
                    className={`block px-4 py-2 rounded-md text-base font-medium flex items-center ${
                      location === '/settings' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 rounded-md text-base font-medium flex items-center text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-2">
                <Link 
                  href="/auth"
                  className="w-full block text-center px-4 py-2 rounded-md text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;