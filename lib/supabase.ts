import { createClient } from '@supabase/supabase-js';
import { Product, Order, Category } from '@/types';

const supabaseUrl = 'https://kjnnelyffqesrmruohce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqbm5lbHlmZnFlc3JtcnVvaGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzM4MTgsImV4cCI6MjA2NzgwOTgxOH0.S3JjHOwhH3OVJ_uFb2AdphwTtoX256LJBVcY5M52sSY';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for database operations
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Shipping Information
export const getShippingInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('shipping_info')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Ignore 'not found' error
    throw error;
  }
  return data;
};

export const saveShippingInfo = async (userId: string, shippingData: any) => {
  const { data, error } = await supabase
    .from('shipping_info')
    .upsert({ user_id: userId, ...shippingData }, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }
  return data;
};

export const getAdminCount = async (): Promise<number> => {
  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('user_metadata->>is_admin', 'true');

  if (error) {
    throw new Error(`Failed to get admin count: ${error.message}`);
  }

  return count || 0;
};

export const getUsers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .eq('in_stock', true)
    .limit(8);
  
  if (error) throw error;
  return data || [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const uploadPaymentReceipt = async (file: File, orderId: string): Promise<string> => {
  const fileName = `payment-receipts/${orderId}-${Date.now()}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(fileName);
  
  return publicUrl;
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('in_stock', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('in_stock', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};