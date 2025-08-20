'use client';

import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Phone, Mail, Instagram } from 'lucide-react';

const Footer = () => {
  const { settings } = useSettingsStore();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/praede_?igsh=dm82bzNxMDVucmdu',
      icon: Instagram,
    },
  ];

  const contact = {
    phone: '+2348120812383',
    email: 'praedelabel@gmail.com',
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Social */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {settings.logo?.type === 'image' ? (
                <img src={settings.logo.src} alt="Logo" className="h-8 w-auto" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      settings.logo?.background?.type === 'gradient'
                        ? `linear-gradient(to ${settings.logo.background.direction}, ${settings.logo.background.colors.join(', ')})`
                        : settings.logo?.background?.color,
                  }}
                >
                  <span className="text-white font-bold text-lg">{settings.logo?.text}</span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{settings.siteName}</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Unique fashion for unique people.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center">
                <Phone className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                <span className="ml-3 text-base text-gray-500">{contact.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                <span className="ml-3 text-base text-gray-500">{contact.email}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-base text-gray-500 hover:text-gray-900">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-base text-gray-500 hover:text-gray-900">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
