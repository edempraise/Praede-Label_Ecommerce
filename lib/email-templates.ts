import { Order } from "@/types";

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error("Missing environment variable: SITE_URL");
}

export const getNewOrderEmailForCustomer = (order: Order) => {
  return {
    to: order.customer_email,
    subject: `🎁Yay! We’ve received your order!`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Hi ${order.customer_name},</p>
      <p>We’ll keep you posted as your order #${order.id} makes its way to you.</p>
      <p>Total Amount: ₦${order.total_amount.toLocaleString()}</p>
      <p>Thank you for choosing us! </p>
    `,
  };
};

export const getNewOrderEmailForAdmin = (order: Order) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
  return {
    subject: `New Order #${order.id}`,
    html: `
      <h1>New Order Received</h1>
      <p>A new order has been placed on Praéde.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Total Amount:</strong> ₦${order.total_amount.toLocaleString()}</p>
      <a href="${url}">View Order Details</a>
    `,
  };
};

export const getOrderShippedEmailForCustomer = (order: Order) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`;
  return {
    to: order.customer_email,
    subject: `🚚Great News! Your order is on the move!`,
    html: `
      <h1>🚚Great News! Your order is on the move!</h1>
      <p>Hi ${order.customer_name},</p>
      <p>Order #${order.id} has been packed with care and it’s now en route to you. </p>
      <p>You can view your order details here: <a href="${url}">View Order</a></p>
      <p>Thank you for shopping with us!</p>
    `,
  };
};

export const getOrderDeliveredEmailForCustomer = (order: Order) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`;
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been delivered!`,
    html: `
      <h1>Your order has reached its new home enjoy every bit.</h1>
      <p>Hi ${order.customer_name},</p>
      <p>Your order #${order.id} has been delivered. Here’s to many more happy unboxing together.</p>
      <p>We’d love to hear what you think, please take a moment to rate and review your package: <a href="${url}">View Order</a></p>
      <p>Your feedback helps us grow and glow!</p>
    `,
  };
};


export const getOrderShippedEmailForAdmin = (order: Order) => {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
    return {
      subject: `Order #${order.id} has been shipped`,
      html: `
        <h1>Order Shipped</h1>
        <p>Order #${order.id} for customer ${order.customer_name} has been marked as shipped.</p>
        <a href="${url}">View Order Details</a>
      `,
    };
  };

export const getOrderCancelledEmailForCustomer = (order: Order) => {
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been cancelled`,
    html: `
      <h1>Your Order Has Been Cancelled</h1>
      <p>Hi ${order.customer_name},</p>
      <p>We're sorry to see you go. Your order #${order.id} has been successfully cancelled.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
    `,
  };
};

export const getOrderCancelledEmailForAdmin = (order: Order) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
  return {
    subject: `Order #${order.id} has been cancelled`,
    html: `
      <h1>Order Cancelled</h1>
      <p>Order #${order.id} for customer ${order.customer_name} has been cancelled.</p>
      <p><strong>Reason:</strong> ${order.cancellation_reason || 'No reason provided.'}</p>
      <a href="${url}">View Order Details</a>
    `,
  };
};

export const getAttemptedUserDeletionEmailForAdmin = (
  userIdToDelete: string,
  adminId: string
) => {
  return {
    subject: `[Security Alert] Attempted User Deletion`,
    html: `
      <h1>Attempted User Deletion</h1>
      <p>An admin has attempted to delete a user. As per security policy, user deletion is disabled.</p>
      <p><strong>Admin ID:</strong> ${adminId}</p>
      <p><strong>User ID to Delete:</strong> ${userIdToDelete}</p>
    `,
  };
};

  export const getOrderDeliveredEmailForAdmin = (order: Order) => {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
    return {
      subject: `Order #${order.id} has been delivered`,
      html: `
        <h1>Order Delivered</h1>
        <p>Order #${order.id} for customer ${order.customer_name} has been marked as delivered.</p>
        <a href="${url}">View Order Details</a>
      `,
    };
  };
