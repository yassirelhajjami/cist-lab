// src/components/layout/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { XP_LEVELS } from '@/lib/db';
import { Bell, Coins, Flame, LogOut, ShieldAlert, Sparkles, User, Check } from 'lucide-react';
import Link from 'next/link';
import { dbService } from '@/lib/db';

export function getXpProgress(xp: number) {
  let prevThreshold = 0;
  let nextThreshold = 250;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].xp) {
      prevThreshold = XP_LEVELS[i].xp;
      nextThreshold = XP_LEVELS[i + 1] ? XP_LEVELS[i + 1].xp : XP_LEVELS[i].xp + 5000;
    } else {
      break;
    }
  }
  const range = nextThreshold - prevThreshold;
  const earned = xp - prevThreshold;
  const percentage = range > 0 ? Math.min(100, Math.round((earned / range) * 100)) : 100;
  return { percentage, earned, range, nextThreshold };
}

export default function Navbar() {
  const { profile, notifications, logout, refreshNotifications, loginStreak } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!profile) return null;

  const isAdmin = profile.role === 'admin';
  const xpInfo = getXpProgress(profile.xp);
  const unreadNotifs = notifications.filter(n => !n.is_read);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dbService.markNotificationRead(id);
    await refreshNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all(unreadNotifs.map(n => dbService.markNotificationRead(n.id)));
    await refreshNotifications();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-navy-light/20 bg-navy-dark px-6 text-white shadow-md">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
          <img 
            src="/cist.png" 
            alt="CIST Logo" 
            className="h-10 w-10 object-contain rounded-xl shadow-lg border border-navy-light/10 bg-white p-0.5" 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist';
            }}
          />
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">
              CIST <span className="text-gold-accent">CodeQuest</span>
            </h1>
            <span className="text-[10px] tracking-widest text-gray-400 uppercase">
              Canadian Int. School Tangier
            </span>
          </div>
        </Link>
      </div>

      {/* Gamified Statistics for Students */}
      {!isAdmin && (
        <div className="hidden md:flex items-center space-x-6">
          {/* Level Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-accent text-navy-dark font-black text-sm shadow-md">
              {profile.level}
            </div>
            <div className="w-32 lg:w-44">
              <div className="flex justify-between text-[11px] font-bold text-gray-300">
                <span>XP Progress</span>
                <span>{profile.xp} / {xpInfo.nextThreshold}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy-medium border border-navy-light/30">
                <div
                  className="h-full rounded-full gold-gradient shadow-[0_0_8px_#D4AF37]"
                  style={{ width: `${xpInfo.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Coins Count */}
          <div className="flex items-center space-x-1.5 rounded-full bg-navy-medium/60 px-3.5 py-1.5 border border-navy-light/30 shadow-inner">
            <Coins className="h-4.5 w-4.5 text-gold-accent animate-pulse" />
            <span className="text-sm font-bold text-gold-accent">{profile.coins}</span>
          </div>

          {/* Daily Streak (Mocked 3 days streak initially) */}
          <div className="flex items-center space-x-1.5 rounded-full bg-maple-red/25 px-3.5 py-1.5 border border-maple-red/35 shadow-sm text-maple-light">
            <Flame className="h-4.5 w-4.5 fill-current animate-bounce" />
            <span className="text-sm font-bold">{loginStreak} Day{loginStreak !== 1 ? 's' : ''} Streak</span>
          </div>
        </div>
      )}

      {/* Admin Flag Indicator */}
      {isAdmin && (
        <div className="hidden sm:flex items-center space-x-2 rounded-lg bg-gold-accent/10 border border-gold-accent/30 px-3 py-1.5 text-gold-accent">
          <ShieldAlert className="h-4.5 w-4.5 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">Teacher Control Deck</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center space-x-4">
        {/* Notifications Tray */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
            className="relative p-2 rounded-lg text-gray-300 hover:bg-navy-medium hover:text-white transition"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-maple-red text-[9px] font-black text-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-navy-light/40 bg-navy-medium shadow-2xl text-white overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-navy-light/20 bg-navy-dark px-4 py-3">
                <span className="font-bold text-sm">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-gold-accent hover:text-gold-light hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start space-x-3 px-4 py-3 border-b border-navy-light/10 hover:bg-navy-light/20 transition ${
                        !n.is_read ? 'bg-navy-light/10' : ''
                      }`}
                    >
                      <div className="text-lg">
                        {n.type === 'badge' ? '🏆' : n.type === 'xp' ? '⚡' : n.type === 'project' ? '🎨' : '🔔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-tight">{n.title}</p>
                        <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-gray-400 mt-1 block">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="text-gray-400 hover:text-white"
                          title="Mark read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 rounded-lg p-1 hover:bg-navy-medium transition focus:outline-none"
          >
            <img
              src={profile.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist'}
              alt={profile.full_name}
              className="h-9 w-9 rounded-lg border border-navy-light/35 bg-white shadow-sm object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist';
              }}
            />
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-white max-w-28 truncate">
                {profile.full_name}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                {profile.role}
              </span>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-navy-light/40 bg-navy-medium shadow-2xl overflow-hidden animate-fade-in">
              <div className="px-4 py-3 bg-navy-dark/40 border-b border-navy-light/20 text-xs">
                <p className="font-bold text-gray-200">Signed in as</p>
                <p className="text-gray-400 truncate mt-0.5">{profile.email}</p>
              </div>
              <div className="py-1.5">
                {!isAdmin && (
                  <Link
                    href="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-navy-light/30 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin/students"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-navy-light/30 hover:text-white"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Student Manager</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-maple-light hover:bg-maple-red/10 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
