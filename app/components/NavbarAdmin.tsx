import React from 'react';
import Link from 'next/link';

const NavbarAdmin = () => {
  return (
    <nav className="fixed w-full z-50 bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin/leaderboard" className="text-xl font-bold">
            Manifest Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin; 