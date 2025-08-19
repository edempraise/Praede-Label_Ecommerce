import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Package, User as UserIcon, LogIn, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';
import { getCategories } from '@/app/actions/get-categories';
import { Category } from '@/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  cartCount: number;
  wishlistCount: number;
  handleSignOut: () => void;
  handleAuthRequired: (action: string) => boolean;
}

const MobileMenu: FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  cartCount,
  wishlistCount,
  handleSignOut,
  handleAuthRequired,
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleLinkClick = (path: string, authRequiredAction?: string) => {
    if (authRequiredAction) {
      if (handleAuthRequired(authRequiredAction)) {
        router.push(path);
        onClose();
      }
    } else {
      router.push(path);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={onClose} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
              <Link href="/products" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                <Package className="w-5 h-5" />
                Products
              </Link>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <Package className="w-5 h-5" />
                    Categories
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?category=${category.name}`}
                        className="block py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={onClose}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Link href="/about" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                <UserIcon className="w-5 h-5" />
                About
              </Link>

              <div className="border-t my-2"></div>

              {!user?.user_metadata.is_admin && (
                <>
                  <button onClick={() => handleLinkClick('/cart', 'cart')} className="w-full flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                    {cartCount > 0 && <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                  </button>
                  <button onClick={() => handleLinkClick('/wishlist', 'wishlist')} className="w-full flex items-center gap-2 py-2 text-gray-700 hover:text-red-600 transition-colors">
                    <Heart className="w-5 h-5" />
                    Wishlist
                    {wishlistCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>}
                  </button>
                </>
              )}

              <div className="border-t my-2"></div>

              {user ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="profile">
                    <AccordionTrigger className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                      <UserIcon className="w-5 h-5" />
                      Profile
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                      {user.user_metadata.is_admin ? (
                        <Link href="/admin" className="block py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={onClose}>
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link href="/profile" className="block py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={onClose}>
                            My Profile
                          </Link>
                          <Link href="/orders" className="block py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={onClose}>
                            My Orders
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          onClose();
                        }}
                        className="w-full text-left flex items-center gap-2 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
