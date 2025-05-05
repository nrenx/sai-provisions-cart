
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Product, CartItem, CustomerInfo } from '../types';
import { toast } from "@/components/ui/sonner";

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: (info: CustomerInfo) => void;
  generateWhatsAppLink: () => string;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
    
    if (savedCustomerInfo) {
      try {
        setCustomerInfo(JSON.parse(savedCustomerInfo));
      } catch (error) {
        console.error("Error parsing customer info:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save customer info to localStorage whenever it changes
  useEffect(() => {
    if (customerInfo) {
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    }
  }, [customerInfo]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        const updatedItems = prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        toast(`Added ${product.name} to cart`);
        return updatedItems;
      } else {
        toast(`Added ${product.name} to cart`);
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const generateWhatsAppLink = () => {
    if (cartItems.length === 0) return "";
    
    const phoneNumber = "919951690420";
    
    let message = "🛒 *New Order from Vijaya Sai Provisions* 🛒\n\n";
    
    if (customerInfo) {
      message += `*Customer Details*\n`;
      message += `Name: ${customerInfo.name}\n`;
      message += `Phone: ${customerInfo.phone}\n`;
      message += `Address: ${customerInfo.address}\n\n`;
    }
    
    message += "*Order Summary*\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} - ₹${item.product.price} x ${item.quantity} = ₹${item.product.price * item.quantity}\n`;
    });
    
    message += `\n*Total Amount: ₹${getCartTotal()}*\n\n`;
    message += "Thank you for your order!";
    
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    customerInfo,
    setCustomerInfo,
    generateWhatsAppLink
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
