// Add these imports
import { useState, useEffect } from 'react';

// Update HomePage component
const HomePage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('campusTradeToken');
    if (token) {
      // Verify token and fetch user data
      axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUser(res.data))
        .catch(() => logout());
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('campusTradeToken');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        user={user}
        onLoginClick={() => {
          setAuthType('login');
          setShowAuthModal(true);
        }}
        onSignupClick={() => {
          setAuthType('signup');
          setShowAuthModal(true);
        }}
        onLogout={logout}
      />
      
      {/* ... rest of your HomePage */}

      {showAuthModal && (
        <AuthModal
          type={authType}
          onClose={() => setShowAuthModal(false)}
          switchType={() => setAuthType(prev => prev === 'login' ? 'signup' : 'login')}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};