import { Import } from 'lucide-react';
import React, { useState, useEffect } from 'react'; // Add useEffect import
import HomePage from './HomePage';
import UserDashboardTest from './userDashboardTest';

function App() {
  // State management for listings

  // Fetch data when component mounts
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`https://campus-trade-deep-production.up.railway.app/api/listings/`)
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      {loading ? (
        <div className="loading-spinner">🌀</div>
      ) : (
        // Wrap multiple components in a fragment
        <>
          <HomePage listings={listings} />
          <UserDashboardTest listings={listings} />
        </>
      )}
    </div>
  );
}

export default App;
// App.js


