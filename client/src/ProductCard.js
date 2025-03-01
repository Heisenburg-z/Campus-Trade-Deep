import React from 'react';



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

  export default ProductCard;
  