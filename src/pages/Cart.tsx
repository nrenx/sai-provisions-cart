
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerInfo } from '../types';
import CouponForm from '@/components/CouponForm';

const Cart: React.FC = () => {
  const { cartItems, getCartTotal, customerInfo, setCustomerInfo, generateWhatsAppLink } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CustomerInfo>({
    name: customerInfo?.name || '',
    phone: customerInfo?.phone || '',
    address: customerInfo?.address || '',
  });
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    isPercentage: boolean;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerInfo(formData);
    const whatsappLink = generateWhatsAppLink(appliedCoupon);
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (discountAmount: number, isPercentage: boolean, code: string) => {
    setAppliedCoupon({
      code,
      discountAmount,
      isPercentage,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculate the discount amount
  const calculateDiscountAmount = (): number => {
    if (!appliedCoupon) return 0;
    
    const subtotal = getCartTotal();
    
    if (appliedCoupon.isPercentage) {
      return (subtotal * appliedCoupon.discountAmount) / 100;
    } else {
      return Math.min(appliedCoupon.discountAmount, subtotal);
    }
  };

  // Calculate final total after discount
  const calculateFinalTotal = (): number => {
    const subtotal = getCartTotal();
    const discountAmount = calculateDiscountAmount();
    return subtotal - discountAmount;
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-16 min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingCart size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
        <Link to="/products" className="btn btn-primary px-6 py-2">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 divide-y">
            {cartItems.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-brand-soft-purple to-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-brand-dark">Order Summary</h2>
            
            {/* Coupon Section */}
            <CouponForm 
              onApplyCoupon={handleApplyCoupon} 
              onRemoveCoupon={handleRemoveCoupon} 
              appliedCoupon={appliedCoupon}
            />
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cartItems.length}):</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{calculateDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-xl text-brand-primary">₹{calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>
            
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="Enter your delivery address"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full btn btn-primary btn-lg"
                >
                  Send Order via WhatsApp
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowForm(true)} 
                className="w-full btn btn-primary btn-lg"
              >
                Proceed to Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
