// src/components/layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Map,
  Gamepad2,
  Code2,
  Cpu,
  Users,
  Compass,
  Trophy,
  Award,
  UserCircle,
  Menu,
  X,
  PlusSquare,
  Shield,
  FileSpreadsheet,
  Settings,
  ListTodo,
  FolderLock
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!profile) return null;

  const isAdmin = profile.role === 'admin';

  // Student Navigation Links
  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Missions Path', href: '/missions', icon: Map },
    { name: 'Code Games', href: '/games', icon: Gamepad2 },
    { name: 'Code Lab', href: '/code-lab', icon: Code2 },
    { name: 'Robotics Lab', href: '/robotics-lab', icon: Cpu },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Showcase', href: '/projects', icon: Compass },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Badges', href: '/badges', icon: Award },
    { name: 'My Profile', href: '/profile', icon: UserCircle }
  ];

  // Admin Navigation Links
  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Missions', href: '/admin/missions', icon: Map },
    { name: 'Lessons', href: '/admin/lessons', icon: ListTodo },
    { name: 'Challenges', href: '/admin/challenges', icon: Code2 },
    { name: 'Projects Queue', href: '/admin/projects', icon: Compass },
    { name: 'Community Mod', href: '/admin/community', icon: Shield },
    { name: 'Leaderboard Req', href: '/admin/leaderboard-requests', icon: Trophy },
    { name: 'Badges & Rewards', href: '/admin/badges', icon: Award },
    { name: 'Reports', href: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const NavigationMenu = () => (
    <nav className="flex flex-col space-y-1 p-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-maple-red text-white shadow-md border-l-4 border-gold-accent'
                : 'text-gray-300 hover:bg-navy-medium hover:text-white'
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-gold-accent' : 'text-gray-400'}`} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Sidebar Hamburger Toggle */}
      <div className="flex h-12 w-full items-center justify-between bg-navy-deep px-4 border-b border-navy-light/10 text-white lg:hidden">
        <span className="text-xs font-black tracking-widest uppercase">
          {isAdmin ? 'Teacher Console' : 'Student Portal'}
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-1 text-gray-300 hover:text-white"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Drawer Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-navy-deep border-r border-navy-light/25 text-white min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-navy-light/20 flex items-center space-x-2">
            {isAdmin ? (
              <Shield className="h-5 w-5 text-gold-accent" />
            ) : (
              <FolderLock className="h-5 w-5 text-maple-light" />
            )}
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              {isAdmin ? 'ADMIN NAVIGATION' : 'QUEST NAVIGATION'}
            </span>
          </div>
          <NavigationMenu />
        </div>
        
        <div className="p-4 border-t border-navy-light/20 bg-navy-dark/40 text-center">
          <p className="text-[10px] text-gray-500 font-semibold uppercase">
            CIST CODEQUEST V1.0
          </p>
        </div>
      </aside>

      {/* Mobile Drawer Slide-out overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-navy-dark/80 backdrop-blur-sm">
          <div className="w-64 bg-navy-deep text-white shadow-2xl flex flex-col h-full animate-slide-in">
            <div className="flex h-16 items-center justify-between px-4 border-b border-navy-light/20 bg-navy-dark">
              <span className="text-sm font-black uppercase tracking-widest text-gold-accent">
                Menu Path
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-navy-medium"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-2">
              <NavigationMenu />
            </div>
            <div className="p-4 border-t border-navy-light/20 bg-navy-dark/40 text-center text-[10px] text-gray-500">
              Canadian International School
            </div>
          </div>
          <div className="flex-grow" onClick={() => setMobileOpen(false)}></div>
        </div>
      )}
    </>
  );
}
