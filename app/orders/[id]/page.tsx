"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import { Order } from "@/types";
import { getOrderById } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

const OrderDetailPage = () => {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const orderData = await getOrderById(params.id as string);
        setOrder(orderData);
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Order
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600">
            The order you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.id}
          </h1>
          <p className="text-gray-600">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </motion.div>

        {order.status === 'cancelled' && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <h3 className="font-bold">Order Cancelled</h3>
            <p><strong>Reason:</strong> {order.cancellation_reason || 'No reason provided.'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color: {item.color} | Qty:{" "}
                        {item.quantity}
                      </p>
                      <p className="font-medium text-gray-900">
                        ₦{item.product.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer_name}
                    </p>
                    <p className="text-gray-600">{order.shipping_address}</p>
                    <p className="text-gray-600">
                      {order.city}, {order.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-600">{order.customer_phone}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-600">{order.customer_email}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">
                    ₦{order.total_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                {order.payment_receipt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Receipt</span>
                    <a
                      href={order.payment_receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="lg:col-span-1">
            <OrderTimeline status={order.status} createdAt={order.created_at} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
