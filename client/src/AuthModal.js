import React, { useState } from 'react';
import { FaTimes, FaGoogle } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


const AuthModal = ({ type, onClose, switchType, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = type === 'login' ? '/api/users/login' : '/api/users/register';
      const { data } = await axios.post(endpoint, formData);
      
      localStorage.setItem('campusTradeToken', data.token);
      onSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { data } = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name
      });
      
      localStorage.setItem('campusTradeToken', data.token);
      onSuccess(data.user);
      onClose();
    } catch (err) {
      setError('Google authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6 text-indigo-600 text-center">
          {type === 'login' ? 'Welcome Back!' : 'Join CampusTrade'}
        </h2>

        {/* Google Sign-In */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
            shape="pill"
            size="large"
            text={type === 'login' ? 'signin_with' : 'signup_with'}
            theme="filled_blue"
          />
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or continue with email</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {type === 'login' ? 'Login' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={switchType}
            className="text-indigo-600 hover:underline focus:outline-none"
          >
            {type === 'login' ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;