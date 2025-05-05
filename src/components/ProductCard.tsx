
import React from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-brand-dark">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-brand-primary">₹{product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            className="btn btn-primary px-3 py-1 rounded-full flex items-center gap-1"
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
