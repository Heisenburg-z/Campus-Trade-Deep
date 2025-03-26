import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState, useEffect } from 'react';
import HomePage from './HomePage';
import UserDashboardTest from './userDashboardTest';

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/listings/`)
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        setLoading(false);
      });
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        {loading ? (
          <div className="loading-spinner">🌀</div>
        ) : (
          <>
            <HomePage listings={listings} />
            <UserDashboardTest listings={listings} />
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;