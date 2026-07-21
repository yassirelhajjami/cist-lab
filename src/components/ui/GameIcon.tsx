import Image from 'next/image';

export type GameIconName =
  | 'parrot' | 'pine' | 'palm' | 'jungle-tree' | 'balloon' | 'dove'
  | 'banana' | 'treasure' | 'crown' | 'flag' | 'crate' | 'log' | 'rock'
  | 'spikes' | 'bug' | 'water' | 'sparkle' | 'forward' | 'backward'
  | 'turn' | 'jump' | 'condition' | 'repeat' | 'xp' | 'coin' | 'gem'
  | 'trophy' | 'palette' | 'bell' | 'success' | 'error' | 'monitor';

interface GameIconProps {
  name: GameIconName;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export function GameIcon({ name, className = 'h-6 w-6', alt = '', priority = false }: GameIconProps) {
  return (
    <Image
      src={`/icons/game/${name}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={384}
      height={384}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
