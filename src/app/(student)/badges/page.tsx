// src/app/(student)/badges/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Award, Lock, Target, CheckCircle2 } from 'lucide-react';
import { BadgeIcon } from '@/components/ui/BadgeIcon';

// CodeQuest rank color themes
const rankThemes: Record<string, {
  borderColor: string;
  glowColor: string;
  textColor: string;
  badgeBg: string;
}> = {
  iron: {
    borderColor: 'border-slate-500/50',
    glowColor: 'shadow-slate-500/10 hover:shadow-slate-500/25',
    textColor: 'text-slate-400',
    badgeBg: 'bg-slate-500/15'
  },
  bronze: {
    borderColor: 'border-amber-700/50',
    glowColor: 'shadow-amber-700/10 hover:shadow-amber-700/25',
    textColor: 'text-amber-500',
    badgeBg: 'bg-amber-700/15'
  },
  silver: {
    borderColor: 'border-slate-300/50',
    glowColor: 'shadow-slate-300/10 hover:shadow-slate-300/25',
    textColor: 'text-slate-300',
    badgeBg: 'bg-slate-300/15'
  },
  gold: {
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/10 hover:shadow-yellow-500/30',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/15'
  },
  platinum: {
    borderColor: 'border-cyan-400/50',
    glowColor: 'shadow-cyan-400/10 hover:shadow-cyan-400/30',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-400/15'
  },
  diamond: {
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/10 hover:shadow-purple-500/30',
    textColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/15'
  },
  ascendant: {
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/10 hover:shadow-emerald-500/30',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15'
  },
  immortal: {
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/15 hover:shadow-rose-500/35',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/15'
  },
  radiant: {
    borderColor: 'border-orange-500/60',
    glowColor: 'shadow-orange-500/20 hover:shadow-orange-500/40 hover:border-orange-400/80',
    textColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/15'
  }
};

const getRankTheme = (badgeName: string) => {
  const normalized = badgeName.toLowerCase();
  if (normalized.includes('iron')) return rankThemes.iron;
  if (normalized.includes('bronze')) return rankThemes.bronze;
  if (normalized.includes('silver')) return rankThemes.silver;
  if (normalized.includes('gold')) return rankThemes.gold;
  if (normalized.includes('platinum')) return rankThemes.platinum;
  if (normalized.includes('diamond')) return rankThemes.diamond;
  if (normalized.includes('ascendant')) return rankThemes.ascendant;
  if (normalized.includes('immortal')) return rankThemes.immortal;
  if (normalized.includes('radiant')) return rankThemes.radiant;
  
  return rankThemes.gold;
};

const rankOrder = [
  'Iron Coder',
  'Bronze Operator',
  'Silver Specialist',
  'Gold Sentinel',
  'Platinum Duelist',
  'Diamond Initiator',
  'Ascendant Controller',
  'Immortal Sentinel',
  'Radiant Legend'
];

export default function BadgesPage() {
  const { student, loading: appLoading } = useApp();
  
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadgesData() {
      if (appLoading) return;
      try {
        const badges = await dbService.getBadges();
        
        // Sort badges based on rank order
        const sorted = [...badges].sort((a, b) => {
          const idxA = rankOrder.indexOf(a.name);
          const idxB = rankOrder.indexOf(b.name);
          return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
        });
        
        setAllBadges(sorted);
        
        if (student) {
          const earned = await dbService.getStudentBadges(student.id);
          setEarnedBadges(earned);
        } else {
          setEarnedBadges([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBadgesData();
  }, [student, appLoading]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const totalCount = allBadges.length;
  const earnedCount = earnedBadges.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Determine current tier
  let currentTier = 'Rookie Coder';
  let highestIndex = -1;
  earnedBadges.forEach((eb) => {
    const idx = rankOrder.indexOf(eb.name);
    if (idx > highestIndex) {
      highestIndex = idx;
      currentTier = eb.name;
    }
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl md:p-8">
      {/* Cyberpunk grid background lines */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(17,119,208,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(17,119,208,0.04)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Glowing Spheres */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-navy-medium/10 blur-[120px]"></div>
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-gold-accent/5 blur-[120px]"></div>

      <div className="relative z-10 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/60 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center space-x-2.5">
              <Award className="h-6.5 w-6.5 text-gold-accent" />
              <span>Rank Badges & Achievements</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Complete coding quests and evolve through the original CodeQuest crest collection
            </p>
          </div>
        </div>

        {/* Dashboard overview stats */}
        <div className="grid gap-4 sm:grid-cols-3 bg-navy-deep/20 backdrop-blur-md rounded-xl p-5 border border-navy-light/10">
          <div className="space-y-1 border-r border-slate-800/40 pr-4">
            <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Ranks Unlocked</span>
            <div className="text-2xl font-black text-white flex items-baseline space-x-1.5">
              <span>{earnedCount}</span>
              <span className="text-xs font-semibold text-slate-500">/ {totalCount}</span>
            </div>
          </div>
          <div className="space-y-1 border-r border-slate-800/40 pr-4 sm:pl-2">
            <span className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Current Tier</span>
            <div className="flex items-center gap-2 text-base font-black text-gold-accent uppercase tracking-wide truncate">
              <BadgeIcon name={currentTier.split(' ')[0]} className="h-9 w-9" />
              <span>{currentTier}</span>
            </div>
          </div>
          <div className="space-y-2 sm:pl-2">
            <div className="flex justify-between text-[9.5px] uppercase font-bold">
              <span className="text-slate-400">Unlock Progress</span>
              <span className="text-white">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-gold-accent via-orange-500 to-gold-light rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid listing */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allBadges.map((badge) => {
            const isUnlocked = earnedBadges.some((eb) => eb.id === badge.id);
            const theme = getRankTheme(badge.name);
            
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-5 backdrop-blur-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg ${
                  isUnlocked
                    ? `bg-navy-deep/20 ${theme.borderColor} ${theme.glowColor} border-t-4`
                    : `bg-navy-deep/30 ${theme.borderColor} ${theme.glowColor} hover:bg-navy-deep/50`
                }`}
              >
                <div className={`pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full ${theme.badgeBg} blur-3xl transition-opacity group-hover:opacity-100 ${isUnlocked ? 'opacity-80' : 'opacity-45'}`} />

                {/* Status indicator on top corner */}
                <div className="absolute top-4 right-4">
                  {isUnlocked ? (
                    <div className={`p-1.5 rounded-full ${theme.badgeBg} ${theme.textColor} animate-pulse`} title="Tier Unlocked">
                      <CheckCircle2 className="h-4 w-4 fill-current text-white/5" />
                    </div>
                  ) : (
                    <div className={`p-1.5 rounded-full border bg-slate-950/80 ${theme.borderColor} ${theme.textColor}`} title="Locked Tier">
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-4">
                  {/* Original CodeQuest crest container */}
                  <div className={`h-24 w-24 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300 group-hover:scale-110 ${
                    isUnlocked 
                      ? `bg-slate-900 ${theme.borderColor} shadow-inner` 
                      : `bg-slate-900/80 ${theme.borderColor} shadow-inner opacity-90`
                  }`}>
                    <BadgeIcon name={badge.icon_url} className="h-20 w-20" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className={`text-sm font-black uppercase tracking-wide ${isUnlocked ? 'text-white' : theme.textColor}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Requirement details bar */}
                <div className={`mt-5 border-t pt-3.5 flex items-center justify-between text-[9.5px] uppercase font-bold ${
                  isUnlocked ? 'border-slate-800/50 text-slate-400' : 'border-slate-800/20 text-slate-500'
                }`}>
                  <span className="flex items-center space-x-1.5">
                    <Target className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      {badge.requirement_type === 'xp' ? `Earn >= ${badge.requirement_value} XP` :
                       badge.requirement_type === 'mission' ? 'Complete path mission' :
                       badge.requirement_type === 'challenge' ? `Solve ${badge.requirement_value} challenges` :
                       badge.requirement_type === 'project' ? 'Approve showcase project' :
                       'Manual award'}
                    </span>
                  </span>
                  
                  <span className={`${theme.textColor} font-black tracking-wider`}>
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
