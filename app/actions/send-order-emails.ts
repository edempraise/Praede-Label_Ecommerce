"use server";

import { Resend } from "resend";
import { Order } from "@/types";
import {
  getNewOrderEmailForCustomer,
  getNewOrderEmailForAdmin,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmails = async (order: Order) => {
  try {
    const customerEmail = getNewOrderEmailForCustomer(order);
    const adminEmail = getNewOrderEmailForAdmin(order);

    // Send email to customer
    await resend.emails.send({
      from: customerEmail.from,
      to: customerEmail.to,
      subject: customerEmail.subject,
      html: customerEmail.html,
    });

    // Send email to admin
    await resend.emails.send({
      from: adminEmail.from,
      to: adminEmail.to,
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    console.log("Order confirmation emails sent successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation emails:", error);
    return { success: false, error: "Failed to send emails." };
  }
};
