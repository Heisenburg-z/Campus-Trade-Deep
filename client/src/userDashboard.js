import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/UserDashboard/Sidebar';
import DashboardTab from './components/UserDashboard/DashboardTab';
import SellTab from './components/UserDashboard/SellTab';
import BuyTab from './components/UserDashboard/BuyTab';
import TradesTab from './components/UserDashboard/TradesTab';
import EnhancedMessagesTab from './components/EnhancedMessagesTab';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [conversations, setConversations] = useState([]);

  const handleMessageClick = async (sellerId, listingId) => {
    if (!sellerId || !listingId) {
      console.error('Missing sellerId or listingId');
      return;
    }
    
    setActiveTab('messages');
    // ... rest of your handleMessageClick logic
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('campusTradeToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        const response = await fetch(`https://campus-trade-deep-production-7247.up.railway.app/api/users/me`, {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EAF4FB] to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B8ED1] mx-auto mb-4"></div>
          <p className="text-[#0B2A4A]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAF4FB] to-white flex">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        navigate={navigate}
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Top Header with User Info */}
          <div className="bg-gradient-to-r from-[#1B8ED1] to-[#8EC6EA] rounded-2xl shadow-lg p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.username}!
                </h1>
                <p className="text-white/80">Welcome to your CampusTrade dashboard</p>
              </div>
              <div className="hidden md:block bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm">Active since</p>
                <p className="text-lg font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <DashboardTab user={user} />}
          {activeTab === 'sell' && <SellTab user={user} />}
          {activeTab === 'buy' && (
            <BuyTab 
              listings={listings}
              isLoading={isLoading}
              error={error}
              page={page}
              hasMore={hasMore}
              setPage={setPage}
              setIsLoading={setIsLoading}
              setError={setError}
              setListings={setListings}
              setHasMore={setHasMore}
              activeTab={activeTab}
              handleMessageClick={handleMessageClick}
            />
          )}
          {activeTab === 'trades' && <TradesTab />}
          {activeTab === 'messages' && <EnhancedMessagesTab user={user} />}
          
          {/* Settings and Help Tabs (if needed) */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-[#0B2A4A] mb-6">Settings</h2>
              <p className="text-gray-600">Settings content coming soon...</p>
            </div>
          )}
          
          {activeTab === 'help' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-[#0B2A4A] mb-6">Help Center</h2>
              <p className="text-gray-600">Help content coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;