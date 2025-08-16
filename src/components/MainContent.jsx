function MainContent({ activeTab }) {
  if (activeTab !== "purchase") {
    return (
      <div className="p-6 bg-white">
        <p className="text-gray-500">Nội dung tab {activeTab}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white flex-1">
      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-6">Kế bản thấu</h3>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-400"
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
            <span className="text-sm text-gray-600 font-medium">SĐT 1</span>
          </div>
          <div className="text-sm text-gray-900 font-medium">0123456789</div>
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-4 h-4 text-gray-400"
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
            <span className="text-sm text-gray-600 font-medium">
              Phap SĐT 2
            </span>
          </div>
          <div className="text-sm text-gray-900 font-medium">0123456789</div>
        </div>
      </div>

      {/* Email Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-600 font-medium">Email</span>
        </div>
        <div className="flex space-x-3">
          <input
            type="email"
            placeholder="Nhập email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors">
            Gửi Email
          </button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Danh sách hé cư (với campaign)
        </h4>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Campaign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm số
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kích bằn
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-900">
                      HD_ThanhDag_Defise_2203...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">trangtmt</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-900">
                      HD_ThanhDag_Defise_2204...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">trangtmt</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-900">
                      HD_ThanhDag_Defise_2205...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">loanxmt</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-900">
                      HD_ThanhDag_Defise_2206...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">loanxmt</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-900">
                      HD_ThanhDag_Defise_2207...
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">loanxmt</td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline">
                    Tạo đây
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-900 mb-3">
          Mở hộ sư C000883350
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-x-6 gap-y-3 text-xs">
            <div>
              <div className="text-gray-600 font-medium mb-1">TÊN KH:</div>
              <div className="text-gray-900">«sample»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">
                TRẠNG_DETAILS:
              </div>
              <div className="text-gray-900">dd/mm/yyyy</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">«THÔNG TIN»</div>
              <div className="text-gray-900">«thông tin»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">EMAIL:</div>
              <div className="text-gray-900">«email»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">SĐT 1:</div>
              <div className="text-gray-900">xxx.xxx</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">BƯNG_CODE:</div>
              <div className="text-gray-900">«code»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">GA_TIN_DICH:</div>
              <div className="text-gray-900">«không tìm»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">TRANS_DATE:</div>
              <div className="text-gray-900">dd/mm/yyyy</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">GA_TIN_SCF:</div>
              <div className="text-gray-900">«không tìm»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">GA_TIN_SK:</div>
              <div className="text-gray-900">«sách tìm»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">GHI_CHÚ:</div>
              <div className="text-gray-900">«admin»</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium mb-1">LOẠI_TIN:</div>
              <div className="text-gray-900">«sách tìm»</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
