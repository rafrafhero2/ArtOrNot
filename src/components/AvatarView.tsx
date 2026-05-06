import { AVATAR_HATS, type Avatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";

type Props = {
  avatar: Avatar;
  size?: number;
  ring?: boolean;
  ringColor?: string;
  className?: string;
};

export default function AvatarView({ avatar, size = 56, ring, ringColor, className }: Props) {
  const hat = AVATAR_HATS.find((h) => h.id === avatar.hat) ?? AVATAR_HATS[0];
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
          fontSize: size * 0.55,
          lineHeight: 1,
        }}
        aria-hidden
      >
        <span style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.15))" }}>{avatar.faceEmoji}</span>
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
