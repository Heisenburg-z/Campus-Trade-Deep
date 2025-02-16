import React, { useState } from 'react';
import { FaUser, FaPlus, FaShoppingCart, FaExchangeAlt } from 'react-icons/fa';
import ProductCard from './ProductCard';

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [listings, setListings] = useState([]);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: ''
  });

  // Sample data 
  const userStats = {
    itemsBought: 12,
    itemsSold: 8,
    activeListings: 5,
    tradeRequests: 3
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">CampusTrade</span>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('buy')}
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <FaShoppingCart className="mr-2" /> Buy
              </button>
              <button 
                onClick={() => setActiveTab('sell')}
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <FaPlus className="mr-2" /> Sell
              </button>
              <button 
                onClick={() => setActiveTab('trades')}
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <FaExchangeAlt className="mr-2" /> Trades
              </button>
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <FaUser className="text-indigo-600" />
                  <span className="text-gray-700">{user.username}</span>
                </button>
                <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-lg p-4 min-w-[200px]">
                  <button 
                    onClick={onLogout}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-6">Welcome Back, {user.username}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-gray-600">Items Bought</h3>
                <p className="text-2xl font-bold text-indigo-600">{userStats.itemsBought}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-gray-600">Items Sold</h3>
                <p className="text-2xl font-bold text-indigo-600">{userStats.itemsSold}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-gray-600">Active Listings</h3>
                <p className="text-2xl font-bold text-indigo-600">{userStats.activeListings}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-gray-600">Trade Requests</h3>
                <p className="text-2xl font-bold text-indigo-600">{userStats.tradeRequests}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">Sell an Item</h2>
            <form onSubmit={handleSellItem} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Item Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows="4"
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border rounded"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full p-2 border rounded"
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
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                List Item
              </button>
            </form>
          </div>
        )}

        {activeTab === 'buy' && (
          <div>
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">Available Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reuse ProductCard component */}
              {listings.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6">Trade Requests</h2>
            <div className="space-y-4">
              {/* Sample trade request - implement actual trade logic */}
              <div className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Trade request for Calculus Textbook</h3>
                    <p className="text-gray-600">From: Thapelo Ndlovu</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-100 text-green-800 rounded">
                      Accept
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-800 rounded">
                      Decline
                    </button>
                  </div>
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