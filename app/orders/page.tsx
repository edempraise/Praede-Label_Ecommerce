"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import Image from "next/image";

const OrdersPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*, items(*, product(*))")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data as any[]);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleOrderClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => handleOrderClick(order.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {order.items && order.items.length > 0 && (
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                    <Image
                      src={order.items[0].product.images[0] || '/placeholder-product.jpg'}
                      alt={order.items[0].product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold">Order ID: {order.id}</p>
                  <p>Total: ₦{order.total_amount.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    order.status === "paid" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
