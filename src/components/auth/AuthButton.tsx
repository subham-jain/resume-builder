'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg">
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          Welcome, {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <a
        href="/auth/signin"
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Sign In
      </a>
      <a
        href="/auth/signup"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Get Started
      </a>
    </div>
  );
}
