'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Target, TrendingUp, Clock, History, Settings, Star, Layers } from 'lucide-react';

const navItems = [
  { href: '/pyramid', icon: Layers, label: 'Pyramid' },
  { href: '/today', icon: Calendar, label: 'Today' },
  { href: '/week', icon: Target, label: 'Week' },
  { href: '/month', icon: TrendingUp, label: 'Month' },
  { href: '/year', icon: Clock, label: 'Year' },
  { href: '/five-year', icon: Star, label: '5-Year' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
