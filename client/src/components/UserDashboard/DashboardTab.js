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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <CategoryDistribution />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-[#EAF4FB]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#0B2A4A]">Trending Items</h3>
            <div className="bg-[#ec463d]/10 text-[#ec463d] p-1 px-3 rounded-full flex items-center">
              <FaFire className="mr-1" /> Hot
            </div>
          </div>
          <div className="space-y-4">
            {trendingItems.map((item, index) => (
              <div key={index} className="p-4 border border-[#EAF4FB] rounded-lg hover:bg-[#EAF4FB] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-[#0B2A4A]">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1B8ED1]">R{item.price}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaEye className="mr-1" size={12} /> {item.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-[#1B8ED1] border border-[#1B8ED1] rounded-lg hover:bg-[#1B8ED1] hover:text-white transition-colors">
            View All Items
          </button>
        </div>
        
        <RecentActivity />
      </div>
    </>
  );
};

export default DashboardTab;