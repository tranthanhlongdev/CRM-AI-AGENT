import { useState } from "react";
import PhoneVerification from "./PhoneVerification";
import ChatInterface from "./ChatInterface";

function BotChat() {
  const [isVerified, setIsVerified] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);

  const handleVerificationSuccess = (customerData) => {
    setCustomerInfo(customerData);
    setIsVerified(true);
  };

  const handleBackToVerification = () => {
    setIsVerified(false);
    setCustomerInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                HDBank AI Assistant
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Tư vấn và hỗ trợ khách hàng 24/7
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {!isVerified ? (
              <PhoneVerification
                onVerificationSuccess={handleVerificationSuccess}
              />
            ) : (
              <ChatInterface
                customerInfo={customerInfo}
                onBack={handleBackToVerification}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotChat;
