import { useState, useEffect } from 'react';

const Notification = ({ 
  show = false, 
  type = 'success', 
  title = '', 
  message = '', 
  onClose = () => {},
  autoClose = true,
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoClose, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-700',
          iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-700',
          iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-4 px-4 z-50 pointer-events-none">
      <div className="w-full max-w-sm pointer-events-auto">
        <div
          className={`
            rounded-lg p-4 shadow-lg border transition-all duration-300 ease-in-out transform
            ${styles.container}
            ${isAnimating 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-2 opacity-0 scale-95'
            }
          `}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className={`h-6 w-6 ${styles.icon}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={styles.iconPath}
                />
              </svg>
            </div>
            
            <div className="ml-3 w-0 flex-1">
              {title && (
                <p className={`text-sm font-medium ${styles.title}`}>
                  {title}
                </p>
              )}
              {message && (
                <p className={`text-sm ${styles.message} ${title ? 'mt-1' : ''}`}>
                  {message}
                </p>
              )}
            </div>

            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className={`
                  bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  transition-colors duration-200
                `}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar for auto-close */}
          {autoClose && isAnimating && (
            <div className="mt-3 bg-white bg-opacity-30 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full bg-current opacity-60 rounded-full ${styles.icon}`}
                style={{
                  width: '100%',
                  transition: `width ${duration}ms linear`,
                  animation: `shrink-width ${duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
