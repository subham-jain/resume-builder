'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_EMAIL = 'jainsubham3111@gmail.com';

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [supabase]);

  if (loading || !isAdmin) {
    return null;
  }

  const isActive = pathname === '/admin' || pathname?.startsWith('/admin');

  return (
    <Link 
      href="/admin" 
      className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
        isActive 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
      }`}
    >
      Admin
    </Link>
  );
}

