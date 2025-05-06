
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
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data?.map(category => category.name) || [];
    },
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch products with their categories from Supabase
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `);

      if (error) throw error;
      return data as ProductWithCategory[] || [];
    },
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combined loading state
  const isLoading = categoriesLoading || productsLoading;

  // Apply filtering based on URL params and search term
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories?.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams, categories]);

  // Ensure products are loaded when component mounts
  useEffect(() => {
    // If products failed to load initially, try to refetch them
    if (productsError) {
      refetchProducts();
    }

    // If we have no products data but we're not in a loading or error state,
    // force a refetch (handles edge case of blank screen)
    if (!products && !productsLoading && !productsError) {
      refetchProducts();
    }
  }, [products, productsLoading, productsError, refetchProducts]);

  // Filter products by category and search term
  const filteredProducts = products?.filter(product => {
    // Apply category filter
    if (activeCategory !== "All") {
      if (!product.category || product.category.name !== activeCategory) {
        return false;
      }
    }

    // Apply search filter if searchTerm exists
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowercasedTerm) ||
        (product.category?.name &&
          product.category.name.toLowerCase().includes(lowercasedTerm)) ||
        (product.description &&
          product.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    return true;
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

  // Handle error states
  const hasError = productsError || categoriesError;

  // Function to handle manual refresh
  const handleRefresh = () => {
    refetchProducts();
    window.location.reload(); // Fallback full page refresh
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Our Products</h1>

      {/* Error State */}
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="text-red-700 font-medium mb-2">There was a problem loading products</h3>
          <p className="text-red-600 mb-3">Please try refreshing the page.</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Refresh Now
          </button>
        </div>
      )}

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("All")}
            className={`px-4 py-2 rounded-full text-sm ${
              activeCategory === "All"
                ? 'bg-green-500 text-white'
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
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid with Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="flex justify-between mt-2">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
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
          <button
            onClick={handleRefresh}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Refresh Products
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
