// src/context/AppContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, getRankAndLevelForXP } from '@/lib/db';
import { completeTrustedActivity } from '@/lib/progression-client';
import { Trophy, Award } from 'lucide-react';

import { Profile, Student, Notification as DbNotification } from '@/types';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  student: Student | null;
  loading: boolean;
  notifications: DbNotification[];
  loginStreak: number;
  login: (email: string, password?: string) => ReturnType<typeof dbService.login>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  triggerNotification: (title: string, message: string, type?: string) => Promise<void>;
  addXpAndCoins: (xp: number, coins: number, reason: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  levelUpInfo: LevelUpInfo | null;
}

interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  newRank: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);
  const [loginStreak, setLoginStreak] = useState(0);
  
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const current = await dbService.getCurrentUser();
      if (current) {
        setUser(current.user);
        setProfile(current.profile);
        setStudent(current.student);
        
        // Restore login streak from localStorage
        if (current.profile.role === 'student' && typeof window !== 'undefined') {
          const streakKey = `cist_cq_streak_${current.profile.id}`;
          const storedStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
          setLoginStreak(storedStreak);
        }

        // Load notifications
        const notifs = await dbService.getNotifications(current.profile.id);
        setNotifications(notifs);
      } else {
        setUser(null);
        setProfile(null);
        setStudent(null);
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error refreshing user session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
    // refreshUser is intentionally only called once on mount.
    // Route changes do NOT re-trigger auth so we avoid N+1 Supabase calls.
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await dbService.login(email, password);
      setUser(res.user);
      setProfile(res.profile);
      setStudent(res.student);
      
      const notifs = await dbService.getNotifications(res.profile.id);
      setNotifications(notifs);

      // Trigger daily login XP (+10 XP) if it's a student and first login of day
      if (res.profile.role === 'student') {
        const lastLoginKey = `cist_cq_last_login_${res.profile.id}`;
        const streakKey = `cist_cq_streak_${res.profile.id}`;
        const todayStr = new Date().toDateString();
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
        const lastLogin = typeof window !== 'undefined' ? localStorage.getItem(lastLoginKey) : null;

        // Compute streak
        let newStreak = 1;
        if (typeof window !== 'undefined') {
          const storedStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
          if (lastLogin === yesterdayStr) {
            // Consecutive day — increment
            newStreak = storedStreak + 1;
          } else if (lastLogin === todayStr) {
            // Already logged in today — keep current streak
            newStreak = storedStreak || 1;
          }
          // else: gap > 1 day — reset to 1
          localStorage.setItem(streakKey, String(newStreak));
        }
        setLoginStreak(newStreak);

        if (lastLogin !== todayStr) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(lastLoginKey, todayStr);
          }
          // Update profile XP directly inside state and db
          const oldLevel = res.profile.level;
          const newXp = res.profile.xp + 10;
          const { level, rank } = getRankAndLevelForXP(newXp);
          
          await completeTrustedActivity({ activityType: 'daily_login' });
          
          // Re-fetch
          const updated = await dbService.getCurrentUser();
          if (updated) {
            setProfile(updated.profile);
            setStudent(updated.student);
          }
          
          if (level > oldLevel) {
            setLevelUpInfo({ oldLevel, newLevel: level, newRank: rank });
            setShowLevelUp(true);
          }
        }
      }

      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbService.logout();
      setUser(null);
      setProfile(null);
      setStudent(null);
      setNotifications([]);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerNotification = async (title: string, message: string, type = 'system') => {
    if (profile) {
      await dbService.createNotification(profile.id, title, message, type);
      const notifs = await dbService.getNotifications(profile.id);
      setNotifications(notifs);
    }
  };

  const addXpAndCoins = async (xpDelta: number, coinsDelta: number, reason: string) => {
    if (profile) {
      const oldLevel = profile.level;
      await dbService.updateXPAndCoins(profile.id, xpDelta, coinsDelta, reason);
      
      // Reload profile
      const current = await dbService.getCurrentUser();
      if (current) {
        setProfile(current.profile);
        setStudent(current.student);
        const notifs = await dbService.getNotifications(current.profile.id);
        setNotifications(notifs);
        
        // Trigger client-side animation and show level up modal
        if (current.profile.level > oldLevel) {
          setLevelUpInfo({
            oldLevel,
            newLevel: current.profile.level,
            newRank: current.profile.rank_title
          });
          setShowLevelUp(true);
          
          // Import and play canvas-confetti dynamically
          try {
            const confetti = (await import('canvas-confetti')).default;
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#0B2545', '#C53030', '#D4AF37', '#ffffff']
            });
          } catch (e) {
            console.error('Confetti play failed', e);
          }
        }
      }
    }
  };

  const refreshNotifications = async () => {
    if (profile) {
      const notifs = await dbService.getNotifications(profile.id);
      setNotifications(notifs);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        student,
        loading,
        notifications,
        loginStreak,
        login,
        logout,
        refreshUser,
        triggerNotification,
        addXpAndCoins,
        refreshNotifications,
        showLevelUp,
        setShowLevelUp,
        levelUpInfo
      }}
    >
      {children}

      {/* GLOBAL LEVEL UP SCREEN MODAL CELEBRATION */}
      {showLevelUp && levelUpInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/90 p-4 animate-fade-in">
          <div role="dialog" aria-modal="true" aria-labelledby="level-up-title" className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-gold-accent bg-navy-deep p-8 text-center shadow-2xl">
            {/* Sparkles Background Accent */}
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold-accent/15 blur-2xl"></div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-maple-red/15 blur-2xl"></div>
            
            {/* Celebration Icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gold-accent text-navy-dark shadow-lg animate-bounce">
              <Trophy className="h-12 w-12" />
            </div>

            <h1 id="level-up-title" className="mt-6 text-3xl font-extrabold text-gold-accent uppercase tracking-wider">LEVEL UP!</h1>
            <p className="mt-2 text-gray-300">Your computer science skills at CIST are growing!</p>
            
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="text-gray-400">
                <span className="block text-xs uppercase">Previous</span>
                <span className="text-2xl font-bold line-through">Level {levelUpInfo.oldLevel}</span>
              </div>
              <div className="text-gold-accent">
                <span className="block text-xs uppercase">Current</span>
                <span className="text-4xl font-extrabold animate-pulse">Level {levelUpInfo.newLevel}</span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-navy-medium/50 p-4 border border-navy-light/40">
              <div className="flex items-center justify-center space-x-2 text-white">
                <Award className="h-5 w-5 text-gold-accent" />
                <span className="font-semibold text-lg">{levelUpInfo.newRank}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">New CIST CodeQuest Rank Unlocked</p>
            </div>

            <button
              onClick={() => setShowLevelUp(false)}
              className="mt-8 w-full rounded-xl bg-maple-red py-3 font-bold text-white transition-all hover:bg-maple-light hover:shadow-lg active:scale-95"
            >
              Continue Quest
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
