import React from 'react';
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const CategoryDistribution = () => {
  const categoryDistribution = [
    { name: 'Books', value: 40, color: '#4f46e5' },
    { name: 'Electronics', value: 30, color: '#10b981' },
    { name: 'Furniture', value: 20, color: '#f59e0b' },
    { name: 'Clothing', value: 10, color: '#ef4444' },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
      <h3 className="text-xl font-semibold mb-6">Category Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#4f46e5"
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Market share']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-2">
          {categoryDistribution.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDistribution;