'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './auth/AuthButton';
import AdminLink from './AdminLink';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'
    } border-b`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            Resume Builder
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/generate" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/generate') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Generate
            </Link>
            <Link 
              href="/templates" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/templates') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Templates
            </Link>
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/dashboard') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/pricing" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActive('/pricing') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Pricing
            </Link>
            {/* Admin Link - Only show for admin */}
            {typeof window !== 'undefined' && (
              <AdminLink />
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
