import { AvatarData, AVATAR_HATS } from "../lib/gameData";

interface Props {
  avatar: AvatarData;
  size?: number;
  showHat?: boolean;
  className?: string;
  ring?: boolean;
  ringColor?: string;
  disconnected?: boolean;
}

export default function Avatar({
  avatar,
  size = 48,
  showHat = true,
  className = "",
  ring = false,
  ringColor = "#E8FF47",
  disconnected = false,
}: Props) {
  const hatData = AVATAR_HATS.find((h) => h.id === avatar.hat);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {ring && (
        <div
          className="absolute inset-[-4px] rounded-full animate-pulse-ring"
          style={{
            border: `2px solid ${ringColor}`,
            borderRadius: "50%",
          }}
        />
      )}
      <div
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-visible"
        style={{
          backgroundColor: disconnected ? "#444" : avatar.bgColor,
          fontSize: size * 0.5,
          filter: disconnected ? "grayscale(1)" : "none",
          opacity: disconnected ? 0.5 : 1,
        }}
      >
        <span className="select-none leading-none">{avatar.faceEmoji}</span>
      </div>
      {showHat && hatData && hatData.svg && (
        <span
          className="absolute select-none leading-none"
          style={{
            fontSize: size * 0.35,
            top: -size * 0.15,
            right: -size * 0.05,
          }}
        >
          {hatData.svg}
        </span>
      )}
      {disconnected && (
        <div
          className="absolute bottom-0 right-0 bg-[#FF6B6B] rounded-full flex items-center justify-center"
          style={{ width: size * 0.3, height: size * 0.3, fontSize: size * 0.18 }}
        >
          📡
        </div>
      )}
    </div>
  );
}
