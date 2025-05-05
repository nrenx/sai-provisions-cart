
import React from 'react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../contexts/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-center py-4 border-b last:border-b-0">
      <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-grow ml-4">
        <h3 className="font-medium text-brand-dark">{product.name}</h3>
        <p className="text-gray-500 text-sm">Category: {product.category_id}</p>
      </div>
      
      <div className="flex-shrink-0 flex items-center ml-4">
        <button 
          onClick={() => updateQuantity(product.id, quantity - 1)}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Minus size={16} />
        </button>
        <span className="mx-3 min-w-[2ch] text-center">{quantity}</span>
        <button 
          onClick={() => updateQuantity(product.id, quantity + 1)}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="flex-shrink-0 ml-4 text-right">
        <p className="font-semibold text-brand-primary">₹{product.price * quantity}</p>
        <button 
          onClick={() => removeFromCart(product.id)}
          className="text-red-500 hover:text-red-700 mt-1 flex items-center text-sm"
        >
          <Trash2 size={14} className="mr-1" />
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
