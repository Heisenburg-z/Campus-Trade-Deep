import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const AuthModal = ({ type, onClose, switchType, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    university: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [universities, setUniversities] = useState([
    'University of Cape Town (UCT)',
    'Stellenbosch University (SU)',
    'University of Pretoria (UP)',
    'University of the Witwatersrand (Wits)',
    'Rhodes University (RU)',
    'University of the Free State (UFS)',
    'University of KwaZulu-Natal (UKZN)',
    'University of the Western Cape (UWC)',
    'University of Johannesburg (UJ)',
    'North-West University (NWU)',
    'Nelson Mandela University (NMU)',
    'University of Limpopo (UL)',
    'University of Venda (UNIVEN)',
    'University of Zululand (UNIZULU)',
    'Walter Sisulu University (WSU)',
    'University of Fort Hare (UFH)',
    'Sefako Makgatho Health Sciences University (SMU)',
    'Sol Plaatje University (SPU)',
    'University of Mpumalanga (UMP)',
    'University of South Africa (UNISA)',
    'Cape Peninsula University of Technology (CPUT)',
    'Tshwane University of Technology (TUT)',
    'Durban University of Technology (DUT)',
    'Central University of Technology (CUT)',
    'Mangosuthu University of Technology (MUT)',
    'Vaal University of Technology (VUT)'
  ]);

  const validateForm = () => {
    // Basic validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (type === 'signup') {
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (!formData.university) {
        setError('Please select your university');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const BACKEND_URL = 'https://campus-trade-deep-production.up.railway.app';
      const endpoint = type === 'login' ? 
        `${BACKEND_URL}/api/users/login` : 
        `${BACKEND_URL}/api/users/register`;
      
      const payload = type === 'login' 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            username: formData.username,
            university: formData.university 
          };
      
      const { data } = await axios.post(endpoint, payload);
      
      localStorage.setItem('campusTradeToken', data.token);
      onSuccess(data.user);
      
      // Show success feedback
      const successMessage = document.getElementById('successMessage');
      successMessage.classList.remove('opacity-0');
      successMessage.classList.add('opacity-100');
      
      // Navigate after a short delay for visual feedback
      setTimeout(() => {
        navigate('/dashboard');
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const BACKEND_URL = 'https://campus-trade-deep-production.up.railway.app';
      const response = await axios.post(
        `${BACKEND_URL}/api/users/auth/google`,//if fail check this, /api/users/auth/google
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      localStorage.setItem('campusTradeToken', response.data.token);
      onSuccess(response.data.user);
      
      // Show success feedback
      const successMessage = document.getElementById('successMessage');
      successMessage.classList.remove('opacity-0');
      successMessage.classList.add('opacity-100');
      
      // Navigate after a short delay for visual feedback
      setTimeout(() => {
        navigate('/dashboard');
        onClose();
      }, 1000);
    } catch (err) {
      setError('Google authentication failed: ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Check for university domain match
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      const domain = formData.email.split('@')[1];
      let detectedUni = '';
  
      // Domain-to-university mapping for South African institutions
      const domains = {
        'uct.ac.za': 'University of Cape Town (UCT)',
        'sun.ac.za': 'Stellenbosch University (SU)',
        'up.ac.za': 'University of Pretoria (UP)',
        'wits.ac.za': 'University of the Witwatersrand (Wits)',
        'ru.ac.za': 'Rhodes University (RU)',
        'ufs.ac.za': 'University of the Free State (UFS)',
        'ukzn.ac.za': 'University of KwaZulu-Natal (UKZN)',
        'uwc.ac.za': 'University of the Western Cape (UWC)',
        'uj.ac.za': 'University of Johannesburg (UJ)',
        'nwu.ac.za': 'North-West University (NWU)',
        'mandela.ac.za': 'Nelson Mandela University (NMU)',
        'ul.ac.za': 'University of Limpopo (UL)',
        'univen.ac.za': 'University of Venda (UNIVEN)',
        'unizulu.ac.za': 'University of Zululand (UNIZULU)',
        'wsu.ac.za': 'Walter Sisulu University (WSU)',
        'ufh.ac.za': 'University of Fort Hare (UFH)',
        'smu.ac.za': 'Sefako Makgatho Health Sciences University (SMU)',
        'spu.ac.za': 'Sol Plaatje University (SPU)',
        'ump.ac.za': 'University of Mpumalanga (UMP)',
        'unisa.ac.za': 'University of South Africa (UNISA)',
        'cput.ac.za': 'Cape Peninsula University of Technology (CPUT)',
        'tut.ac.za': 'Tshwane University of Technology (TUT)',
        'dut.ac.za': 'Durban University of Technology (DUT)',
        'cut.ac.za': 'Central University of Technology (CUT)',
        'mut.ac.za': 'Mangosuthu University of Technology (MUT)',
        'vut.ac.za': 'Vaal University of Technology (VUT)'
      };
  
      // Check domain against known university domains
      for (const [key, value] of Object.entries(domains)) {
        if (domain.includes(key)) {
          detectedUni = value;
          break;
        }
      }
  
      if (detectedUni && formData.university !== detectedUni) {
        setFormData({ ...formData, university: detectedUni });
      }
    }
  }, [formData.email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6 text-indigo-600 text-center">
          {type === 'login' ? 'Welcome Back!' : 'Join CampusTrade'}
        </h2>
        
        <div id="successMessage" className="mb-4 text-green-600 bg-green-100 p-3 rounded-lg text-center transition-opacity duration-300 opacity-0">
          Success! Redirecting you...
        </div>

        {/* Google Sign-In */}
        <div className="mb-6 flex justify-center">
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

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm border-l-4 border-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div className="group">
              <label className="block text-gray-700 mb-2 font-medium">Username</label>
              <input
                type="text"
                required
                placeholder="Choose a unique username"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">Username must be at least 3 characters</p>
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              required
              placeholder="Your university email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="relative">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={type === 'login' ? "Enter your password" : "Create a strong password"}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {type === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
            )}
          </div>
          
          {type === 'signup' && (
            <>
              <div className="relative">
                <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">University</label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                >
                  <option value="">Select your university</option>
                  {universities.map((uni, index) => (
                    <option key={index} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-2 font-medium"
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

        <p className="mt-6 text-center text-gray-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={switchType}
            className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none font-medium"
          >
            {type === 'login' ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;