import React from 'react';
import { useEffect, useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import AuthModal from './AuthModal';
import axios from 'axios';

import {
  Star, Clock, MapPin, Tag, MessageCircle, ShoppingBag, Search, TrendingUp,
  Bell, Menu, X, BookOpen, MessageSquare, User
} from 'lucide-react';

const Navbar = ({ user, onLoginClick, onSignupClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">CampusTrade</span>
              </div>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/marketplace" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </a>
            <a href="/courses" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </a>
            <a href="/messages" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </a>
            
            {/* Search button */}
            <button 
              onClick={toggleSearch}
              className="text-gray-600 hover:text-indigo-600 transition p-2 rounded-full hover:bg-gray-100"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
          {/* User section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="text-gray-600 hover:text-indigo-600 transition relative p-2 rounded-full hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {/* User profile */}
                <div className="flex items-center gap-2 group relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user.username}</span>
                  
                  {/* Dropdown menu */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                    <div className="py-1">
                      <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                        Profile
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                        Settings
                      </a>
                      <a href="/listings" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                        My Listings
                      </a>
                      <button 
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={onLoginClick}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="border-2 border-indigo-600 text-indigo-600 px-5 py-2 rounded-lg hover:bg-indigo-50 transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu}
              className="text-gray-600 hover:text-indigo-600 transition p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <a href="/marketplace" className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Marketplace
              </a>
              <a href="/courses" className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Courses
              </a>
              <a href="/messages" className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                Messages
              </a>
              
              {user ? (
                <>
                  <a href="/profile" className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    Profile
                  </a>
                  <a href="/listings" className="px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                    My Listings
                  </a>
                  <button 
                    onClick={onLogout}
                    className="px-4 py-2 text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
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
              )}
            </div>
          </div>
        )}
        
        {/* Search bar */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 bg-white shadow-md p-4 transition-all duration-300">
            <div className="max-w-3xl mx-auto relative">
              <input 
                type="text" 
                placeholder="Search for textbooks, electronics, furniture..." 
                className="w-full py-2 px-4 pl-10 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <button 
                onClick={toggleSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};



const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div className="relative overflow-hidden text-white min-h-[600px] md:min-h-[700px]">
      {/* Background Image Section */}
      <div className="absolute inset-0 z-0">
        {/* Main background image */}
        <div className="absolute inset-0">
          <img
            src={`${process.env.PUBLIC_URL}/images/Backphoto.jpg`}
            alt="Campus marketplace background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Reduced dark overlay - less opacity */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-800/50 to-violet-900/60"></div>
        
        {/* Additional gradient for depth - reduced opacity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        
        {/* Keep your animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-indigo-300 blur-3xl"></div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-center md:text-left">
            Trade Smart,
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-300">
              Campus Style
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto md:mx-0 font-light text-center md:text-left">
            Buy, sell, and trade items with fellow students securely on our campus marketplace
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 mb-12">
            <button className="group flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-full font-medium hover:bg-gray-50 hover:shadow-lg transform hover:-translate-y-1 transition-all w-full sm:w-auto justify-center">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sell Now</span>
            </button>
            
            <button className="group flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 rounded-full font-medium hover:bg-white hover:text-indigo-700 transform hover:-translate-y-1 transition-all w-full sm:w-auto justify-center">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Browse Items</span>
            </button>
          </div>
          
          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto md:mx-0">
            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/25 hover:bg-white/20 transition-all">
              <div className="font-bold text-3xl mb-1 text-center md:text-left">1,200+</div>
              <div className="text-indigo-100 text-center md:text-left">Active listings</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/25 hover:bg-white/20 transition-all">
              <div className="font-bold text-3xl mb-1 text-center md:text-left">3,000+</div>
              <div className="text-indigo-100 text-center md:text-left">Happy students</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/25 hover:bg-white/20 transition-all">
              <div className="font-bold text-3xl mb-1 text-center md:text-left">15+</div>
              <div className="text-indigo-100 text-center md:text-left">Universities</div>
            </div>
          </div>
          
          {/* Trending badge */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1 bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white/40">
            <TrendingUp className="w-4 h-4" />
            <span>Trending on campus</span>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade - reduced opacity */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-5"></div>
    </div>
  );
};



const ProductCard = ({ product }) => {
  // Helper function to render star rating
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        // Half star - using a filled star with reduced opacity for simplicity
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400 opacity-60" />);
      } else {
        // Empty star
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">({product.ratingCount || 0})</span>
      </div>
    );
  };

  // Calculate time ago
  const getTimeAgo = (datePosted) => {
    return "2 days ago"; // This would be replaced with actual logic
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Badge for special statuses - conditionally rendered */}
      {product.isNew && (
        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          NEW
        </div>
      )}
      
      {/* Image container with hover zoom effect */}
      <div className="relative overflow-hidden h-52">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors duration-300">
              View Details
            </button>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {/* Category and time ago */}
        <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
          <div className="flex items-center">
            <Tag size={14} className="mr-1" />
            <span>{product.category}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{getTimeAgo(product.datePosted)}</span>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Price and condition */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-indigo-600">R{product.price}</span>
          {product.condition && (
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">
              {product.condition}
            </span>
          )}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-100 my-3"></div>
        
        {/* Seller info and rating TODO*/}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {product.sellerAvatar ? (
              <img 
                src={product.sellerAvatar} 
                alt={product.seller}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2">
                {product.seller.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{product.seller}</span>
          </div>
          
          {/* Seller rating */}
          {renderRating(product.sellerRating || 0)}
        </div>
        
        {/* Location and message button */}
        <div className="flex justify-between items-center mt-2 text-xs">
          {product.location && (
            <div className="flex items-center text-gray-500">
              <MapPin size={14} className="mr-1" />
              <span>{product.location}</span>
            </div>
          )}
          <button className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            <MessageCircle size={14} className="mr-1" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};



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