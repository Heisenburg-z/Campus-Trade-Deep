import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import UserDashboard from './userDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './AuthModal';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthModal />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;