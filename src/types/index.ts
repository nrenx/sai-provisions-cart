
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  category_id?: string | null;
  description?: string | null;
  stock_level?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type Category = 'Grains' | 'Oils' | 'Snacks' | 'Soaps' | 'Spices' | 'Others';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

// Admin types
export interface AdminProductFilter {
  category?: string | null;
  search?: string;
  stockLevel?: 'all' | 'low' | 'out';
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
}
