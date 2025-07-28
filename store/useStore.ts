'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, WishlistItem, Product } from '@/types';

interface StoreState {
  cart: { [userId: string]: CartItem[] };
  wishlist: { [userId: string]: WishlistItem[] };
  addToCart: (product: Product, quantity: number, size: string, color: string, userId: string) => void;
  removeFromCart: (id: string, userId: string) => void;
  updateCartItem: (id: string, quantity: number, userId: string) => void;
  clearCart: (userId: string) => void;
  addToWishlist: (product: Product, userId: string) => void;
  removeFromWishlist: (id: string, userId: string) => void;
  getCartTotal: (userId: string) => number;
  getCartCount: (userId: string) => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: {},
      wishlist: {},
      
      addToCart: (product, quantity, size, color, userId) => {
        const userCart = get().cart[userId] || [];
        const existingItem = userCart.find(
          item => item.product.id === product.id && item.size === size && item.color === color
        );
        
        if (existingItem) {
          set(state => ({
            cart: {
              ...state.cart,
              [userId]: userCart.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            },
          }));
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            product,
            quantity,
            size,
            color
          };
          set(state => ({
            cart: {
              ...state.cart,
              [userId]: [...userCart, newItem],
            },
          }));
        }
      },
      
      removeFromCart: (id, userId) => {
        const userCart = get().cart[userId] || [];
        set(state => ({
          cart: {
            ...state.cart,
            [userId]: userCart.filter(item => item.id !== id),
          },
        }));
      },
      
      updateCartItem: (id, quantity, userId) => {
        const userCart = get().cart[userId] || [];
        if (quantity <= 0) {
          get().removeFromCart(id, userId);
          return;
        }
        
        set(state => ({
          cart: {
            ...state.cart,
            [userId]: userCart.map(item =>
              item.id === id ? { ...item, quantity } : item
            ),
          },
        }));
      },
      
      clearCart: (userId) => set(state => ({
        cart: {
          ...state.cart,
          [userId]: [],
        },
      })),
      
      addToWishlist: (product, userId) => {
        const userWishlist = get().wishlist[userId] || [];
        const exists = userWishlist.find(item => item.product.id === product.id);
        if (!exists) {
          const newItem: WishlistItem = {
            id: `wishlist-${product.id}-${Date.now()}`,
            product
          };
          set(state => ({
            wishlist: {
              ...state.wishlist,
              [userId]: [...userWishlist, newItem],
            },
          }));
        }
      },
      
      removeFromWishlist: (id, userId) => {
        const userWishlist = get().wishlist[userId] || [];
        set(state => ({
          wishlist: {
            ...state.wishlist,
            [userId]: userWishlist.filter(item => item.id !== id),
          },
        }));
      },
      
      getCartTotal: (userId) => {
        const userCart = get().cart[userId] || [];
        return userCart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      
      getCartCount: (userId) => {
        const userCart = get().cart[userId] || [];
        return userCart.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist })
    }
  )
);