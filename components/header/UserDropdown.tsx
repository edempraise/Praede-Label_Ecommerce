import { FC } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { User as UserIcon } from 'lucide-react'; // 👈 Import the icon separately

interface UserDropdownProps {
  user: User;
  handleSignOut: () => void;
}

const UserDropdown: FC<UserDropdownProps> = ({ user, handleSignOut }) => {
  return (
    <div className="relative group">
      <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
        <UserIcon className="w-6 h-6" /> {/* 👈 Use the icon here */}
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {user.user_metadata.is_admin ? (
          <Link
            href="/admin"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Admin Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My Orders
            </Link>
          </>
        )}
        <button
          onClick={handleSignOut}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
