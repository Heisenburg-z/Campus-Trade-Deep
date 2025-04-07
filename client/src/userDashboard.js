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

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

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
  //const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('weekly');
  const [chartView, setChartView] = useState('line');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState({ id: null, listingId: null });
  
  // =====item click functionality=====
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setSelectedProduct(null); // Close modal after adding
  };
  
  const handleMessageClick = async (sellerId, listingId) => {

    // In handleMessageClick
if (!sellerId || !listingId) {
  console.error('Missing sellerId or listingId');
  return;
}
    setActiveTab('messages');
    setSelectedSeller({ id: sellerId, listingId });
  
    // Check existing conversations after messages load
    setTimeout(() => {
      const existingConv = conversations.find(conv => 
        (conv.participant1_id === user.user_id && conv.participant2_id === sellerId) ||
        (conv.participant1_id === sellerId && conv.participant2_id === user.user_id)
      );
      
      
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create new conversation
        const createConversation = async () => {
          try {
            const token = localStorage.getItem('campusTradeToken');
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/messages`,
              {
                listingId: listingId,
                recipientId: sellerId,
                content: "Hi, I'm interested in your item!"
              },
              { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setConversations(prev => [...prev, response.data]);
            setSelectedConversation(response.data);
          } catch (error) {
            console.error('Error creating conversation:', error);
          }
        };
        createConversation();
      }
    }, 500); // Small delay to allow conversations to load
  };
  // =====end item click functionality=====
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

    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://campus-trade-deep-production.up.railway.app/api/listings/?page=${page}&limit=12`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        
        if (page === 1) {
          setListings(data.results);
        } else {
          setListings(prev => [...prev, ...data.results]);
        }
        
        setHasMore(data.results.length === 12); // Assuming 12 is your limit
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    if (activeTab === 'buy') {
      fetchListings();
    }

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
  }, [navigate, activeTab, page]);
    // Load more listings function
    const loadMore = () => {
      if (!isLoading && hasMore) {
        setPage(prev => prev + 1);
      }
    };

      // Transform API listing format to match ProductCard props
  const formatProductData = (listing) => {
    return {
      id: listing.listing_id,
      sellerId: listing.seller_id,// Make sure API returns seller_id
      title: listing.title,
      description: listing.description,
      price: listing.price,
      image: listing.image_url,
      category: 'Textbooks', // You'll need to add category to your API or hardcode as needed
      condition: listing.condition,
      seller: listing.username,
      sellerAvatar: listing.seller_avatar,
      sellerRating: 4.5, // You don't have ratings in your API yet, this is a placeholder
      ratingCount: 10, // Placeholder
      location: listing.seller_university,
      datePosted: listing.created_at,
      isNew: new Date(listing.created_at) > new Date(Date.now() - 86400000) // 24 hours
    };
  };

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
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
    <div className="relative">
      {/* Decorative header with animated elements */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 pb-16">
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path d="M39.7,88.9c-6.7-4.8-13.3-9.7-20-14.5c-2.9-2.1-5.9-4.2-8.8-6.4c4.8-6.7,9.7-13.4,14.5-20c2.1-2.9,4.2-5.9,6.4-8.8 c6.7,4.8,13.3,9.7,20,14.5c2.9,2.1,5.9,4.2,8.8,6.4c-4.8,6.7-9.7,13.4-14.5,20C43.9,83,41.8,86,39.7,88.9z" fill="currentColor" className="animate-pulse" />
            <path d="M114.6,39.7c-6.7-4.8-13.3-9.7-20-14.5c-2.9-2.1-5.9-4.2-8.8-6.4c4.8-6.7,9.7-13.4,14.5-20c2.1-2.9,4.2-5.9,6.4-8.8 c6.7,4.8,13.3,9.7,20,14.5c2.9,2.1,5.9,4.2,8.8,6.4c-4.8,6.7-9.7,13.4-14.5,20C118.8,33.9,116.7,36.8,114.6,39.7z" fill="currentColor" className="animate-pulse" />
          </svg>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">List New Item</h2>
            <p className="text-indigo-100">Share your treasures with the campus community</p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center bg-white bg-opacity-20 p-2 rounded-lg">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-2">
                <FaPlus className="text-white" />
              </div>
              <div className="text-white">
                <p className="text-sm font-medium">Your items</p>
                <p className="text-lg font-bold">{userStats?.itemsSold || 0} sold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute -bottom-1 left-0 right-0 transform rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="white" preserveAspectRatio="none">
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,58.7C840,64,960,96,1080,96C1200,96,1320,64,1380,48L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </div>
    
    {/* Form content */}
    <div className="px-8 py-10 bg-white relative">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSellItem} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image upload section with enhancements */}
            <div className="space-y-6">
              <label className="block text-gray-700 text-sm font-medium">
                <div className="flex items-center">
                  <FaImage className="mr-2 text-indigo-500" />
                  <span>Item Images</span>
                </div>
              </label>
              <div className="relative group">
                <div className="h-80 w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center hover:border-indigo-500 transition-colors overflow-hidden">
                  {newListing.image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={newListing.image} 
                        alt="Preview" 
                        className="h-full w-full object-cover rounded-xl transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={() => setNewListing({...newListing, image: ''})}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-opacity"
                        >
                          <FaPlus className="transform rotate-45" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 transition-transform group-hover:scale-110">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <FaImage className="w-8 h-8 text-indigo-500" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Drag and drop your images here</p>
                      <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                      <p className="text-xs text-gray-400">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
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
              
              {/* Tips section */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Tips for better listing photos
                </h4>
                <ul className="text-sm text-indigo-600 space-y-1">
                  <li className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Use natural lighting
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Show multiple angles
                  </li>
                  <li className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Include size reference
                  </li>
                </ul>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="What are you selling?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029zM6 12a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm2 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-gray-500 font-medium">R</span>
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="text-xs font-medium text-gray-400 bg-gray-100 p-1 rounded">ZAR</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  Category
                </label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={newListing.category}
                    onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Books">Books</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Sports">Sports Equipment</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Condition
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((condition) => (
                    <button 
                      key={condition}
                      type="button"
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        newListing.condition === condition 
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => setNewListing({...newListing, condition: condition})}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              rows="5"
              placeholder="Describe your item in detail. Include features, condition, and why you're selling it."
              value={newListing.description}
              onChange={(e) => setNewListing({...newListing, description: e.target.value})}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min. 20 characters</span>
              <span>{newListing.description.length} / 1000</span>
            </div>
          </div>

          {/* Additional options */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-4">Additional Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="block w-10 h-6 bg-gray-300 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Allow Offers</span>
                    <p className="text-xs text-gray-500">Let buyers negotiate the price</p>
                  </div>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="block w-10 h-6 bg-gray-300 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Open to Trades</span>
                    <p className="text-xs text-gray-500">Consider exchanging for other items</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Tags section */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Tags (Optional)</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add tags separated by commas"
              />
              <div className="text-sm text-gray-600 mt-1">
                <span>e.g. vintage, electronics, gaming</span>
              </div>
            </div>
          </div>

          {/* Submit button with animation */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Publish Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
        {/* Buy Tab */}
        {activeTab === 'buy' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Marketplace</h2>
            
            {/* Loading state */}
            {isLoading && page === 1 && (
              <div className="flex justify-center p-8">
                <p>Loading listings...</p>
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {/* Empty state */}
            {!isLoading && listings.length === 0 && (
              <div className="text-center p-8">
                <p className="text-gray-500">No listings available at the moment.</p>
              </div>
            )}
            
            {/* Listings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(item => (
                         <ProductCard
                        key={item.listing_id}
                        product={formatProductData(item)}
                        onViewDetails={() => setSelectedProduct(formatProductData(item))}
                        onMessageClick={(sellerId, listingId) => handleMessageClick(sellerId, listingId)}
                        className="transform transition-all hover:scale-105 hover:shadow-xl"
                      />
              ))}
            </div>
            
            {/* Load more button */}
            {hasMore && !isLoading && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={loadMore}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
                >
                  Load More
                </button>
              </div>
            )}
            
            {/* Loading more indicator */}
            {isLoading && page > 1 && (
              <div className="flex justify-center p-4 mt-4">
                <p>Loading more...</p>
              </div>
            )}
                {/* Product Details Modal */}
    {selectedProduct && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-4">{selectedProduct.title}</h2>
          <img 
            src={selectedProduct.image} 
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt={selectedProduct.title}
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600"><strong>Price:</strong> R{selectedProduct.price}</p>
              <p className="text-gray-600"><strong>Condition:</strong> {selectedProduct.condition}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Category:</strong> {selectedProduct.category}</p>
              <p className="text-gray-600"><strong>Location:</strong> {selectedProduct.location}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
          <div className="flex gap-4">
            <button
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              Add to Cart
            </button>
            <button
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
          </div>
        </div>
      )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-gray-800">Trade Management</h2>
      <div className="flex space-x-3">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
          <FaExchangeAlt className="mr-2" /> New Trade
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
          <FaCalendarAlt className="mr-2" /> Schedule Trade
        </button>
      </div>
    </div>
    
    {/* Trade Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow-md flex flex-col">
        <span className="text-indigo-100 text-sm">Total Trades</span>
        <span className="text-3xl font-bold mt-2">24</span>
        <div className="flex items-center mt-4">
          <span className="text-green-300 flex items-center"><FaChartLine className="mr-1" /> +8.2%</span>
          <span className="text-xs text-indigo-200 ml-2">from last month</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-md flex flex-col">
        <span className="text-purple-100 text-sm">Pending Trades</span>
        <span className="text-3xl font-bold mt-2">3</span>
        <div className="flex items-center mt-4">
          <span className="text-yellow-300 flex items-center"><FaExchangeAlt className="mr-1" /> Active</span>
          <span className="text-xs text-purple-200 ml-2">awaiting confirmation</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-xl shadow-md flex flex-col">
        <span className="text-green-100 text-sm">Successful Trades</span>
        <span className="text-3xl font-bold mt-2">21</span>
        <div className="flex items-center mt-4">
          <span className="text-green-300 flex items-center"><FaThumbsUp className="mr-1" /> 100%</span>
          <span className="text-xs text-green-200 ml-2">satisfaction rate</span>
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-md flex flex-col">
        <span className="text-blue-100 text-sm">Trade Value</span>
        <span className="text-3xl font-bold mt-2">R 4,580</span>
        <div className="flex items-center mt-4">
          <span className="text-green-300 flex items-center"><FaChartLine className="mr-1" /> +12.5%</span>
          <span className="text-xs text-blue-200 ml-2">value increase</span>
        </div>
      </div>
    </div>
    
    {/* Pending Trade Requests */}
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaExchangeAlt className="mr-2 text-indigo-600" /> Pending Trade Requests
      </h3>
      
      <div className="space-y-4">
        <div className="p-6 bg-indigo-50 rounded-xl border-l-4 border-indigo-600 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://randomuser.me/api/portraits/women/72.jpg" 
                className="w-12 h-12 rounded-full object-cover"
                alt="Trader"
              />
              <div>
                <h3 className="font-semibold text-lg">Trade request from Thapelo Ndlovu</h3>
                <div className="flex items-center text-gray-600">
                  <span>Offering: Psychology Textbook (2022 Edition)</span>
                  <span className="mx-2">•</span>
                  <span className="text-indigo-600">UCT</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                Accept
              </button>
              <button className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-yellow-50 rounded-xl border-l-4 border-yellow-500 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://randomuser.me/api/portraits/men/45.jpg" 
                className="w-12 h-12 rounded-full object-cover"
                alt="Trader"
              />
              <div>
                <h3 className="font-semibold text-lg">Trade request from Simphiwe Mhlongo</h3>
                <div className="flex items-center text-gray-600">
                  <span>Offering: HP Printer (Almost New)</span>
                  <span className="mx-2">•</span>
                  <span className="text-indigo-600">WITS</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                Accept
              </button>
              <button className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://randomuser.me/api/portraits/women/32.jpg" 
                className="w-12 h-12 rounded-full object-cover"
                alt="Trader"
              />
              <div>
                <h3 className="font-semibold text-lg">Trade request from Amara Patel</h3>
                <div className="flex items-center text-gray-600">
                  <span>Offering: Calculus III Textbook + Study Guide</span>
                  <span className="mx-2">•</span>
                  <span className="text-indigo-600">Stellenbosch</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                Accept
              </button>
              <button className="px-6 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Trade History */}
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <FaCalendarAlt className="mr-2 text-indigo-600" /> Trade History
        </h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors">
            All Time
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Last Month
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Export
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trade Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trade Partner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items Exchanged
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <FaExchangeAlt />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Trade #TR-2348</div>
                    <div className="text-sm text-gray-500">In-person exchange</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img className="h-8 w-8 rounded-full object-cover" src="https://randomuser.me/api/portraits/men/85.jpg" alt="" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Luthando Mabaso</div>
                    <div className="text-xs text-indigo-600">University of Cape Town</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">Economics Textbook (Yours) ↔ Java Programming Book (Theirs)</div>
                <div className="text-xs text-gray-500">Equivalent Value: R 450</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                March 24, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <FaExchangeAlt />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Trade #TR-2341</div>
                    <div className="text-sm text-gray-500">Mail exchange</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img className="h-8 w-8 rounded-full object-cover" src="https://randomuser.me/api/portraits/women/62.jpg" alt="" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Fatima Naidoo</div>
                    <div className="text-xs text-indigo-600">Wits University</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">Desk Lamp (Yours) ↔ Wireless Mouse (Theirs)</div>
                <div className="text-xs text-gray-500">Equivalent Value: R 250</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                March 15, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <FaExchangeAlt />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Trade #TR-2309</div>
                    <div className="text-sm text-gray-500">Campus meetup</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img className="h-8 w-8 rounded-full object-cover" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Tebogo Mokoena</div>
                    <div className="text-xs text-indigo-600">Stellenbosch University</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">Chemistry Lab Kit (Yours) ↔ Scientific Calculator (Theirs)</div>
                <div className="text-xs text-gray-500">Equivalent Value: R 380</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                February 18, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing 3 of 21 trades
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
            1
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            2
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            3
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
    
    {/* Trade Analytics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Trade Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { month: 'Jan', trades: 2 },
              { month: 'Feb', trades: 4 },
              { month: 'Mar', trades: 8 },
              { month: 'Apr', trades: 6 },
              { month: 'May', trades: 4 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="trades" 
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6 }}
                name="Trades"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4">Trade Categories</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Books', value: 12, color: '#4f46e5' },
                  { name: 'Electronics', value: 5, color: '#10b981' },
                  { name: 'Furniture', value: 2, color: '#f59e0b' },
                  { name: 'Clothing', value: 3, color: '#ef4444' },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#4f46e5"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { name: 'Books', value: 12, color: '#4f46e5' },
                  { name: 'Electronics', value: 5, color: '#10b981' },
                  { name: 'Furniture', value: 2, color: '#f59e0b' },
                  { name: 'Clothing', value: 3, color: '#ef4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} trades`, 'Quantity']} />
            </PieChart>
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