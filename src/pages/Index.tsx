
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#F7BC00] to-[#0C831F] text-white py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Vijaya Sai Provisions
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Groceries Delivered Free – Shop Now, Send on WhatsApp
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link 
                  to="/products" 
                  className="btn btn-secondary btn-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Start Shopping
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Grocery shopping" 
                className="max-w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Banner */}
      <section className="bg-gray-100 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-xl font-semibold text-[#2D3748]">Order directly on WhatsApp!</h2>
              <p className="text-gray-600">Send your grocery list to us on WhatsApp for quick delivery.</p>
            </div>
            <a 
              href="https://wa.me/919951690420" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary px-6 py-2 flex items-center gap-2"
            >
              <span>WhatsApp Now</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10 text-[#2D3748]">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Grains", "Oils", "Snacks", "Soaps", "Spices", "Others"].map((category) => (
              <Link 
                key={category} 
                to={`/products?category=${category}`} 
                className="bg-white shadow-md rounded-lg p-6 text-center transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="bg-[#F7BC00]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{category === "Grains" ? "🌾" : 
                                              category === "Oils" ? "🫙" :
                                              category === "Snacks" ? "🍪" :
                                              category === "Soaps" ? "🧼" :
                                              category === "Spices" ? "🌶️" : "🛒"}</span>
                </div>
                <h3 className="font-medium text-[#2D3748]">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10 text-[#2D3748]">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-[#0C831F]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#2D3748]">Free Delivery</h3>
              <p className="text-gray-600">We offer free delivery on all orders within the city limits.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-[#0C831F]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#2D3748]">WhatsApp Ordering</h3>
              <p className="text-gray-600">Simply send your order via WhatsApp for quick and easy shopping.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-[#0C831F]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#2D3748]">Quality Products</h3>
              <p className="text-gray-600">We stock only the freshest and highest quality groceries.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
