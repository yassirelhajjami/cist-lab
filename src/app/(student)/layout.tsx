// src/app/(student)/layout.tsx
'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import RoleGuard from '@/components/ui/RoleGuard';
import JockerAI from '@/components/ui/JockerAI';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="student">
      <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden quest-world text-slate-900">
        <Navbar />
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <JockerAI />
      </div>
    </RoleGuard>
  );
}
