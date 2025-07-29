'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useStore } from "@/store/useStore";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUserId } = useStore(); // 👈 pull setter from store

  useEffect(() => {
  if (user) {
    setCurrentUserId(user.id);
  } else {
    setCurrentUserId(null);
  }
}, [user, setCurrentUserId]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setCurrentUserId(currentUser?.id || null); // 👈 sync with store
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setCurrentUserId(currentUser?.id || null); // 👈 sync with store
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setCurrentUserId]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null); // 👈 clear store on signout
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
