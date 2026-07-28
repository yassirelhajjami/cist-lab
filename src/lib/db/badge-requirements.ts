export interface BadgeActivityStats {
  lessons: number;
  challenges: number;
  missions: number;
  approvedProjects: number;
  coins: number;
  xp: number;
  level: number;
}

export interface BadgeRequirement {
  label: string;
  isMet: (stats: BadgeActivityStats) => boolean;
}

export const BADGE_TIER_ORDER = [
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

export const BADGE_REQUIREMENTS: Record<string, BadgeRequirement> = {
  'Iron Coder': {
    label: 'Reach level 10',
    isMet: ({ level }) => level >= 10
  },
  'Bronze Operator': {
    label: 'Level 10 + 20 lessons + 15 challenges + 2,000 coins',
    isMet: ({ level, lessons, challenges, coins }) => level >= 10 && lessons >= 20 && challenges >= 15 && coins >= 2000
  },
  'Silver Specialist': {
    label: 'Level 10 + 30 lessons + 25 challenges + 3 missions + 3,500 coins',
    isMet: ({ level, lessons, challenges, missions, coins }) => level >= 10 && lessons >= 30 && challenges >= 25 && missions >= 3 && coins >= 3500
  },
  'Gold Sentinel': {
    label: 'Level 10 + 45 lessons + 40 challenges + 5 missions + 5,000 coins',
    isMet: ({ level, lessons, challenges, missions, coins }) => level >= 10 && lessons >= 45 && challenges >= 40 && missions >= 5 && coins >= 5000
  },
  'Platinum Duelist': {
    label: 'Level 10 + 60 lessons + 55 challenges + 2 approved projects + 7,500 coins',
    isMet: ({ level, lessons, challenges, approvedProjects, coins }) => level >= 10 && lessons >= 60 && challenges >= 55 && approvedProjects >= 2 && coins >= 7500
  },
  'Diamond Initiator': {
    label: 'Level 10 + 80 lessons + 70 challenges + 10 missions + 25,000 XP',
    isMet: ({ level, lessons, challenges, missions, xp }) => level >= 10 && lessons >= 80 && challenges >= 70 && missions >= 10 && xp >= 25000
  },
  'Ascendant Controller': {
    label: 'Level 10 + 100 lessons + 90 challenges + 15 missions + 35,000 XP',
    isMet: ({ level, lessons, challenges, missions, xp }) => level >= 10 && lessons >= 100 && challenges >= 90 && missions >= 15 && xp >= 35000
  },
  'Immortal Sentinel': {
    label: 'Level 10 + 125 lessons + 110 challenges + 5 projects + 50,000 XP',
    isMet: ({ level, lessons, challenges, approvedProjects, xp }) => level >= 10 && lessons >= 125 && challenges >= 110 && approvedProjects >= 5 && xp >= 50000
  },
  'Radiant Legend': {
    label: 'Level 10 + 150 lessons + 140 challenges + 25 missions + 75,000 XP',
    isMet: ({ level, lessons, challenges, missions, approvedProjects, coins, xp }) => level >= 10 && lessons >= 150 && challenges >= 140 && missions >= 25 && approvedProjects >= 10 && coins >= 30000 && xp >= 75000
  }
};
