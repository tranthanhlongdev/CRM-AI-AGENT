import { useState, useEffect } from "react";
import SoftphoneLogin from "./SoftphoneLogin";
import SoftphonePage from "./SoftphonePage";
import ErrorBoundary from "../ErrorBoundary";

const SoftphoneApp = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = localStorage.getItem("softphone_session");
    if (existingSession) {
      try {
        const sessionData = JSON.parse(existingSession);
        // Check if session is still valid (less than 8 hours old)
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 8) {
          setSession(sessionData);
        } else {
          localStorage.removeItem("softphone_session");
        }
      } catch (error) {
        localStorage.removeItem("softphone_session");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (sessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    localStorage.removeItem("softphone_session");
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading Softphone...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!session ? (
        <SoftphoneLogin onLogin={handleLogin} />
      ) : (
        <SoftphonePage session={session} onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
};

export default SoftphoneApp;
