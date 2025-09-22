import { useState } from "react";
import botService from "../../services/botService";

function PhoneVerification({ onVerificationSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value) => {
    // Chỉ giữ lại số
    const phoneNumber = value.replace(/[^\d]/g, "");

    // Định dạng số điện thoại Việt Nam
    if (phoneNumber.length <= 10) {
      return phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return phoneNumber;
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    setError("");
  };

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\s/g, "");
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Xác thực số điện thoại qua API backend
      const cleanPhone = phoneNumber.replace(/\s/g, "");
      const customerData = await botService.verifyPhone(cleanPhone);

      // Gọi callback với dữ liệu đã được xử lý từ backend
      onVerificationSuccess(customerData);
    } catch (error) {
      console.error("Phone verification error:", error);
      // Fallback cho trường hợp lỗi
      const cleanPhone = phoneNumber.replace(/\s/g, "");
      onVerificationSuccess({
        phone: cleanPhone,
        name: "Khách hàng mới",
        isExistingCustomer: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Xác thực số điện thoại
          </h2>
          <p className="text-gray-600">
            Vui lòng nhập số điện thoại để bắt đầu cuộc trò chuyện
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+84</span>
              </div>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`block w-full pl-12 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                  error
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="0xxx xxx xxx"
                maxLength="13"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang kiểm tra...
              </div>
            ) : (
              "Bắt đầu trò chuyện"
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Số điện thoại sẽ được kiểm tra trong hệ thống CRM</li>
                <li>• Thông tin cá nhân được bảo mật tuyệt đối</li>
                <li>• Bot AI sẽ hỗ trợ tư vấn 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneVerification;
