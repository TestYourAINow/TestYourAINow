'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Headphones, Megaphone, ChevronRight, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'sango_ks@hotmail.com';

const sections = [
  {
    href: '/admin/support',
    icon: Headphones,
    title: 'Support Tickets',
    description: 'View and respond to user support requests.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    href: '/admin/announcements',
    icon: Megaphone,
    title: 'Announcements',
    description: 'Create and manage platform-wide notifications for users.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.email !== ADMIN_EMAIL) {
      router.push('/dashboard');
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-gray-500 text-sm">Platform management</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map(({ href, icon: Icon, title, description, color, bg }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="w-full flex items-center gap-5 p-5 bg-gray-900/80 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl text-left transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
