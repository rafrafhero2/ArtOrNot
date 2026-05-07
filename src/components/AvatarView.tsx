import { AVATAR_HATS, type Avatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { CHARACTER_MAP } from "./AvatarCharacters";

type Props = {
  avatar: Avatar;
  size?: number;
  ring?: boolean;
  ringColor?: string;
  className?: string;
};

export default function AvatarView({ avatar, size = 56, ring, ringColor, className }: Props) {
  if (!avatar) return null;
  const hat = AVATAR_HATS.find((h) => h.id === avatar.hat) ?? AVATAR_HATS[0];
  const Character = CHARACTER_MAP[avatar.characterId] || CHARACTER_MAP.bunny;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center select-none"
        style={{
          background: avatar.bgColor,
          boxShadow: ring ? `0 0 0 3px ${ringColor ?? "#E8FF47"}, 0 0 0 5px rgba(0,0,0,0.7)` : "inset 0 0 0 2px rgba(0,0,0,0.25)",
        }}
        aria-hidden
      >
        <Character size={size * 0.8} color={avatar.bodyColor} accentColor={avatar.accentColor} eyeColor={avatar.eyeColor} />
      </div>
      {hat.svg && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 pointer-events-none"
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: hat.svg }}
        />
      )}
    </div>
  );
}
