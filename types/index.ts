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
  is_visible: boolean;
  average_rating: number;
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
  status: 'pending' | 'payment_review' | 'paid' | 'preparing' | 'ready_for_delivery' | 'shipped' | 'delivered' | 'cancelled';
  payment_receipt?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  user?: User;
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
  full_name: string;
  is_admin: boolean;
  is_verified: boolean;
  status: 'active' | 'inactive';
  created_at: string;
}