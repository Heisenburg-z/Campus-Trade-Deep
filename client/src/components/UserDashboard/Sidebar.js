import React from 'react';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaPlus, 
  FaExchangeAlt, 
  FaComments, 
  FaRegBell,
  FaUser,
  FaSignOutAlt,
  FaHome,
  FaCog,
  FaQuestionCircle
} from 'react-icons/fa';

const Sidebar = ({ user, activeTab, setActiveTab, navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('campusTradeToken');
    navigate('/');
  };

const tabs = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <img src="/icons/dashboard.png" alt="Dashboard" className="w-10 h-10" />
  },
  { 
    id: 'buy', 
    label: 'Buy', 
    icon: <img src="/icons/buy.png" alt="Buy" className="w-10 h-10" />
  },
  { 
    id: 'sell', 
    label: 'Sell', 
    icon: <img src="/icons/sell.png" alt="Sell" className="w-10 h-10" />
  },
  { 
    id: 'trades', 
    label: 'Trades', 
    icon: <img src="/icons/trade.png" alt="Trades" className="w-10 h-10" />
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    icon: <img src="/icons/messages.png" alt="Messages" className="w-10 h-10" />
  },
];

const secondaryTabs = [
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <img src="/icons/settings.png" alt="Settings" className="w-10 h-10" />
  },
  { 
    id: 'help', 
    label: 'Help Center', 
    icon: <img src="/icons/help.png" alt="Help" className="w-10 h-10" />
  },
];

  return (
    <div className="flex flex-col h-50 w-64 bg-[#0B2A4A] text-white shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#1B8ED1]/20">
        <div className="flex items-center space-x-3">
          <div className="w-25 h-15 rounded-lg bg-gradient-to-br from-[#1B8ED1] to-[#8EC6EA] flex items-center justify-center">
                              <img 
        src={`/images/trans.png`}
        alt="CampusTrade Logo"
        className="w-25 h-15"
      />
          </div>
          <div>
            <h1 className="text-xl font-bold">CampusTrade</h1>
            <p className="text-xs text-[#8EC6EA]/70">Student Marketplace</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-[#1B8ED1]/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B8ED1] to-[#8EC6EA] flex items-center justify-center text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#ec463d] rounded-full border-2 border-[#0B2A4A]"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{user?.username || 'User'}</h3>
            <p className="text-xs text-[#8EC6EA]/70 truncate">{user?.email || 'user@campus.edu'}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4 space-y-9">
        <p className="text-xs uppercase text-[#8EC6EA]/50 font-semibold px-3 py-2">Main Menu</p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-[#1B8ED1] text-white shadow-md' 
                : 'text-[#EAF4FB] hover:bg-[#1B8ED1]/20 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="p-4 space-y-1 border-t border-[#1B8ED1]/20">
        <p className="text-xs uppercase text-[#8EC6EA]/50 font-semibold px-3 py-2">Support</p>
        {secondaryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-[#1B8ED1] text-white shadow-md' 
                : 'text-[#EAF4FB] hover:bg-[#1B8ED1]/20 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-[#1B8ED1]/20">
        {/* Notifications */}
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#1B8ED1]/10 hover:bg-[#1B8ED1]/20 transition-colors mb-3">
          <div className="flex items-center space-x-3">
            <FaRegBell className="w-5 h-5 text-[#8EC6EA]" />
            <span className="font-medium text-[#EAF4FB]">Notifications</span>
          </div>
          <span className="bg-[#ec463d] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#ec463d]/10 hover:bg-[#ec463d]/20 text-[#ec463d] transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;