import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Recruitment', href: '/recruitment' },
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

          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
            Join Now
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 