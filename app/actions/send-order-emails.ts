"use server";

import { Order } from "@/types";
import { sendMail } from "@/lib/mailer";
import { getAdminEmails } from "@/lib/admin";
import {
  getNewOrderEmailForCustomer,
  getNewOrderEmailForAdmin,
  getOrderShippedEmailForCustomer,
  getOrderShippedEmailForAdmin,
  getOrderDeliveredEmailForCustomer,
  getOrderDeliveredEmailForAdmin,
} from "@/lib/email-templates";

export const sendOrderStatusUpdateEmail = async (
  order: Order,
  status: "shipped" | "delivered"
) => {
  console.log(
    `📨 Sending order status update emails for order: ${order.id}, status: ${status}`
  );

  try {
    let customerEmail;
    let adminEmailTemplate;

    if (status === "shipped") {
      customerEmail = getOrderShippedEmailForCustomer(order);
      adminEmailTemplate = getOrderShippedEmailForAdmin(order);
    } else {
      customerEmail = getOrderDeliveredEmailForCustomer(order);
      adminEmailTemplate = getOrderDeliveredEmailForAdmin(order);
    }

    // Customer mail
    await sendMail({
      to: customerEmail.to,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });

    // Admin mail
    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      await sendMail({
        to: adminEmails,
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
      });
    }

    console.log(`✅ Both customer and admin emails sent for ${status} status.`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send order ${status} emails:`, error);
    return { success: false, error };
  }
};

export const sendOrderConfirmationEmails = async (order: Order) => {
  console.log("📨 Sending order emails via Gmail for order:", order.id);

  try {
    const customerEmail = getNewOrderEmailForCustomer(order);
    const adminEmailTemplate = getNewOrderEmailForAdmin(order);

    // Customer mail
    await sendMail({
      to: customerEmail.to,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });

    // Admin mail
    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      await sendMail({
        to: adminEmails,
        subject: adminEmailTemplate.subject,
        html: adminEmailTemplate.html,
      });
    }

    console.log("✅ Both customer and admin emails sent.");
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send order emails:", error);
    return { success: false, error };
  }
};
