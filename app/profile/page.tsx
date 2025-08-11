'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

const ProfilePage = () => {
  const { currentUserId, setCurrentUserId } = useStore();
  const [email, setEmail] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) {
        setCurrentUserId(user.id);
        setEmail(user.email ?? null);
        setCustomerName(user.user_metadata.full_name || user.user_metadata.name || '');
      } else {
        setCurrentUserId(null);
        setEmail(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [setCurrentUserId]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUserId) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg"><strong>Name:</strong> {customerName}</p>
        <p className="text-lg mt-2"><strong>Email:</strong> {email}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
