import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PerformanceChart = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [chartView, setChartView] = useState('line');

  const weeklyData = [
    { day: 'Mon', sales: 25, views: 120, inquiries: 12 },
    { day: 'Tue', sales: 32, views: 145, inquiries: 18 },
    { day: 'Wed', sales: 28, views: 132, inquiries: 15 },
    { day: 'Thu', sales: 39, views: 167, inquiries: 22 },
    { day: 'Fri', sales: 42, views: 189, inquiries: 26 },
    { day: 'Sat', sales: 35, views: 178, inquiries: 19 },
    { day: 'Sun', sales: 29, views: 156, inquiries: 14 },
  ];
  
  const monthlyData = [
    { month: 'Jan', sales: 65, views: 320, inquiries: 42 },
    { month: 'Feb', sales: 59, views: 286, inquiries: 38 },
    { month: 'Mar', sales: 80, views: 401, inquiries: 56 },
    { month: 'Apr', sales: 81, views: 412, inquiries: 62 },
    { month: 'May', sales: 56, views: 275, inquiries: 34 },
    { month: 'Jun', sales: 55, views: 259, inquiries: 31 },
  ];

  const salesData = timeframe === 'weekly' ? weeklyData : monthlyData;
  const xKey = timeframe === 'weekly' ? 'day' : 'month';

  const renderChart = () => {
    if (chartView === 'line') {
      return (
        <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: '#0B2A4A'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#1B8ED1" 
            strokeWidth={3}
            dot={{ fill: '#1B8ED1', r: 4 }}
            activeDot={{ r: 6 }}
            name="Sales"
          />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#8EC6EA" 
            strokeWidth={2}
            dot={{ fill: '#8EC6EA', r: 4 }}
            activeDot={{ r: 6 }}
            name="Views"
          />
        </LineChart>
      );
    } else {
      return (
        <BarChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: '#0B2A4A'
            }}
          />
          <Legend />
          <Bar dataKey="sales" fill="#1B8ED1" name="Sales" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inquiries" fill="#ec463d" name="Inquiries" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-[#EAF4FB]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#0B2A4A]">Performance Overview</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === 'weekly' 
                ? 'bg-[#1B8ED1] text-white' 
                : 'bg-[#EAF4FB] text-[#0B2A4A] hover:bg-[#8EC6EA]'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 rounded-lg text-sm ${
              timeframe === 'monthly' 
                ? 'bg-[#1B8ED1] text-white' 
                : 'bg-[#EAF4FB] text-[#0B2A4A] hover:bg-[#8EC6EA]'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setChartView(chartView === 'line' ? 'bar' : 'line')}
            className="px-3 py-1 bg-[#EAF4FB] text-[#0B2A4A] rounded-lg text-sm hover:bg-[#8EC6EA]"
          >
            {chartView === 'line' ? 'Bar' : 'Line'} View
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;