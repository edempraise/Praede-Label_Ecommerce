import { FC } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose }) => {
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
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={onClose} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                Products
              </Link>
              <Link href="/categories" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                Categories
              </Link>
              <Link href="/about" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                About
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors" onClick={onClose}>
                Contact
              </Link>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
