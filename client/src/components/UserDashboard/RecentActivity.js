import React from 'react';
import { FaThumbsUp, FaExchangeAlt, FaTrophy } from 'react-icons/fa';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      icon: <FaThumbsUp />,
      iconBg: 'bg-green-500',
      title: 'Your listing "MacBook Pro 2022" received an offer',
      time: '2 hours ago from John Doe',
    },
    {
      id: 2,
      icon: <FaExchangeAlt />,
      iconBg: 'bg-blue-500',
      title: 'Trade completed with Sarah Smith',
      time: 'Yesterday at 4:30 PM',
    },
    {
      id: 3,
      icon: <FaTrophy />,
      iconBg: 'bg-purple-500',
      title: 'You reached Power Seller status!',
      time: '2 days ago',
    },
  ];

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
      <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative pl-14">
              <div className={`absolute left-0 ${activity.iconBg} w-12 h-12 rounded-full flex items-center justify-center text-white`}>
                {activity.icon}
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="w-full mt-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;