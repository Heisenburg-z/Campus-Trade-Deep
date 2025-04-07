import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, FaPlus, FaShoppingCart, FaExchangeAlt, FaChartLine, 
  FaRegBell, FaImage, FaComments, FaPaperPlane, FaFire,
  FaTrophy, FaThumbsUp, FaEye, FaCalendarAlt 
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,Cell
} from 'recharts';
import ProductCard from './ProductCard';

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
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('weekly');
  const [chartView, setChartView] = useState('line');

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

    if (activeTab === 'messages') {
      const fetchConversations = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('campusTradeToken');
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/messages/conversations`,
            { headers: { Authorization: `Bearer ${token}` }}
          );
          setConversations(response.data);
        } catch (error) {
          console.error('Error fetching conversations:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchConversations();
    }
  }, [navigate, activeTab]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('campusTradeToken');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/messages`,
        {
          conversation_id: selectedConversation.conversation_id,
          content: newMessage
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Sample data
  const userStats = {
    itemsBought: 109,
    itemsSold: 81,
    activeListings: 15,
    tradeRequests: 10
  };

  // Enhanced data
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

  const categoryDistribution = [
    { name: 'Books', value: 40, color: '#4f46e5' },
    { name: 'Electronics', value: 30, color: '#10b981' },
    { name: 'Furniture', value: 20, color: '#f59e0b' },
    { name: 'Clothing', value: 10, color: '#ef4444' },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const trendingItems = [
    { name: 'MacBook Pro 2023', views: 156, category: 'Electronics', price: 1200 },
    { name: 'Calculus Textbook', views: 98, category: 'Books', price: 75 },
    { name: 'Desk Lamp', views: 76, category: 'Furniture', price: 35 },
  ];

  const renderChart = () => {
    if (chartView === 'line') {
      return (
        <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#4f46e5" 
            strokeWidth={3}
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
            name="Sales"
          />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
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
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="sales" fill="#4f46e5" name="Sales" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inquiries" fill="#f59e0b" name="Inquiries" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Navigation */}
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
                {['dashboard', 'buy', 'sell', 'trades', 'messages'].map((tab) => (
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
                    {tab === 'messages' && <FaComments className="mr-2" />}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Messages</h2>
            <div className="flex h-[600px] border rounded-xl overflow-hidden">
              <div className="w-1/3 border-r overflow-y-auto">
                {conversations.map(conv => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.conversation_id === conv.conversation_id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        {conv.participant1 === user.username ? 
                          conv.participant2.charAt(0) : conv.participant1.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {conv.participant1 === user.username ? conv.participant2 : conv.participant1}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.message_id}
                      className={`flex ${message.sender_id === user.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user.user_id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.sent_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <FaPaperPlane className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
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
        
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Object.entries(userStats).map(([key, value], index) => {
                        const icons = [
                          <FaShoppingCart className="text-indigo-600 w-6 h-6" />,
                          <FaPlus className="text-green-600 w-6 h-6" />,
                          <FaImage className="text-purple-600 w-6 h-6" />,
                          <FaExchangeAlt className="text-orange-600 w-6 h-6" />
                        ];
                        
                        const colors = [
                          'bg-indigo-100',
                          'bg-green-100',
                          'bg-purple-100',
                          'bg-orange-100'
                        ];
                        
                        return (
                          <div 
                            key={key}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-500 text-sm mb-1">
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
                              </div>
                              <div className={`${colors[index]} p-3 rounded-full`}>
                                {icons[index]}
                              </div>
                            </div>
                            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                                style={{ width: `${Math.min(value, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
        
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold">Performance Overview</h3>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => setTimeframe('weekly')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                timeframe === 'weekly' 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Weekly
                            </button>
                            <button 
                              onClick={() => setTimeframe('monthly')}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                timeframe === 'monthly' 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Monthly
                            </button>
                            <button 
                              onClick={() => setChartView(chartView === 'line' ? 'bar' : 'line')}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
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
        
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                        <div className="relative">
                          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                          <div className="space-y-6">
                            <div className="relative pl-14">
                              <div className="absolute left-0 bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white">
                                <FaThumbsUp />
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <p className="font-medium">Your listing "MacBook Pro 2022" received an offer</p>
                                <p className="text-sm text-gray-500 mt-1">2 hours ago from John Doe</p>
                              </div>
                            </div>
                            <div className="relative pl-14">
                              <div className="absolute left-0 bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center text-white">
                                <FaExchangeAlt />
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <p className="font-medium">Trade completed with Sarah Smith</p>
                                <p className="text-sm text-gray-500 mt-1">Yesterday at 4:30 PM</p>
                              </div>
                            </div>
                            <div className="relative pl-14">
                              <div className="absolute left-0 bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-white">
                                <FaTrophy />
                              </div>
                              <div className="bg-white p-4 rounded-xl shadow-sm">
                                <p className="font-medium">You reached Power Seller status!</p>
                                <p className="text-sm text-gray-500 mt-1">2 days ago</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-6 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                          View All Activity
                        </button>
                      </div>
                    </div>
                  </>
                )}
        {/* Sell Tab */}
        {activeTab === 'sell' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">List New Item</h2>
            <form onSubmit={handleSellItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
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

        {/* Buy Tab */}
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

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Trade Management</h2>
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50 rounded-xl border-l-4 border-indigo-600 hover:bg-white transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/72.jpg" 
                      className="w-12 h-12 rounded-full"
                      alt="Trader"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">Trade request from Thapelo Ndlovu</h3>
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