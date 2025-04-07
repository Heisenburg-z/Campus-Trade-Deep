import React from 'react';
import { Star, Tag, Clock, MapPin, MessageCircle } from 'lucide-react';

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
        
        {/* Seller info and rating */}
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


  export default ProductCard;
  