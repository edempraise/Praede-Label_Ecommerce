'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, isInWishlist } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isProductInWishlist = user ? useStore.getState().isInWishlist(product.id, user.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }
    
    addToCart(product, 1, product.size[0] || 'M', product.color[0] || 'Default', user.id);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your wishlist.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isProductInWishlist) {
      const wishlistItem = wishlist[user.id].find(item => item.product.id === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id, user.id);
        toast({
          title: 'Removed from Wishlist',
          description: `${product.name} has been removed from your wishlist.`,
        });
      }
    } else {
      addToWishlist(product, user.id);
      toast({
        title: 'Added to Wishlist',
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
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {product.original_price && product.original_price > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:bg-red-500 hover:text-white transition-colors shadow-md`}
            >
              <Heart className="w-4 h-4" />
            </motion.button>
          </div>
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
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">(4.5)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₦{product.original_price.toLocaleString()}
              </span>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </motion.button>
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