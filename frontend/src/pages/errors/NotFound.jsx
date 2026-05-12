import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Update document title for better UX
    document.title = "Page Not Found | 404 Error";
    
    // Optional: Log 404 error for analytics
    console.warn('404 Page Accessed:', window.location.pathname);
  }, []);

  return (
    <main
      role="main"
      aria-labelledby="notfound-title"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12"
    >
      <div className="max-w-2xl w-full text-center">
        {/* Decorative element with animation */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-gradient-to-r from-red-100 to-red-50 rounded-full blur-2xl opacity-60 animate-pulse" />
          </div>
          <div className="relative text-red-500 mb-2">
            <svg
              className="w-32 h-32 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="inline-block px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full mt-4">
            Error 404
          </span>
        </div>

        <h1
          id="notfound-title"
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
        >
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-xl mx-auto">
          We couldn't find the page you're looking for. It might have been moved, deleted, 
          or the URL may be incorrect.
        </p>

        {/* Suggestions for the user */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Here are some suggestions:
          </h2>
          <ul className="text-left grid gap-3 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700">Double-check the URL for typos</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700">Use the navigation menu to find what you need</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <span className="text-gray-700">Contact support if you believe this is an error</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 w-full sm:w-auto"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto shadow-lg shadow-blue-500/20"
            aria-label="Return to homepage"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </button>
        </div>

        {/* Contact support */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-2">
            Still having trouble?
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="text-blue-600 font-medium hover:text-blue-700 underline underline-offset-2 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;