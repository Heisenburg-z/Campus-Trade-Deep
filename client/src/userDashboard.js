import React, { useState, useEffect } from 'react';
import { FaUser, FaPlus, FaShoppingCart, FaExchangeAlt, FaChartLine, FaRegBell, FaImage } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer } from 'recharts';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('campusTradeToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);
  // Sample data
  const userStats = {
    itemsBought: 109,
    itemsSold: 81,
    activeListings: 15,
    tradeRequests: 10
  };

  const salesData = [
    { month: 'Jan', sales: 65 },
    { month: 'Feb', sales: 59 },
    { month: 'Mar', sales: 80 },
    { month: 'Apr', sales: 81 },
    { month: 'May', sales: 56 },
    { month: 'Jun', sales: 55 },
  ];

  const categoryDistribution = [
    { name: 'Books', value: 40 },
    { name: 'Electronics', value: 30 },
    { name: 'Furniture', value: 20 },
    { name: 'Clothing', value: 10 },
  ];

  const handleSellItem = (e) => {
    e.preventDefault();
    setListings([...listings, { ...newListing, id: Date.now() }]);
    setNewListing({
      title: '',
      description: '',
      price: '',
      category: '',
      image: ''
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewListing({...newListing, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('campusTradeToken');
    navigate('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Animated Navbar */}
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
                {['dashboard', 'buy', 'sell', 'trades'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab 
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    {tab === 'dashboard' && <FaChartLine className="mr-2" />}
                    {tab === 'buy' && <FaShoppingCart className="mr-2" />}
                    {tab === 'sell' && <FaPlus className="mr-2" />}
                    {tab === 'trades' && <FaExchangeAlt className="mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {user.username}!
                  </h2>
                  <p className="text-gray-600">Here's your daily overview</p>
                </div>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                  className="h-24 w-24 opacity-90"
                  alt="User avatar"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(userStats).map(([key, value]) => (
                <div 
                  key={key}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">
                        {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </p>
                      <p className="text-3xl font-bold text-indigo-600">{value}</p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <FaChartLine className="text-indigo-600 w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        dot={{ fill: '#4f46e5' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold mb-4">Category Distribution</h3>
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
                        label
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sell Item Section */}
        {activeTab === 'sell' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">List New Item</h2>
            <form onSubmit={handleSellItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div className="space-y-4">
                  <label className="block text-gray-700 text-sm font-medium">Item Images</label>
                  <div className="relative group">
                    <div className="h-64 w-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-indigo-500 transition-colors">
                      {newListing.image ? (
                        <img 
                          src={newListing.image} 
                          alt="Preview" 
                          className="h-full w-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-center">
                          <FaImage className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-500">Click to upload images</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Item Title</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={newListing.title}
                      onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        required
                        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={newListing.price}
                        onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={newListing.category}
                      onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      <option value="Books">Books</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="4"
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium text-lg"
              >
                Publish Listing
              </button>
            </form>
          </div>
        )}

        {/* Buy Items Section */}
        {activeTab === 'buy' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Marketplace</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(item => (
                  <ProductCard 
                    key={item.id} 
                    product={item}
                    className="transform transition-all hover:scale-105 hover:shadow-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trades Section */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Trade Management</h2>
            <div className="space-y-6">
              {/* Trade Request Card */}
              <div className="p-6 bg-indigo-50 rounded-xl border-l-4 border-indigo-600 hover:bg-white transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/72.jpg" 
                      className="w-12 h-12 rounded-full"
                      alt="Trader"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">Trade request from JaneDoe</h3>
                      <p className="text-gray-600">Offering: Psychology Textbook (2022 Edition)</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-6 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors">
                      Accept
                    </button>
                    <button className="px-6 py-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              </div>

              {/* Trade History Chart */}
              <div className="bg-white p-6 rounded-xl shadow-md mt-8">
                <h3 className="text-xl font-semibold mb-4">Trade History</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <Bar 
                        dataKey="sales" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;