
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b last:border-b-0 gap-4">
      {/* Product Image - Larger on mobile, fixed size on desktop */}
      <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-contain sm:object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-3">
        {/* Product Info */}
        <div className="flex-grow">
          <h3 className="font-medium text-brand-dark text-lg">{product.name}</h3>
          <p className="text-gray-500 text-sm">
            {product.category?.name || "Uncategorized"}
          </p>
          <p className="font-semibold text-brand-primary sm:hidden mt-1">
            ₹{product.price * quantity}
          </p>
        </div>

        {/* Quantity Controls - Centered on mobile */}
        <div className="flex items-center justify-center sm:justify-start mt-2 sm:mt-0">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="mx-3 min-w-[2ch] text-center font-medium">{quantity}</span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Price and Remove - Hidden on mobile (price shown above) */}
        <div className="hidden sm:block flex-shrink-0 text-right ml-auto">
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

      {/* Remove button for mobile - Full width */}
      <button
        onClick={() => removeFromCart(product.id)}
        className="sm:hidden text-red-500 hover:text-red-700 mt-1 flex items-center text-sm justify-center w-full border border-red-200 rounded-md py-1.5"
      >
        <Trash2 size={16} className="mr-1.5" />
        Remove Item
      </button>
    </div>
  );
};

export default CartItem;
