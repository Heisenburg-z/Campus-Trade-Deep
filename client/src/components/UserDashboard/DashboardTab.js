import React from 'react';
import { FaCalendarAlt, FaShoppingCart, FaPlus, FaImage, FaExchangeAlt, FaFire, FaEye, FaThumbsUp, FaTrophy } from 'react-icons/fa';
import StatsCards from './StatsCards';
import PerformanceChart from './PerformanceChart';
import CategoryDistribution from './CategoryDistribution';
import RecentActivity from './RecentActivity';

const DashboardTab = ({ user }) => {
  const userStats = {
    itemsBought: 109,
    itemsSold: 81,
    activeListings: 15,
    tradeRequests: 10
  };

  const trendingItems = [
    { name: 'MacBook Pro 2023', views: 156, category: 'Electronics', price: 1200 },
    { name: 'Calculus Textbook', views: 98, category: 'Books', price: 75 },
    { name: 'Desk Lamp', views: 76, category: 'Furniture', price: 35 },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden transform transition-all duration-300 hover:scale-102">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.username}!
            </h2>
            <p className="text-gray-600">Welcome to your personalized dashboard</p>
            <div className="mt-4 inline-flex items-center text-indigo-600">
              <FaCalendarAlt className="mr-2" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
              className="h-24 w-24 opacity-90 relative z-10"
              alt="User avatar"
            />
          </div>
        </div>
      </div>

      <StatsCards userStats={userStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <CategoryDistribution />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Trending Items</h3>
            <div className="bg-orange-100 text-orange-600 p-1 px-3 rounded-full flex items-center">
              <FaFire className="mr-1" /> Hot
            </div>
          </div>
          <div className="space-y-4">
            {trendingItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">${item.price}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaEye className="mr-1" size={12} /> {item.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            View All Items
          </button>
        </div>
        
        <RecentActivity />
      </div>
    </>
  );
};

export default DashboardTab;