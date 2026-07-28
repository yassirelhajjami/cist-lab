import Image from 'next/image';
import * as Lucide from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BadgeIconProps {
  name: string;
  className?: string;
}

const GENERATED_RANK_ICONS: Record<string, string> = {
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

const LUCIDE_ICONS = Lucide as unknown as Record<string, LucideIcon>;

export function BadgeIcon({ name, className }: BadgeIconProps) {
  const formattedName = name.toLowerCase();
  const generatedIcon = GENERATED_RANK_ICONS[formattedName];

  if (generatedIcon) {
    return (
      <Image
        src={generatedIcon}
        alt=""
        aria-hidden="true"
        width={512}
        height={512}
        className={`${className || ''} object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,.38)]`}
      />
    );
  }

  const normalized = name
    ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    : '';

  const aliases: Record<string, string> = {
    Repeat: 'Infinity',
    Loop: 'Infinity',
    Loopmaster: 'Infinity',
    Infinity: 'Infinity',
    Insect: 'Bug',
    Ant: 'Bug',
    Bug: 'Bug',
    Robot: 'Bot',
    Art: 'Palette',
    Paint: 'Palette',
    Palette: 'Palette',
    Power: 'Zap',
    Xp: 'Zap',
    Lightning: 'Zap',
    Cup: 'Trophy',
    Winner: 'Trophy',
    Trophy: 'Trophy'
  };

  const IconComponent = LUCIDE_ICONS[aliases[normalized] ?? normalized] ?? Lucide.Award;
  return <IconComponent className={className} />;
}
