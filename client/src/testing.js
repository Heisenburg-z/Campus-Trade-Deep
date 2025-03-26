import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ... other imports

const UserDashboard = () => { // Remove props
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Single source of truth
  const [activeTab, setActiveTab] = useState('dashboard');
  // ... rest of your state

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

  // ... rest of your component