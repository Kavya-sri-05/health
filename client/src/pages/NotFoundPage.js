import React from 'react';
import { Link } from 'wouter';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-500">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link href="/">
          <a className="inline-flex items-center px-6 py-3 mt-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </a>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;