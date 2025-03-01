import { Import } from 'lucide-react';
import React, { useState, useEffect } from 'react'; // Add useEffect import
import HomePage from './HomePage';
import UserDashboardTest from './userDashboardTest';

function App() {
  // State management for listings
  const [listings, setListings] = useState([]);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/listings');
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, []); // Empty dependency array = runs once on mount

  return (
    <div className="App">
      {/* Pass listings data to components that need it */}
      <HomePage listings={listings} />
      <UserDashboardTest listings={listings} />
    </div>
  );
}

export default App;