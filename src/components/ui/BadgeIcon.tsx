import React from 'react';
import Image from 'next/image';
import * as Lucide from 'lucide-react';

interface BadgeIconProps {
  name: string;
  className?: string;
}

// 1. Iron SVG Icon
const IronIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7a8b9e" />
        <stop offset="50%" stopColor="#4a5768" />
        <stop offset="100%" stopColor="#2c3540" />
      </linearGradient>
      <linearGradient id="ironHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a5b5c7" />
        <stop offset="100%" stopColor="#3b4654" />
      </linearGradient>
    </defs>
    <polygon points="25,4 44,14 39,42 25,48 11,42 6,14" fill="url(#ironGrad)" stroke="url(#ironHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,10 38,17 34,36 25,41 16,36 12,17" fill="#1e252d" stroke="url(#ironHighlight)" strokeWidth="1.2" opacity="0.85" />
    <line x1="25" y1="14" x2="25" y2="36" stroke="url(#ironHighlight)" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// 2. Bronze SVG Icon
const BronzeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d08450" />
        <stop offset="50%" stopColor="#965225" />
        <stop offset="100%" stopColor="#5c2e11" />
      </linearGradient>
      <linearGradient id="bronzeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f5b285" />
        <stop offset="100%" stopColor="#6e3512" />
      </linearGradient>
    </defs>
    <polygon points="25,3 45,15 37,43 25,49 13,43 5,15" fill="url(#bronzeGrad)" stroke="url(#bronzeHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,11 37,18 31,37 25,41 19,37 13,18" fill="#2d1a0e" stroke="url(#bronzeHighlight)" strokeWidth="1.2" />
    <polygon points="25,16 31,28 19,28" fill="url(#bronzeGrad)" stroke="url(#bronzeHighlight)" strokeWidth="1" />
  </svg>
);

// 3. Silver SVG Icon
const SilverIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eaf0f6" />
        <stop offset="50%" stopColor="#9bb0c1" />
        <stop offset="100%" stopColor="#556c7d" />
      </linearGradient>
      <linearGradient id="silverHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#758896" />
      </linearGradient>
    </defs>
    <polygon points="25,4 46,12 40,43 25,49 10,43 4,12" fill="url(#silverGrad)" stroke="url(#silverHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,10 39,16 35,37 25,42 15,37 11,16" fill="#1b2832" stroke="url(#silverHighlight)" strokeWidth="1.2" />
    <path d="M25,15 L27,21 L33,21 L28,25 L30,31 L25,27 L20,31 L22,25 L17,21 L23,21 Z" fill="url(#silverGrad)" stroke="url(#silverHighlight)" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

// 4. Gold SVG Icon
const GoldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffe66d" />
        <stop offset="50%" stopColor="#ffb300" />
        <stop offset="100%" stopColor="#b37d00" />
      </linearGradient>
      <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff8db" />
        <stop offset="100%" stopColor="#d48f00" />
      </linearGradient>
    </defs>
    <polygon points="25,2 46,16 36,45 25,49 14,45 4,16" fill="url(#goldGrad)" stroke="url(#goldHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,9 38,18 31,39 25,42 19,39 12,18" fill="#332400" stroke="url(#goldHighlight)" strokeWidth="1.2" />
    <polygon points="25,14 29,22 37,22 30,27 32,35 25,30 18,35 20,27 13,22 21,22" fill="url(#goldGrad)" stroke="url(#goldHighlight)" strokeWidth="1" />
  </svg>
);

// 5. Platinum SVG Icon
const PlatinumIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="platGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#adffff" />
        <stop offset="50%" stopColor="#3ad5d5" />
        <stop offset="100%" stopColor="#0a7f7f" />
      </linearGradient>
      <linearGradient id="platHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e6ffff" />
        <stop offset="100%" stopColor="#1bb5b5" />
      </linearGradient>
    </defs>
    <polygon points="25,2 45,15 37,43 25,48 13,43 5,15" fill="url(#platGrad)" stroke="url(#platHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,10 38,17 32,38 25,42 18,38 12,17" fill="#032525" stroke="url(#platHighlight)" strokeWidth="1.2" />
    <polygon points="25,14 29,25 40,25 31,31 34,41 25,35 16,41 19,31 10,25 21,25" fill="url(#platGrad)" stroke="url(#platHighlight)" strokeWidth="1" />
  </svg>
);

// 6. Diamond SVG Icon
const DiamondIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e3a6ff" />
        <stop offset="50%" stopColor="#9a34d1" />
        <stop offset="100%" stopColor="#550085" />
      </linearGradient>
      <linearGradient id="diamondHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f5e0ff" />
        <stop offset="100%" stopColor="#871bbf" />
      </linearGradient>
    </defs>
    <polygon points="25,2 47,24 25,48 3,24" fill="url(#diamondGrad)" stroke="url(#diamondHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,10 40,24 25,40 10,24" fill="#200033" stroke="url(#diamondHighlight)" strokeWidth="1.2" />
    <polygon points="25,15 33,24 25,33 17,24" fill="url(#diamondGrad)" stroke="url(#diamondHighlight)" strokeWidth="1" />
  </svg>
);

// 7. Ascendant SVG Icon
const AscendantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ascGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9bf6c1" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>
      <linearGradient id="ascHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d1fae5" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <polygon points="25,2 46,11 42,42 25,49 8,42 4,11" fill="url(#ascGrad)" stroke="url(#ascHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,9 39,15 36,38 25,42 14,38 11,15" fill="#022c22" stroke="url(#ascHighlight)" strokeWidth="1.2" />
    <polygon points="25,14 29,21 37,21 31,26 33,34 25,29 17,34 19,26 13,21 21,21" fill="url(#ascGrad)" stroke="url(#ascHighlight)" strokeWidth="1" />
  </svg>
);

// 8. Immortal SVG Icon
const ImmortalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="immGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff7b88" />
        <stop offset="50%" stopColor="#bd2b37" />
        <stop offset="100%" stopColor="#5e0c13" />
      </linearGradient>
      <linearGradient id="immHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffb3bb" />
        <stop offset="100%" stopColor="#8c111c" />
      </linearGradient>
    </defs>
    <polygon points="25,3 47,13 43,44 25,49 7,44 3,13" fill="url(#immGrad)" stroke="url(#immHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,10 39,16 36,39 25,43 14,39 11,16" fill="#2d0508" stroke="url(#immHighlight)" strokeWidth="1.2" />
    <path d="M25,14 L28,21 L35,21 L29,26 L31,33 L25,28 L19,33 L21,26 L15,21 L22,21 Z" fill="url(#immGrad)" stroke="url(#immHighlight)" strokeWidth="1" />
    <line x1="25" y1="14" x2="25" y2="28" stroke="url(#immHighlight)" strokeWidth="2" />
  </svg>
);

// 9. Radiant SVG Icon
const RadiantIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="radGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffea79" />
        <stop offset="40%" stopColor="#ff6b00" />
        <stop offset="100%" stopColor="#990000" />
      </linearGradient>
      <linearGradient id="radHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ff8c00" />
      </linearGradient>
    </defs>
    <polygon points="25,1 32,15 47,15 36,25 40,40 25,32 10,40 14,25 3,15 18,15" fill="url(#radGrad)" stroke="url(#radHighlight)" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="25,9 29,18 39,18 31,24 34,34 25,28 16,34 19,24 11,18 21,18" fill="#3b0000" stroke="url(#radHighlight)" strokeWidth="1.2" />
    <polygon points="25,15 28,21 34,21 29,25 31,31 25,27 19,31 21,25 16,21 22,21" fill="url(#radGrad)" stroke="url(#radHighlight)" strokeWidth="0.8" />
  </svg>
);

export function BadgeIcon({ name, className }: BadgeIconProps) {
  const formattedName = name ? name.toLowerCase() : '';

  const generatedRankIcons: Record<string, string> = {
    iron: '/icons/ranks/iron.png',
    bronze: '/icons/ranks/bronze.png',
    silver: '/icons/ranks/silver.png',
    gold: '/icons/ranks/gold.png',
    platinum: '/icons/ranks/platinum.png',
    diamond: '/icons/ranks/diamond.png',
    ascendant: '/icons/ranks/ascendant.png',
    immortal: '/icons/ranks/immortal.png',
    radiant: '/icons/ranks/radiant.png'
  };

  if (generatedRankIcons[formattedName]) {
    return (
      <Image
        src={generatedRankIcons[formattedName]}
        alt=""
        aria-hidden="true"
        width={512}
        height={512}
        className={`${className || ''} object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,.38)]`}
      />
    );
  }

  // Normalize key for Lucide icon fallback
  const normalized = name
    ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    : '';

  let lucideName = normalized;
  if (
    normalized === 'Repeat' ||
    normalized === 'Loop' ||
    normalized === 'Loopmaster' ||
    normalized === 'Infinity'
  ) {
    lucideName = 'Infinity';
  } else if (normalized === 'Insect' || normalized === 'Ant' || normalized === 'Bug') {
    lucideName = 'Bug';
  } else if (normalized === 'Robot') {
    lucideName = 'Bot';
  } else if (normalized === 'Art' || normalized === 'Paint' || normalized === 'Palette') {
    lucideName = 'Palette';
  } else if (normalized === 'Power' || normalized === 'Xp' || normalized === 'Lightning') {
    lucideName = 'Zap';
  } else if (normalized === 'Cup' || normalized === 'Winner' || normalized === 'Trophy') {
    lucideName = 'Trophy';
  }

  const IconComponent = (Lucide as any)[lucideName] || Lucide.Award;
  return <IconComponent className={className} />;
}
