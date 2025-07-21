'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, WishlistItem, Product } from '@/types';

interface StoreState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      
      addToCart: (product, quantity, size, color) => {
        const existingItem = get().cart.find(
          item => item.product.id === product.id && item.size === size && item.color === color
        );
        
        if (existingItem) {
          set({
            cart: get().cart.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          const newItem: CartItem = {
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            product,
            quantity,
            size,
            color
          };
          set({ cart: [...get().cart, newItem] });
        }
      },
      
      removeFromCart: (id) => {
        set({ cart: get().cart.filter(item => item.id !== id) });
      },
      
      updateCartItem: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        set({
          cart: get().cart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => set({ cart: [] }),
      
      addToWishlist: (product) => {
        const exists = get().wishlist.find(item => item.product.id === product.id);
        if (!exists) {
          const newItem: WishlistItem = {
            id: `wishlist-${product.id}-${Date.now()}`,
            product
          };
          set({ wishlist: [...get().wishlist, newItem] });
        }
      },
      
      removeFromWishlist: (id) => {
        set({ wishlist: get().wishlist.filter(item => item.id !== id) });
      },
      
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist })
    }
  )
);