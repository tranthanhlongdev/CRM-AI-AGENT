import { useState } from "react";
import UserAdmin from "./admin/UserAdmin.jsx";
import ProductAdmin from "./admin/ProductAdmin.jsx";

function SystemManagement() {
  const [activeTab, setActiveTab] = useState("users"); // users | products

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý hệ thống
            </h1>
            <p className="text-sm text-gray-500">
              Quản trị người dùng, sản phẩm dịch vụ theo chuẩn ngân hàng
            </p>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              Quản lý User
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 border-b-2 text-sm font-medium transition-colors ${
                activeTab === "products"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              Sản phẩm dịch vụ
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {activeTab === "users" ? <UserAdmin /> : <ProductAdmin />}
      </div>
    </div>
  );
}

export default SystemManagement;
