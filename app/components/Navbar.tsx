import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  const navItems = [
    { label: 'Leaderboard', href: '/' },
    { label: 'Resume', href: '/resume' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Manifest
          </Link>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 