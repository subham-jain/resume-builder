import Link from 'next/link';
import AuthButton from './auth/AuthButton';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Resume Builder
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/templates" className="text-gray-600 hover:text-blue-600 transition-colors">
              Templates
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
