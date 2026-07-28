import React from 'react';

export type TempleIconName =
  | 'forward' | 'turn-left' | 'turn-right' | 'f1' | 'f2'
  | 'paint-red' | 'paint-green' | 'paint-blue'
  | 'play' | 'pause' | 'step' | 'reset' | 'speed'
  | 'star' | 'lock';

interface TempleIconProps {
  name: TempleIconName;
  className?: string;
}

export function TempleIcon({ name, className = 'h-6 w-6' }: TempleIconProps) {
  const stroke = 'currentColor';
  const common = { fill: 'none', stroke, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const glyph = (() => {
    switch (name) {
      case 'forward': return <><path {...common} d="M16 24V8M10 14l6-6 6 6" /><path {...common} d="M11 25h10" opacity=".45" /></>;
      case 'turn-left': return <><path {...common} d="M23 23v-5a7 7 0 0 0-7-7H9" /><path {...common} d="m13 7-4 4 4 4" /></>;
      case 'turn-right': return <><path {...common} d="M9 23v-5a7 7 0 0 1 7-7h7" /><path {...common} d="m19 7 4 4-4 4" /></>;
      case 'f1': return <><path {...common} d="M10 23V9h8M10 15h6" /><path {...common} d="M20 14l3-2v11" /></>;
      case 'f2': return <><path {...common} d="M8 23V9h8M8 15h6" /><path {...common} d="M19 15c0-4 6-4 6 0 0 2-2 3-6 8h6" /></>;
      case 'paint-red': case 'paint-green': case 'paint-blue': {
        const color = name === 'paint-red' ? '#fb7185' : name === 'paint-green' ? '#34d399' : '#38bdf8';
        return <><path {...common} d="m9 20 10-10 4 4-10 10-6 1 2-5Z" /><path d="M18 11l4 4" stroke={color} strokeWidth="4" /><circle cx="9" cy="24" r="2" fill={color} /></>;
      }
      case 'play': return <path d="m12 8 12 8-12 8V8Z" fill="currentColor" />;
      case 'pause': return <><rect x="10" y="8" width="4" height="16" rx="2" fill="currentColor" /><rect x="18" y="8" width="4" height="16" rx="2" fill="currentColor" /></>;
      case 'step': return <><path d="m9 8 10 8L9 24V8Z" fill="currentColor" /><rect x="21" y="8" width="3" height="16" rx="1.5" fill="currentColor" /></>;
      case 'reset': return <><path {...common} d="M9 10a9 9 0 1 1-1 11" /><path {...common} d="M9 5v6H3" /></>;
      case 'speed': return <><path {...common} d="M5 16h14M12 9l7 7-7 7" /><path {...common} d="M4 10h5M4 22h5" opacity=".55" /></>;
      case 'star': return <path d="m16 5 3.2 6.5 7.2 1-5.2 5 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5 7.2-1L16 5Z" fill="currentColor" stroke="white" strokeWidth="1" />;
      case 'lock': return <><rect x="8" y="14" width="16" height="12" rx="4" fill="currentColor" opacity=".25" /><path {...common} d="M11 14v-3a5 5 0 0 1 10 0v3M16 19v3" /></>;
    }
  })();

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2 27 8v16l-11 6L5 24V8l11-6Z" fill="currentColor" opacity=".08" />
      {glyph}
    </svg>
  );
}
