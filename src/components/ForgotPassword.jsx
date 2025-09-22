import { useState } from "react";
import authService from "../services/authService";

function ForgotPassword({ onBack }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: request, 2: reset

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!usernameOrEmail) {
      setError("Vui lòng nhập username hoặc email");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(usernameOrEmail);
      const data = res?.data || {};
      setResetToken(data.resetToken || "");
      setSuccess(
        "Đã tạo mã đặt lại mật khẩu (demo: token hiển thị phía dưới). Vui lòng chuyển sang bước 2."
      );
      setStep(2);
    } catch (e) {
      // Theo yêu cầu, vẫn trả success khi user không tồn tại, nên UI giữ thông điệp chung
      setSuccess(
        "Nếu tài khoản tồn tại, hệ thống đã gửi mã đặt lại mật khẩu. Vui lòng kiểm tra."
      );
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!resetToken || !newPassword) {
      setError("Vui lòng nhập đầy đủ Token và mật khẩu mới");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải tối thiểu 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setSuccess("Đặt lại mật khẩu thành công. Bạn có thể quay về đăng nhập.");
    } catch (e) {
      setError(e?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-semibold">Quên / Đặt lại mật khẩu</h2>
          <p className="text-sm text-blue-100 mt-1">
            Bảo mật theo chuẩn ngân hàng
          </p>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username hoặc Email
                </label>
                <input
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username hoặc email"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  {success}
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Về đăng nhập
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Bước 1: Yêu cầu token"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token đặt lại mật khẩu
                </label>
                <input
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dán token tại đây"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Demo: token có thể hiển thị từ bước 1
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  {success}
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Quay lại bước 1
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Đang đặt lại..." : "Bước 2: Đặt lại mật khẩu"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
