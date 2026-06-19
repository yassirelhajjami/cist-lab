import React from 'react';
import * as Lucide from 'lucide-react';

interface BadgeIconProps {
  name: string;
  className?: string;
}

export function BadgeIcon({ name, className }: BadgeIconProps) {
  // Normalize key (e.g., 'trophy' -> 'Trophy')
  const formattedName = name
    ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    : '';

  // Map known icons and synonyms to their exact Lucide component name
  let lucideName = formattedName;
  if (
    formattedName === 'Repeat' ||
    formattedName === 'Loop' ||
    formattedName === 'Loopmaster' ||
    formattedName === 'Infinity'
  ) {
    lucideName = 'Infinity';
  } else if (
    formattedName === 'Insect' ||
    formattedName === 'Ant' ||
    formattedName === 'Bug'
  ) {
    lucideName = 'Bug';
  } else if (formattedName === 'Robot') {
    lucideName = 'Bot';
  } else if (formattedName === 'Art' || formattedName === 'Paint' || formattedName === 'Palette') {
    lucideName = 'Palette';
  } else if (formattedName === 'Power' || formattedName === 'Xp' || formattedName === 'Lightning') {
    lucideName = 'Zap';
  } else if (formattedName === 'Cup' || formattedName === 'Winner' || formattedName === 'Trophy') {
    lucideName = 'Trophy';
  }

  const IconComponent = (Lucide as any)[lucideName] || Lucide.Award;
  return <IconComponent className={className} />;
}
