import React from 'react';
import { FaChartLine, FaShoppingCart, FaPlus, FaExchangeAlt, FaComments, FaRegBell } from 'react-icons/fa';

const Navbar = ({ user, activeTab, setActiveTab, navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('campusTradeToken');
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine className="mr-2" /> },
    { id: 'buy', label: 'Buy', icon: <FaShoppingCart className="mr-2" /> },
    { id: 'sell', label: 'Sell', icon: <FaPlus className="mr-2" /> },
    { id: 'trades', label: 'Trades', icon: <FaExchangeAlt className="mr-2" /> },
    { id: 'messages', label: 'Messages', icon: <FaComments className="mr-2" /> },
  ];

  return (
    <nav className="bg-white shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-8 animate-bounce"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CampusTrade
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-indigo-600 relative">
                <FaRegBell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="relative group">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user.username}</span>
                </div>
                
                <div className="absolute right-0 hidden group-hover:block bg-white shadow-xl rounded-lg p-4 min-w-[200px] animate-fade-in">
                  <div className="p-2 text-gray-600">Signed in as {user.email}</div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;