'use client';

import { useEffect, useState } from 'react';
import { supabase, getShippingInfo, saveShippingInfo } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { currentUserId, setCurrentUserId } = useStore();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    const { toast } = useToast();
  const [shippingInfo, setShippingInfo] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    const fetchUserAndShippingInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id) {
        setCurrentUserId(user.id);
        setEmail(user.email ?? null);
        const existingShippingInfo = await getShippingInfo(user.id);
        if (existingShippingInfo) {
          setShippingInfo(existingShippingInfo);
        }
      } else {
        setCurrentUserId(null);
        setEmail(null);
      }
      setLoading(false);
    };
    fetchUserAndShippingInfo();
  }, [setCurrentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

   const handleSaveShippingInfo = async () => {
    if (currentUserId) {
      try {
        await saveShippingInfo(currentUserId, shippingInfo);
        toast({
          title: 'Success',
          description: 'Shipping information saved successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save shipping information.',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUserId) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <p><strong>Email:</strong> {email}</p>
        <p><strong>User ID:</strong> {currentUserId}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="customer_name"
              value={shippingInfo.customer_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="customer_phone"
              value={shippingInfo.customer_phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
            <textarea
              name="shipping_address"
              value={shippingInfo.shipping_address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={shippingInfo.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              name="state"
              value={shippingInfo.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Kano">Kano</option>
              <option value="Rivers">Rivers</option>
              <option value="Ogun">Ogun</option>
              <option value="Kaduna">Kaduna</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSaveShippingInfo}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
          >
            Save Shipping Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
