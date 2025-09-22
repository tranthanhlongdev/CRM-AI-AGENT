function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'info', label: 'Thông tin chung' },
    { id: 'purchase', label: 'Gửi y bán' },
    { id: 'service', label: 'Sản phẩm dịch vụ' }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
