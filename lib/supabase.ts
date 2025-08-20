import { createClient } from "@supabase/supabase-js";
import { Product, Order, Category } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("No product updated");
  return data[0];
};

export const deleteProduct = async (productId: string): Promise<void> => {
  // Step 1: Fetch product first (to get image paths)
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .maybeSingle();

  if (fetchError || !product) {
    throw fetchError || new Error("Product not found");
  }

  // Step 2: Delete from storage if images exist
  if (product.images && product.images.length > 0) {
    const paths: string[] = product.images
      .map((url: string): string | null => {
        try {
          // Extract everything after `/object/public/products/`
          const decoded = decodeURIComponent(url);
          const path = decoded.split("/object/public/products/")[1];
          return path || null;
        } catch (err) {
          console.error("❌ Failed to parse image path from URL:", url, err);
          return null;
        }
      })
      .filter((path: string | null): path is string => path !== null); // 👈 type explicitly added

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("products")
        .remove(paths);

      if (storageError) {
        console.error("❌ Failed to delete product images:", storageError);
      } else {
        console.log("✅ Deleted product images:", paths);
      }
    }
  }

  // Step 3: Delete reviews linked to this product
  const { error: reviewError } = await supabase
    .from("reviews")
    .delete()
    .eq("product_id", productId);

  if (reviewError) {
    console.error("❌ Failed to delete product reviews:", reviewError);
  }

  // Step 4: Finally delete the product
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteError) {
    console.error("❌ Failed to delete product:", deleteError);
    throw deleteError;
  }

  console.log("✅ Product fully deleted:", productId);
};

// ---------------- Logos ----------------
export const uploadLogo = async (file: File): Promise<string> => {
  const fileName = `logo-${Date.now()}.${file.name.split(".").pop()}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true, // ✅ allows overwriting
    });

  if (error) throw error;

  const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
  return data.publicUrl;
};

export const uploadReceipt = async (file: File): Promise<string> => {
  const fileName = `receipt-${Date.now()}.${file.name.split(".").pop()}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(fileName, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from("receipts").getPublicUrl(fileName);
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
    .upsert({ key, value }, { onConflict: "key" }) // upsert instead of update
    .select("*")
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
    .eq("is_admin", true);

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
    .gt("quantity", 0)
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

import {
  sendOrderConfirmationEmails,
  sendOrderStatusUpdateEmail,
} from "@/app/actions/send-order-emails";

export const createOrder = async (
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order> => {
  console.log("🚀 Creating order:", orderData);

  const { data: order, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("❌ Order creation failed:", error);
    throw error;
  }

  // Decrement product quantities
  if (orderData.items && orderData.items.length > 0) {
    for (const item of orderData.items) {
      const { error: updateError } = await supabase.rpc("decrement_quantity", {
        pid: item.product.id,
        qty: item.quantity,
      });

      if (updateError) {
        console.error(
          `❌ Failed to update product ${item.product.id}`,
          updateError
        );
      }
    }
  }

  // Send emails after successful order creation
  try {
    console.log("✅ Order created, now sending emails");
    await sendOrderConfirmationEmails(order);
  } catch (emailError) {
    console.error("Failed to send new order emails:", emailError);
  }

  return order;
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
  status: Order["status"],
  cancellationReason?: string
): Promise<Order> => {
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "cancelled" && cancellationReason) {
    updates.cancellation_reason = cancellationReason;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (data && (status === "shipped" || status === "delivered" || status === "cancelled")) {
    try {
      await sendOrderStatusUpdateEmail(data, status);
    } catch (emailError) {
      console.error(
        `Failed to send order status update email for order ${orderId}:`,
        emailError
      );
    }
  }

  return data;
};

// ---------------- Search ----------------
export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .gt("quantity", 0)
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
    .gt("quantity", 0)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`*`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return data as any[];
}

// ---------------- Reviews ----------------
export const getReviewsByProductId = async (productId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users(id, email)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createReview = async (review: {
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
}) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
};
