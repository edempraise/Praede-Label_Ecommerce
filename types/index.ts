export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  size: string[];
  color: string[];
  images: string[];
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  items: CartItem[];
  total_amount: number;
  status: 'pending' | 'payment_review' | 'paid' | 'preparing' | 'shipped' | 'delivered';
  payment_receipt?: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
}