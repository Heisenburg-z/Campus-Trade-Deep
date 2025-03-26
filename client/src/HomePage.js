import React from 'react';
import { useEffect, useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import AuthModal from './AuthModal';
import axios from 'axios';


const Navbar = ({ user, onLoginClick, onSignupClick, onLogout }) => (
  <nav className="bg-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-600">CampusTrade</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-indigo-600 transition">
                <FaRegBell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700">{user.username}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-gray-600 hover:text-indigo-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Login
              </button>
              <button
                onClick={onSignupClick}
                className="border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </nav>
);


const HeroSection = () => (
  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Trade Smart, Campus Style</h1>
      <p className="text-xl mb-8">Buy, sell, and trade items with fellow students securely</p>
      <div className="flex justify-center gap-4">
        <button className="bg-white text-indigo-600 px-8 py-3 rounded-full hover:bg-gray-100 transition">
          Sell Now
        </button>
        <button className="border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-indigo-600 transition">
          Browse Items
        </button>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
    <img 
      src={product.image} 
      alt={product.title} 
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold truncate">{product.title}</h3>
        <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">
          {product.category}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-indigo-600">${product.price}</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Posted by {product.seller}</span>
        </div>
      </div>
    </div>
  </div>
);

const ProductGrid = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      title: 'Like New Calculus Textbook',
      price: 35,
      category: 'Books',
      seller: 'JohnDoe',
      description: 'Used for one semester, excellent condition with no markings.',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
    },
    {
      id: 2,
      title: 'MacBook Pro 2020',
      price: 1200,
      category: 'Electronics',
      seller: 'TechGuy',
      description: '13-inch, 256GB SSD, 16GB RAM. Perfect condition.',
      image: 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2'
    },
    {
      id: 3,
      title: 'Ergonomic Office Chair',
      price: 85,
      category: 'Furniture',
      seller: 'HomeDecor',
      description: 'Adjustable height and lumbar support. Like new.',
      image: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a'
    },
    {
      id: 4,
      title: 'Men\'s Winter Jacket',
      price: 45,
      category: 'Clothing',
      seller: 'Fashionista',
      description: 'Size L, waterproof, only worn twice.',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5'
    },
    {
      id: 5,
      title: 'Wireless Headphones',
      price: 80,
      category: 'Electronics',
      seller: 'AudioPro',
      description: 'Noise-cancelling, 20hr battery life.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    }
  ]);
  

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select className="w-full md:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Categories</option>
          <option>Books</option>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Clothing</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">CampusTrade</h3>
          <p className="text-gray-400">Connecting students through sustainable commerce.</p>
          <div className="mt-4 flex space-x-2">
            <a href="mailto:thapelondlovu74@gmail.com" className="text-gray-400 hover:text-white transition" title="Email">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/thapelo-ndlovu-1165152aa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="LinkedIn">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
            </a>
            <a href="https://twitter.com/thapelondlovu8008" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition" title="Twitter">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#projects" className="text-gray-400 hover:text-white transition">Projects</a></li>
            <li><a href="#tech-stack" className="text-gray-400 hover:text-white transition">Tech Stack</a></li>
            <li><a href="#learning-journey" className="text-gray-400 hover:text-white transition">Learning Path</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">My Platforms</h4>
          <ul className="space-y-2">
            <li><a href="https://portfolio-43d9b.web.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Portfolio</a></li>
            <li><a href="https://www.sololearn.com/en/profile/24239495" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">SoloLearn</a></li>
            <li><a href="https://www.chess.com/member/thapelo_ndlovu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Chess.com</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CampusTrade. Powered by ☕ & Late Night Coding 🌙
      </div>
    </div>
  </footer>
);

const HomePage = ({listings}) => {
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
      <HeroSection />
      <ProductGrid />
      <Footer />

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


export default HomePage;