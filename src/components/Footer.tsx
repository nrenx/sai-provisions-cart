
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white mt-16">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Vijaya Sai Provisions</h3>
            <p className="text-gray-300 mb-4">
              Your one-stop shop for all grocery needs with free delivery.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors">Products</a>
              </li>
              <li>
                <a href="/cart" className="text-gray-300 hover:text-white transition-colors">Cart</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="flex items-center mb-3">
              <Phone size={18} className="mr-2" />
              <span className="text-gray-300">Phone/WhatsApp: 9951690420</span>
            </div>
            <div className="flex items-center mb-3">
              <Mail size={18} className="mr-2" />
              <span className="text-gray-300">info@vijayasai.com</span>
            </div>
            <div className="flex items-start">
              <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
              <span className="text-gray-300">123 Main Street, Hyderabad, Telangana, India</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Vijaya Sai Provisions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
