import { Order } from "@/types";

export const getNewOrderEmailForCustomer = (order: Order) => {
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been confirmed!`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Hi ${order.customer_name},</p>
      <p>We've received your order #${order.id} and are getting it ready.</p>
      <p>Total Amount: ₦${order.total_amount.toLocaleString()}</p>
      <p>We'll notify you again when your order status changes.</p>
      <p>Thank you for shopping with us!</p>
    `,
  };
};

export const getNewOrderEmailForAdmin = (order: Order) => {
  return {
    subject: `New Order #${order.id}`,
    html: `
      <h1>New Order Received</h1>
      <p>A new order has been placed on Praéde.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
      <p><strong>Total Amount:</strong> ₦${order.total_amount.toLocaleString()}</p>
      <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`}>View Order Details</a>
    `,
  };
};

export const getOrderShippedEmailForCustomer = (order: Order) => {
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been shipped!`,
    html: `
      <h1>Your order is on its way!</h1>
      <p>Hi ${order.customer_name},</p>
      <p>Great news! Your order #${order.id} has been shipped and is on its way to you.</p>
      <p>You can view your order details here: <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`}>View Order</a></p>
      <p>Thank you for shopping with us!</p>
    `,
  };
};

export const getOrderDeliveredEmailForCustomer = (order: Order) => {
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been delivered!`,
    html: `
      <h1>Your order has arrived!</h1>
      <p>Hi ${order.customer_name},</p>
      <p>Your order #${order.id} has been delivered. We hope you enjoy your purchase!</p>
      <p>You can view your order details here: <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`}>View Order</a></p>
      <p>Thank you for shopping with us!</p>
    `,
  };
};

export const getOrderStatusUpdateEmailForCustomer = (order: Order) => {
  const statusText = order.status.replace("_", " ");
  return {
    to: order.customer_email,
    subject: `Your Order #${order.id} has been updated to: ${statusText}`,
    html: `
      <h1>Order Status Update</h1>
      <p>Hi ${order.customer_name},</p>
      <p>The status of your order #${order.id} has been updated to <strong>${statusText}</strong>.</p>
      <p>You can view your order details here: <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`}>View Order</a></p>
      <p>Thank you for shopping with us!</p>
    `,
  };
};

export const getOrderShippedEmailForAdmin = (order: Order) => {
    return {
      subject: `Order #${order.id} has been shipped`,
      html: `
        <h1>Order Shipped</h1>
        <p>Order #${order.id} for customer ${order.customer_name} has been marked as shipped.</p>
        <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`}>View Order Details</a>
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
  return {
    subject: `Order #${order.id} has been cancelled`,
    html: `
      <h1>Order Cancelled</h1>
      <p>Order #${order.id} for customer ${order.customer_name} has been cancelled.</p>
      <p><strong>Reason:</strong> ${order.cancellation_reason || 'No reason provided.'}</p>
      <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`}>View Order Details</a>
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
    return {
      subject: `Order #${order.id} has been delivered`,
      html: `
        <h1>Order Delivered</h1>
        <p>Order #${order.id} for customer ${order.customer_name} has been marked as delivered.</p>
        <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`}>View Order Details</a>
      `,
    };
  };
