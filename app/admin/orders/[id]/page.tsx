"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import { getOrderById, updateOrderStatus } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Star,
  XCircle,
  AlertTriangle,
} from "lucide-react";

// This will be the new AdminOrderTimeline component, defined in this file for now.
const AdminOrderTimeline = ({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (status: Order["status"]) => void;
}) => {
  const steps = [
    { id: "pending", title: "Pending" },
    { id: "payment_review", title: "Payment Review" },
    { id: "paid", title: "Payment Confirmed" },
    { id: "preparing", title: "Preparing Order" },
    { id: "ready_for_delivery", title: "Ready for Delivery" },
    { id: "shipped", title: "Shipped" },
    { id: "delivered", title: "Delivered" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === order.status);

  const handleUpdate = (newStatus: Order["status"]) => {
    if (
      window.confirm(
        `Are you sure you want to update the status to "${newStatus.replace(
          "_",
          " "
        )}"?`
      )
    ) {
      onStatusUpdate(newStatus);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-6">Order Timeline</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500"
                      : isCurrent
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="text-white w-5 h-5" />
                  ) : (
                    <Clock className="text-white w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-1 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
              <div className="pt-1">
                <p
                  className={`font-semibold ${
                    isCurrent
                      ? "text-blue-600"
                      : isCompleted
                      ? "text-gray-800"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                {isCurrent && (
                  <div className="mt-2 space-x-2">
                    {index < steps.length - 1 && (
                      <button
                        onClick={() =>
                          handleUpdate(steps[index + 1].id as Order["status"])
                        }
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                      >
                        Advance to: {steps[index + 1].title}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedOrder = await getOrderById(id as string);
        if (!fetchedOrder) {
          setError("Order not found.");
        } else {
          setOrder(fetchedOrder);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: Order["status"]) => {
    if (!order) return;
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      if (!updatedOrder) {
        alert("Order not found or you don’t have permission to update.");
        return;
      }
      setOrder(updatedOrder);
      // Add a toast notification here for better UX
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status.");
    }
  };

  const confirmPayment = () => handleStatusUpdate("paid");
  const rejectPayment = () => handleStatusUpdate("pending");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-screen">
        Order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/orders"
          className="flex items-center text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Orders
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order #{order.id.substring(0, 8)}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {order.status === "payment_review" && (
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
                  Confirm Payment
                </h3>
                {order.payment_receipt ? (
                  <div>
                    <p className="mb-4">
                      A payment receipt has been uploaded. Please review it and
                      confirm the payment.
                    </p>
                    <a
                      href={order.payment_receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold mb-6 block"
                    >
                      View Payment Receipt
                    </a>
                    <img
                      src={order.payment_receipt}
                      alt="Payment Receipt"
                      className="max-w-full h-auto rounded-md border"
                    />
                    <div className="mt-6 flex space-x-4">
                      <button
                        onClick={confirmPayment}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Payment
                      </button>
                      <button
                        onClick={rejectPayment}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject Payment
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No payment receipt was uploaded for this order.
                  </p>
                )}
              </div>
            )}

            <AdminOrderTimeline
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Order Items</h3>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <li key={index} className="py-4 flex">
                    <div className="ml-4 flex-1 flex flex-col">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size}, Color: {item.color}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t text-right">
                <p className="text-lg font-bold">
                  Total: ₦{order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Customer Details</h3>
              <p>
                <strong>Name:</strong> {order.customer_name}
              </p>
              <p>
                <strong>Email:</strong> {order.customer_email}
              </p>
              <p>
                <strong>Phone:</strong> {order.customer_phone}
              </p>
              <h4 className="font-bold mt-4">Shipping Address</h4>
              <p>{order.shipping_address}</p>
              <p>
                {order.city}, {order.state}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
