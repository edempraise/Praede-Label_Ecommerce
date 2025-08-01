"use client";

import { motion } from "framer-motion";
import { FC } from "react";
import { CartItem } from "@/types";

interface CartReviewStepProps {
  userCart: CartItem[];
  getCartTotal: (userId: string) => number;
  handleNextStep: () => void;
  user: any; // Using any for now
}

const CartReviewStep: FC<CartReviewStepProps> = ({
  userCart,
  getCartTotal,
  handleNextStep,
  user,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Review Your Order
      </h2>

      <div className="space-y-4 mb-6">
        {userCart.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {item.product.name}
              </h3>
              <p className="text-sm text-gray-600">
                Size: {item.size} | Color: {item.color} | Qty:{" "}
                {item.quantity}
              </p>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ₦{(item.product.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between text-xl font-bold text-gray-900">
          <span>Total</span>
          <span>₦{user && getCartTotal(user.id).toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={handleNextStep}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Continue to Shipping
      </button>
    </motion.div>
  );
};

export default CartReviewStep;
