
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: Category;
  description?: string;
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
