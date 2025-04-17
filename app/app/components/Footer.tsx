import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Roster', href: '/roster' },
        { label: 'Media', href: '/media' },
        { label: 'Recruitment', href: '/recruitment' },
        { label: 'Shop', href: '/shop' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Guild Rules', href: '/rules' },
        { label: 'Node War Schedule', href: '/schedule' },
        { label: 'Guides', href: '/guides' },
        { label: 'Guild Tier List', href: '/tier-list' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Manifest</h2>
            <p className="text-gray-400">Disbanded since 2018.</p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest guild memes
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg flex-1"
              />
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Manifest. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 