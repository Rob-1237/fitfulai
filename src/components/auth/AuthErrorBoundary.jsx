import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faArrowsRotate, faRocket } from '@fortawesome/pro-duotone-svg-icons';

class AuthErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isDark: localStorage.getItem('theme') === 'dark'
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Check if this looks like an auth-related error
    const isAuthError = this.isAuthRelatedError(error);
    
    if (isAuthError) {
      console.warn('Detected auth-related error, preparing for potential reset...');
    }

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo, isAuthError);
  }

  isAuthRelatedError = (error) => {
    const authErrorPatterns = [
      'session',
      'token',
      'auth',
      'profile',
      'supabase',
      'unauthorized',
      'expired',
      'invalid_jwt'
    ];

    const errorString = (error?.message || error?.toString() || '').toLowerCase();
    return authErrorPatterns.some(pattern => errorString.includes(pattern));
  };

  logErrorDetails = (error, errorInfo, isAuthError) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      },
      errorInfo: errorInfo?.componentStack,
      isAuthError,
      localStorage: this.getRelevantLocalStorage(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.group('🚨 Error Boundary Report');
    console.error('Full Error Report:', errorReport);
    console.groupEnd();
  };

  getRelevantLocalStorage = () => {
    const relevantKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key === 'theme') {
        try {
          const value = localStorage.getItem(key);
          // Don't log actual tokens, just indicate they exist
          relevantKeys[key] = key.includes('token') ? '[TOKEN_EXISTS]' : value;
        } catch (e) {
          relevantKeys[key] = '[ERROR_READING]';
        }
      }
    });
    return relevantKeys;
  };

  handleResetAuth = () => {
    try {
      // Import and call the reset function
      import('../../stores/useProfileStore.js').then((module) => {
        const { useProfileStore } = module;
        useProfileStore.getState().resetAuthState();
      });
    } catch (error) {
      console.error('Error importing profile store:', error);
      // Fallback: manual reset
      this.fallbackReset();
    }
  };

  fallbackReset = () => {
    // Manual cleanup as fallback
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { isDark } = this.state;
      const isAuthError = this.state.error ? this.isAuthRelatedError(this.state.error) : false;

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`max-w-md w-full ${
              isDark ? 'bg-[var(--color-dk-gray)]' : 'bg-[var(--color-lt-gray)]'
            } rounded-xl shadow-2xl p-8 text-center`}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="mb-6"
            >
              <FontAwesomeIcon 
                icon={faTriangleExclamation} 
                className={`text-6xl ${
                  isAuthError ? 'text-[var(--color-orange)]' : 'text-[var(--color-yellow)]'
                }`} 
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-4 ${
                isDark ? 'text-[var(--color-white)]' : 'text-[var(--color-dk-gray)]'
              }`}
            >
              {isAuthError ? 'Authentication Error' : 'Something went wrong'}
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-base mb-8 leading-relaxed ${
                isDark ? 'text-[var(--color-md-gray)]' : 'text-[var(--color-dk-gray)]'
              }`}
            >
              {isAuthError 
                ? 'There was a problem with your authentication. This usually happens when session data becomes corrupted.'
                : 'An unexpected error occurred while loading the app.'
              }
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {isAuthError && (
                <motion.button
                  className="w-full bg-[var(--color-orange)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center gap-3"
                  onClick={this.handleResetAuth}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FontAwesomeIcon icon={faRocket} />
                  Reset Authentication
                </motion.button>
              )}

              <motion.button
                className={`w-full ${
                  isDark ? 'bg-[var(--color-md-gray)] hover:bg-[var(--color-lt-gray)]' : 'bg-[var(--color-dk-gray)] hover:bg-[var(--color-md-gray)]'
                } text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-3`}
                onClick={this.handleReload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FontAwesomeIcon icon={faArrowsRotate} />
                Reload Page
              </motion.button>

              <motion.button
                className={`w-full border-2 ${
                  isDark 
                    ? 'border-[var(--color-md-gray)] text-[var(--color-md-gray)] hover:bg-[var(--color-md-gray)] hover:text-white' 
                    : 'border-[var(--color-dk-gray)] text-[var(--color-dk-gray)] hover:bg-[var(--color-dk-gray)] hover:text-white'
                } py-3 px-6 rounded-lg font-semibold transition-colors duration-200`}
                onClick={this.handleRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
            </motion.div>

            {/* Debug Info (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-left"
              >
                <summary className={`cursor-pointer text-sm ${
                  isDark ? 'text-[var(--color-md-gray)]' : 'text-[var(--color-md-gray)]'
                } hover:text-[var(--color-orange)] transition-colors`}>
                  Debug Info
                </summary>
                <div className={`mt-3 p-3 ${
                  isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'
                } rounded text-xs font-mono overflow-auto max-h-32`}>
                  <div className="text-red-600 mb-2">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <div className={isDark ? 'text-[var(--color-md-gray)]' : 'text-[var(--color-dk-gray)]'}>
                    <strong>Type:</strong> {isAuthError ? 'Authentication' : 'Application'}
                  </div>
                </div>
              </motion.details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;