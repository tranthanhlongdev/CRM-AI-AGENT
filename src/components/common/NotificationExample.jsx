import { useState } from 'react';
import Notification from './Notification.jsx';
import useNotification from '../../hooks/useNotification.js';

const NotificationExample = () => {
  const { notification, showSuccess, showError, showWarning, showInfo, hideNotification } = useNotification();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification System Demo</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => showSuccess(
            "Thành công! ✅", 
            "Thao tác đã được thực hiện thành công.",
            { duration: 3000 }
          )}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Success Notification
        </button>

        <button
          onClick={() => showError(
            "Lỗi xảy ra! ❌", 
            "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại."
          )}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Error Notification
        </button>

        <button
          onClick={() => showWarning(
            "Cảnh báo! ⚠️", 
            "Bạn nên kiểm tra lại thông tin trước khi tiếp tục.",
            { duration: 4000 }
          )}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Warning Notification
        </button>

        <button
          onClick={() => showInfo(
            "Thông tin 💡", 
            "Đây là một thông báo thông tin quan trọng.",
            { duration: 5000 }
          )}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Info Notification
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Features:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>4 types: Success, Error, Warning, Info với màu sắc và icon riêng</li>
          <li>Auto-close với progress bar (có thể tắt cho Error)</li>
          <li>Manual close với nút X</li>
          <li>Smooth animations (slide in/out)</li>
          <li>Responsive design</li>
          <li>Custom duration</li>
          <li>Fixed position (top-center)</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Usage Example:</h4>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`// Import hook
import useNotification from '../../hooks/useNotification.js';
import Notification from '../common/Notification.jsx';

// In your component
const { notification, showSuccess, showError, hideNotification } = useNotification();

// Show notifications
showSuccess("Khóa thẻ thành công! 🔒", "Thẻ đã được khóa an toàn.");
showError("Lỗi hệ thống! ⚠️", "Không thể kết nối với server.");

// Add to JSX
<Notification
  show={notification.show}
  type={notification.type}
  title={notification.title}
  message={notification.message}
  onClose={hideNotification}
  autoClose={notification.autoClose}
  duration={notification.duration}
/>`}
        </pre>
      </div>

      {/* Notification Component */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoClose={notification.autoClose}
        duration={notification.duration}
      />
    </div>
  );
};

export default NotificationExample;
