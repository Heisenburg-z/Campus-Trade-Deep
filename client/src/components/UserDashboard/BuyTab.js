import React, { useState } from 'react';
import ProductCard from '../../ProductCard';
import ProductModal from '../ProductModal';

const BuyTab = ({ 
  listings, 
  isLoading, 
  error, 
  page, 
  hasMore, 
  setPage, 
  setIsLoading, 
  setError, 
  setListings, 
  setHasMore, 
  activeTab 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const formatProductData = (listing) => {
    return {
      id: listing.listing_id,
      sellerId: listing.seller_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      image: listing.image_url,
      category: 'Textbooks',
      condition: listing.condition,
      seller: listing.username,
      sellerAvatar: listing.seller_avatar,
      sellerRating: 4.5,
      ratingCount: 10,
      location: listing.seller_university,
      datePosted: listing.created_at,
      isNew: new Date(listing.created_at) > new Date(Date.now() - 86400000)
    };
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    setSelectedProduct(null);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Note: You'll need to implement the handleMessageClick function here
  // or pass it as a prop from the parent component

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Marketplace</h2>
        
        {isLoading && page === 1 && (
          <div className="flex justify-center p-8">
            <p>Loading listings...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {!isLoading && listings.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-500">No listings available at the moment.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(item => (
            <ProductCard
              key={item.listing_id}
              product={formatProductData(item)}
              onViewDetails={() => setSelectedProduct(formatProductData(item))}
              onMessageClick={(sellerId, listingId) => {
                // Implement message click handler
                console.log('Message clicked:', sellerId, listingId);
              }}
              className="transform transition-all hover:scale-105 hover:shadow-xl"
            />
          ))}
        </div>
        
        {hasMore && !isLoading && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={loadMore}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Load More
            </button>
          </div>
        )}
        
        {isLoading && page > 1 && (
          <div className="flex justify-center p-4 mt-4">
            <p>Loading more...</p>
          </div>
        )}
      </div>
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onAddToCart={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default BuyTab;