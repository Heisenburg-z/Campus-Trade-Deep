import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/UserDashboard/Navbar';
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        navigate={navigate}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
          />
        )}
        {activeTab === 'trades' && <TradesTab />}
        {activeTab === 'messages' && <EnhancedMessagesTab user={user} />}
      </div>
    </div>
  );
};

export default UserDashboard;