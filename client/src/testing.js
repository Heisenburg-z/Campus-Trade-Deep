// Update formatProductData in UserDashboard.js
const formatProductData = (listing) => {
  return {
    id: listing.listing_id,
    sellerId: listing.seller_id, // Make sure API returns seller_id
    // ... rest of existing properties
  };
};