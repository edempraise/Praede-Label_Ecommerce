import { createClient } from "@supabase/supabase-js";
import { Product, Order, Category } from "@/types";

const supabaseUrl = "https://kjnnelyffqesrmruohce.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqbm5lbHlmZnFlc3JtcnVvaGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzM4MTgsImV4cCI6MjA2NzgwOTgxOH0.S3JjHOwhH3OVJ_uFb2AdphwTtoX256LJBVcY5M52sSY";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- Products ----------------
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateProductVisibility = async (
  productId: string,
  is_visible: boolean
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update({ is_visible })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
};

// ---------------- Logos ----------------
export const uploadLogo = async (file: File): Promise<string> => {
  const fileName = `logo-${Date.now()}.${file.name.split(".").pop()}`;

  let { error } = await supabase.storage
    .from("logos")
    .update(fileName, file, { contentType: file.type });

  if (error && error.message.includes("not found")) {
    const res = await supabase.storage
      .from("logos")
      .upload(fileName, file, { contentType: file.type });
    error = res.error;
  }

  if (error) throw error;

  const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
  return data.publicUrl;
};

// ---------------- Settings ----------------
export const getSettings = async (): Promise<any> => {
  const { data, error } = await supabase.from("settings").select("*");

  if (error) throw error;

  const settings = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as any);

  return settings;
};

export const updateSetting = async (key: string, value: any): Promise<any> => {
  const { data, error } = await supabase
    .from("settings")
    .update({ value })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ---------------- Shipping Info ----------------
export const getShippingInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from("shipping_info")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

export const saveShippingInfo = async (userId: string, shippingData: any) => {
  const { data, error } = await supabase
    .from("shipping_info")
    .upsert({ user_id: userId, ...shippingData }, { onConflict: "user_id" });

  if (error) throw error;
  return data;
};

// ---------------- Users ----------------
export const getAdminCount = async (): Promise<number> => {
  const { error, count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("user_metadata->>is_admin", "true");

  if (error) {
    throw new Error(`Failed to get admin count: ${error.message}`);
  }

  return count || 0;
};

export const getUsers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "inactive"
): Promise<any> => {
  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ---------------- Orders ----------------
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .eq("in_stock", true)
    .limit(8);

  if (error) throw error;
  return data || [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
};

export const createOrder = async (
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<Order> => {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

// ---------------- Search ----------------
export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getProductsByCategory = async (
  category: string
): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      customer_name,
      customer_email,
      total_amount,
      status,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data as Order[];
}