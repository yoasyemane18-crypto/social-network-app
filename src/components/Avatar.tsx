export interface AvatarProps {
  initials: string;
  color?: string;
  photo?: string;
  size?: string;
  ring?: boolean;
}

export function Avatar({ initials, color, photo, size = "h-11 w-11", ring = false }: AvatarProps) {
  return (
    <div
      className={`${size} ${color ?? ""} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-meskot-cream font-serif text-sm font-bold text-meskot-cream ${
        ring ? "shadow-[0_0_0_2px_hsl(var(--mk-gold))]" : "shadow-sm"
      }`}
    >
      {photo ? <img src={photo} alt={initials} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}
