import React from 'react';
import { FaShoppingCart, FaPlus, FaImage, FaExchangeAlt } from 'react-icons/fa';

const StatsCards = ({ userStats }) => {
  const stats = [
    { key: 'itemsBought', label: 'Items Bought', value: userStats.itemsBought, icon: <FaShoppingCart className="text-indigo-600 w-6 h-6" />, color: 'bg-indigo-100' },
    { key: 'itemsSold', label: 'Items Sold', value: userStats.itemsSold, icon: <FaPlus className="text-green-600 w-6 h-6" />, color: 'bg-green-100' },
    { key: 'activeListings', label: 'Active Listings', value: userStats.activeListings, icon: <FaImage className="text-purple-600 w-6 h-6" />, color: 'bg-purple-100' },
    { key: 'tradeRequests', label: 'Trade Requests', value: userStats.tradeRequests, icon: <FaExchangeAlt className="text-orange-600 w-6 h-6" />, color: 'bg-orange-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={stat.key}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              {stat.icon}
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
              style={{ width: `${Math.min(stat.value, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;