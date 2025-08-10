"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { Order } from "@/types";
import { sendOrderConfirmationEmails } from "@/app/actions/send-order-emails";

export const createOrderServer = async (
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order> => {
  console.log("🚀 [server] Creating order:", orderData);

  const { data: order, error } = await supabaseServer
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("❌ Order creation failed:", error);
    throw error;
  }

  try {
    console.log("✅ [server] Order created, sending emails");
    await sendOrderConfirmationEmails(order);
  } catch (emailError) {
    console.error("⚠️ Failed to send order emails:", emailError);
  }

  return order;
};
