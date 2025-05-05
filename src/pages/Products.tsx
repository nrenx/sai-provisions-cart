
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductWithCategory } from '@/types/supabase';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch categories from Supabase
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data.map(category => category.name);
    },
    refetchOnWindowFocus: false,
  });

  // Fetch products with their categories from Supabase
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `);
      
      // Apply category filter if not "All"
      if (activeCategory !== "All") {
        // Join with categories to filter by category name
        query = query.eq('categories.name', activeCategory);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ProductWithCategory[];
    },
    refetchOnWindowFocus: false,
  });

  // Apply filtering based on URL params and search term
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories?.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams, categories]);

  // Filter products by search term
  const filteredProducts = products?.filter(product => {
    if (!searchTerm) return true;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowercasedTerm) ||
      (product.category?.name && 
        product.category.name.toLowerCase().includes(lowercasedTerm)) ||
      (product.description && 
        product.description.toLowerCase().includes(lowercasedTerm))
    );
  });

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Our Products</h1>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeCategory === "All"
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories?.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeCategory === category
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-pulse">Loading products...</div>
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url ? 
                  `${supabase.storage.from('product_images').getPublicUrl(product.image_url).data.publicUrl}` : 
                  '/placeholder.svg',
                description: product.description || undefined,
                category_id: product.category_id,
                stock_level: product.stock_level,
                created_at: product.created_at,
                updated_at: product.updated_at
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-600">No products found</h2>
          <p className="mt-2 text-gray-500">Try changing your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Products;
