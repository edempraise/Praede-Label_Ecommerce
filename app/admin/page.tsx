"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Order, Product, User } from "@/types";
import {
  getOrders,
  updateOrderStatus,
  getProducts,
  getUsers,
} from "@/lib/supabase";
import AddProductModal from "./components/AddProductModal";
import Link from "next/link";

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [allOrders, allProducts, allUsers] = await Promise.all([
          getOrders(),
          getProducts(),
          getUsers(),
        ]);
        setOrders(allOrders);
        setProducts(allProducts);
        setUsers(allUsers);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data");
        setOrders([]);
        setProducts([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as Order["status"]);
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as Order["status"] }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      // You might want to show a toast notification here
    }
  };

  const handleProductAdded = () => {
    // Refresh products list if needed
    // This could trigger a refetch of products
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "payment_review":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: `₦${orders
        .reduce((acc, order) => acc + order.total_amount, 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Total Customers",
      value: users.length,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your store from here</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
          >
            <ShoppingCart className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Orders
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              View and process orders
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
          >
            <Package className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Products
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Add, edit, and remove products
            </p>
          </Link>

          <Link
            href="/admin/customers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
          >
            <Users className="w-12 h-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Customers
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              View and manage customer accounts
            </p>
          </Link>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default AdminDashboard;
