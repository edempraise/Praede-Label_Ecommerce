'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X, User, ArrowLeft, Package, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/useSettingsStore';
import MobileMenu from './header/MobileMenu';
import UserDropdown from './header/UserDropdown';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, wishlist, currentUserId, getCartCount } = useStore();
  const { user, loading, signOut } = useAuth();
  const { settings } = useSettingsStore();
  const cartCount = user ? getCartCount(user.id) : 0;
  const [mounted, setMounted] = useState(false);
  const userWishlist = currentUserId ? wishlist[currentUserId] || [] : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthRequired = useCallback((action: string) => {
    if (!user) {
      router.push('/auth/login');
      return false;
    }
    return true;
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (!mounted || loading) return null;

  const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/admin/signin') || pathname.startsWith('/admin/signup');

  if (isAuthPage) {
    return (
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Praéde</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {settings.logo?.type === 'image' ? (
                <img src={settings.logo.src} alt="Logo" className="h-8 w-auto" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      settings.logo?.background?.type === 'gradient'
                        ? `linear-gradient(to ${settings.logo.background.direction}, ${settings.logo.background.colors.join(', ')})`
                        : settings.logo?.background?.color,
                  }}
                >
                  <span className="text-white font-bold text-lg">{settings.logo?.text}</span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{settings.siteName}</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              {!user?.user_metadata.is_admin && (
                <>
                  <button
                    onClick={() => router.push('/products')}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Package className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => {
                      if (handleAuthRequired('wishlist')) {
                        router.push('/wishlist');
                      }
                    }}
                    className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <Heart className="w-6 h-6" />
                    {userWishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {userWishlist.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (handleAuthRequired('cart')) {
                        router.push('/cart');
                      }
                    }}
                    className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {user ? (
                <div className="flex items-center space-x-2">
                  {user.user_metadata.is_admin && (
                    <Link href="/admin/settings" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                      <Settings className="w-6 h-6" />
                    </Link>
                  )}
                  <UserDropdown user={user} handleSignOut={handleSignOut} />
                </div>
              ) : (
                <Link href="/auth/login">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Sign In
                  </button>
                </Link>
              )}

              <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;