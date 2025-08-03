"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    currentUserId,
  } = useStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const isWishlisted = currentUserId
    ? isInWishlist(product.id, currentUserId)
    : false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (!currentUserId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (isWishlisted) {
      const wishlistItem = useStore
        .getState()
        .wishlist[currentUserId]?.find((i) => i.product.id === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id, currentUserId);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      }
    } else {
      addToWishlist(product, currentUserId);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? "text-red-500 fill-current"
                  : "text-gray-500"
              }`}
            />
          </motion.button>
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
