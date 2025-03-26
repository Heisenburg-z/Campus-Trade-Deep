import React from 'react';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const Navbar = ({ onLoginClick, onSignupClick }) => (
  <nav className="bg-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-600">CampusTrade</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#/" className="text-gray-600 hover:text-indigo-600 transition">Home</a>
          <a href="#/" className="text-gray-600 hover:text-indigo-600 transition">Sell Item</a>
          <a href="#/" className="text-gray-600 hover:text-indigo-600 transition">My Listings</a>
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
// Auth Modal Component <0730153735>
const AuthModal = ({ type, onClose, switchType }) => {
  const isLogin = type === 'login';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your authentication logic here
    console.log(`${type} with:`, formData);
    onClose();
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
        <h2 className="text-3xl font-bold mb-6 text-indigo-600">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
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
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={switchType}
            className="text-indigo-600 hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};
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
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#/" className="text-gray-400 hover:text-white transition">About Us</a></li>
            <li><a href="#/" className="text-gray-400 hover:text-white transition">FAQ</a></li>
            <li><a href="#/" className="text-gray-400 hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>
          <div className="flex space-x-4">
            <a href="#/" className="text-gray-400 hover:text-white transition">
              <span className="sr-only">Facebook</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Add other social icons */}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

const HomePage = ({listings}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState('login');

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const switchAuthType = () => {
    setAuthType(prev => prev === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onLoginClick={() => {
          setAuthType('login');
          setShowAuthModal(true);
        }}
        onSignupClick={() => {
          setAuthType('signup');
          setShowAuthModal(true);
        }}
      />
      <HeroSection />
      <ProductGrid />
      <Footer />

      {showAuthModal && (
        <AuthModal
          type={authType}
          onClose={handleAuthModalClose}
          switchType={switchAuthType}
        />
      )}
    </div>
  );
};


export default HomePage;