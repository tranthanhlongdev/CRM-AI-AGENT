import { useState } from "react";
import authService from "../services/authService";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";

function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Vui lòng nhập username và password");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      const data = res?.data || {};
      const user = data.user || res?.user || {};
      const accessToken = data?.tokens?.accessToken || res?.accessToken || "";
      const refreshToken =
        data?.tokens?.refreshToken || res?.refreshToken || "";

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("accessToken", String(accessToken));
      storage.setItem("refreshToken", String(refreshToken));
      storage.setItem("currentUser", JSON.stringify(user));
      onSuccess?.(user);
    } catch (e) {
      setError(e?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Loại bỏ đường tắt tạo user từ login: vẫn giữ Register import nhưng không render

  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center p-0 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Left branding / hero */}
        <div className="relative hidden lg:flex items-stretch bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-500">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 10%, rgba(255,255,255,.4) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.25) 0, transparent 40%), radial-gradient(circle at 40% 80%, rgba(255,255,255,.2) 0, transparent 45%)",
            }}
          />
          <div className="relative z-10 p-10 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white tracking-wide">
                    CRM Banking Suite
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Secure • Compliant • Enterprise-grade
                  </p>
                </div>
              </div>
              <div className="mt-10 space-y-6 text-blue-50">
                <div className="flex items-start space-x-3">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium">Xác thực mạnh mẽ</p>
                    <p className="text-sm text-blue-100">
                      Bảo vệ bằng chuẩn token hiện đại
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-0.5 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium">Trải nghiệm cấp ngân hàng</p>
                    <p className="text-sm text-blue-100">
                      Thiết kế tinh gọn, hiệu quả, đáng tin cậy
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-blue-100 text-xs">
              © {new Date().getFullYear()} Banking CRM
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Đăng nhập
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sử dụng tài khoản được cấp để truy cập hệ thống
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="demo"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 11c1.657 0 3 1.343 3 3v2H9v-2c0-1.657 1.343-3 3-3zm0-6a4 4 0 00-4 4v2h8V9a4 4 0 00-4-4z"
                      />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.02.153-2.003.437-2.927M6.293 6.293A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-1.293 4.707M15 12a3 3 0 00-3-3m0 0a2.996 2.996 0 012.121.879M9 9l6 6"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="inline-flex items-center text-sm text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 flex items-center justify-center"
              >
                {loading && (
                  <svg
                    className="animate-spin h-4 w-4 text-white mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                )}
                Đăng nhập
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="px-3 text-xs text-gray-400">hoặc</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>
              <div className="mt-4 text-center">
                {/* Đã bỏ tạo user từ login */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
