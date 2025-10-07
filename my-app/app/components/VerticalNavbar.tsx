'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Sun, ChartLine, BookOpen  } from 'lucide-react';


export default function VerticalNavbar() {
  const pathname = usePathname();

  const links = [
    { href: '/checklist', label: 'Daily Journal', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/work-session', label: 'Work Session', icon: <CheckSquare className="w-5 h-5" /> },
    { href: '/timeline', label: 'Timeline', icon: <ChartLine className="w-5 h-5" /> },
  ];

  return (
    <nav className="left-0 top-0 h-screen w-56 bg-gray-900 text-white flex flex-col p-6">
      <div className="flex gap-3 items-center ml-2 text-2xl font-bold mb-6">Daylight
        <span><Sun /></span>
      </div>

      <ul className="space-y-2">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {icon}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
