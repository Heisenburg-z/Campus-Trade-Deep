import React from 'react';

const ProductModal = ({ product, onAddToCart, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4">{product.title}</h2>
        <img 
          src={product.image} 
          className="w-full h-64 object-cover rounded-lg mb-4"
          alt={product.title}
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600"><strong>Price:</strong> R{product.price}</p>
            <p className="text-gray-600"><strong>Condition:</strong> {product.condition}</p>
          </div>
          <div>
            <p className="text-gray-600"><strong>Category:</strong> {product.category}</p>
            <p className="text-gray-600"><strong>Location:</strong> {product.location}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <div className="flex gap-4">
          <button
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
          >
            Add to Cart
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;