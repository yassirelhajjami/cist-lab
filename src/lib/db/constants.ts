// src/lib/db/constants.ts

export const XP_LEVELS = [
  { level: 1, xp: 0, rank: 'Rookie Coder' },
  { level: 2, xp: 250, rank: 'Code Explorer' },
  { level: 3, xp: 500, rank: 'Logic Builder' },
  { level: 4, xp: 1000, rank: 'Bug Hunter' },
  { level: 5, xp: 2000, rank: 'Algorithm Master' },
  { level: 6, xp: 3500, rank: 'Robotics Engineer' },
  { level: 7, xp: 5000, rank: 'Project Creator' },
  { level: 8, xp: 7500, rank: 'CIST Tech Hero' },
  { level: 9, xp: 10000, rank: 'CIST Tech Hero' },
  { level: 10, xp: 15000, rank: 'CIST Tech Hero' }
];

export function getRankAndLevelForXP(xp: number): { level: number; rank: string } {
  let activeLevel = 1;
  let activeRank = 'Rookie Coder';
  for (const item of XP_LEVELS) {
    if (xp >= item.xp) {
      activeLevel = item.level;
      activeRank = item.rank;
    } else {
      break;
    }
  }
  return { level: activeLevel, rank: activeRank };
}
