"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />

          {product.original_price && product.original_price > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -
              {Math.round(
                ((product.original_price - product.price) /
                  product.original_price) *
                  100
              )}
              %
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(product.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.average_rating?.toFixed(1) || 0.0})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
            {product.original_price &&
              product.original_price > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₦{product.original_price.toLocaleString()}
                </span>
              )}
          </div>

          <Link href={`/products/${product.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <span>View Details</span>
            </motion.button>
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {product.color.slice(0, 3).map((color) => (
            <span
              key={color}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
            >
              {color}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
