// src/components/ui/RoleGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'student' | 'any';
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { user, profile, loading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRole !== 'any' && profile.role !== allowedRole) {
      if (profile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, loading, allowedRole, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-dark text-white">
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-gold-accent border-t-transparent"></div>
          <img 
            src="/cist.png" 
            alt="CIST Logo" 
            className="absolute h-12 w-12 object-contain rounded-full bg-white p-0.5 animate-pulse-slow" 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist';
            }}
          />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wider text-gray-400 uppercase">
          Loading CodeQuest...
        </p>
      </div>
    );
  }

  if (!user || !profile || (allowedRole !== 'any' && profile.role !== allowedRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-dark text-white">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-maple-red flex items-center justify-center text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-400">Redirecting to your homepage...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
