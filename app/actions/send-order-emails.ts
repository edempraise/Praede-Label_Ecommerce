"use server";

import { Order } from "@/types";
import { sendMail } from "@/lib/mailer";
import {
  getNewOrderEmailForCustomer,
  getNewOrderEmailForAdmin,
} from "@/lib/email-templates";

export const sendOrderConfirmationEmails = async (order: Order) => {
  console.log("📨 Sending order emails via Gmail for order:", order.id);

  try {
    const customerEmail = getNewOrderEmailForCustomer(order);
    const adminEmail = getNewOrderEmailForAdmin(order);

    // Customer mail
    await sendMail({
      to: customerEmail.to,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });

    // Admin mail
    await sendMail({
      to: adminEmail.to,
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    console.log("✅ Both customer and admin emails sent.");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send order emails:", error);
    return { success: false, error };
  }
};
