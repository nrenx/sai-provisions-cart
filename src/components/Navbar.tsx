
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems } = useCart();
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl md:text-2xl text-brand-primary">Vijaya Sai Provisions</span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="block md:hidden text-brand-dark"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-brand-dark hover:text-brand-primary flex items-center gap-1">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/products" className="text-brand-dark hover:text-brand-primary">Products</Link>
          <Link to="/cart" className="text-brand-dark hover:text-brand-primary flex items-center gap-1 relative">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white pb-4 px-4 shadow-lg absolute w-full">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-brand-dark hover:text-brand-primary flex items-center gap-1 py-2"
              onClick={() => setIsOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/products" 
              className="text-brand-dark hover:text-brand-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className="text-brand-dark hover:text-brand-primary flex items-center gap-1 py-2 relative"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="ml-1 bg-brand-orange text-white text-xs rounded-full px-2 py-1 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
