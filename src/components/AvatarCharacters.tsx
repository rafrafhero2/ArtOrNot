import { motion } from "framer-motion";

interface CharacterProps {
  size: number;
  color?: string;
  accentColor?: string;
  eyeColor?: string;
}

const CharacterWrapper = ({ children, size }: { children: React.ReactNode; size: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial="idle"
    animate="idle"
  >
    {children}
  </motion.svg>
);

const animations = {
  breathing: {
    scale: [1, 1.03, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  bouncing: {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  blinking: {
    scaleY: [1, 1, 0, 1, 1],
    transition: { duration: 3.5, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 1] }
  },
  earTwitch: {
    rotate: [0, -5, 5, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

export const BunnyCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFB8B8", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      {/* Ears */}
      <motion.path d="M35 30Q30 10 40 15L45 35" fill={color} animate={animations.earTwitch} style={{ originX: "40%", originY: "35%" }} />
      <motion.path d="M65 30Q70 10 60 15L55 35" fill={color} animate={animations.earTwitch} style={{ originX: "60%", originY: "35%" }} />
      {/* Inner Ears */}
      <path d="M37 28Q35 15 42 18L44 33" fill={accentColor} opacity="0.4" />
      <path d="M63 28Q65 15 58 18L56 33" fill={accentColor} opacity="0.4" />
      {/* Head */}
      <motion.path d="M25 55Q25 35 50 35Q75 35 75 55V75Q75 85 50 85Q25 85 25 75V55Z" fill={color} />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "55%" }}>
        <circle cx="42" cy="55" r="4" fill={eyeColor} />
        <circle cx="58" cy="55" r="4" fill={eyeColor} />
        <circle cx="42" cy="55" r="1.5" fill="black" />
        <circle cx="58" cy="55" r="1.5" fill="black" />
      </motion.g>
      {/* Nose & Whiskers */}
      <path d="M48 65L50 67L52 65H48Z" fill={accentColor} />
      <path d="M40 68Q35 68 30 65M60 68Q65 68 70 65" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </motion.g>
  </CharacterWrapper>
);

export const PandaCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.bouncing}>
      {/* Ears */}
      <circle cx="32" cy="35" r="8" fill={color} />
      <circle cx="68" cy="35" r="8" fill={color} />
      {/* Head */}
      <circle cx="50" cy="60" r="30" fill={accentColor} stroke={color} strokeWidth="4" />
      {/* Eye Patches */}
      <ellipse cx="40" cy="58" rx="8" ry="10" fill={color} transform="rotate(-15 40 58)" />
      <ellipse cx="60" cy="58" rx="8" ry="10" fill={color} transform="rotate(15 60 58)" />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "58%" }}>
        <circle cx="40" cy="58" r="2.5" fill={eyeColor} />
        <circle cx="60" cy="58" r="2.5" fill={eyeColor} />
      </motion.g>
      <path d="M47 68Q50 71 53 68" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </motion.g>
  </CharacterWrapper>
);

export const FoxCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      {/* Ears */}
      <path d="M25 45L35 15L50 40Z" fill={color} />
      <path d="M75 45L65 15L50 40Z" fill={color} />
      <path d="M30 40L35 25L42 38Z" fill={accentColor} opacity="0.4" />
      <path d="M70 40L65 25L58 38Z" fill={accentColor} opacity="0.4" />
      {/* Face */}
      <path d="M25 45Q25 35 50 35Q75 35 75 45L50 85Z" fill={color} />
      <path d="M35 55Q40 45 50 45Q60 45 65 55L50 80Z" fill={accentColor} opacity="0.1" />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "50%" }}>
        <path d="M38 52L44 50" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M62 52L56 50" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      <circle cx="50" cy="78" r="3" fill={accentColor} />
    </motion.g>
  </CharacterWrapper>
);

export const FrogCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#E8FF47" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.bouncing}>
      {/* Eye bumps */}
      <circle cx="35" cy="40" r="12" fill={color} />
      <circle cx="65" cy="40" r="12" fill={color} />
      {/* Head */}
      <ellipse cx="50" cy="65" rx="35" ry="25" fill={color} />
      <ellipse cx="50" cy="65" rx="25" ry="15" fill={accentColor} opacity="0.1" />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "40%" }}>
        <circle cx="35" cy="40" r="6" fill={eyeColor} />
        <circle cx="65" cy="40" r="6" fill={eyeColor} />
        <circle cx="35" cy="40" r="2.5" fill="black" />
        <circle cx="65" cy="40" r="2.5" fill="black" />
      </motion.g>
      {/* Mouth */}
      <path d="M35 72Q50 80 65 72" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </motion.g>
  </CharacterWrapper>
);

export const DevilCharacter = ({ size, color = "#0D0D0D", accentColor = "#E8FF47", eyeColor = "#E8FF47" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      {/* Horns */}
      <path d="M30 35Q25 15 45 30" fill={color} stroke={accentColor} strokeWidth="1" />
      <path d="M70 35Q75 15 55 30" fill={color} stroke={accentColor} strokeWidth="1" />
      {/* Head */}
      <circle cx="50" cy="60" r="28" fill={color} />
      <path d="M35 45Q50 35 65 45" fill={accentColor} opacity="0.05" />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "55%" }}>
        <path d="M38 52L46 56" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M62 52L54 56" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {/* Grin */}
      <path d="M40 72Q50 78 60 72" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
    </motion.g>
  </CharacterWrapper>
);

export const CoolCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#333333" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      <circle cx="50" cy="55" r="32" fill={color} />
      <circle cx="50" cy="55" r="28" fill={accentColor} opacity="0.05" />
      {/* Sunglasses */}
      <rect x="22" y="45" width="25" height="15" rx="4" fill={eyeColor} stroke="#555" strokeWidth="1" />
      <rect x="53" y="45" width="25" height="15" rx="4" fill={eyeColor} stroke="#555" strokeWidth="1" />
      <path d="M47 50H53" stroke="#555" strokeWidth="2" />
      {/* Glare */}
      <rect x="25" y="48" width="6" height="2" rx="1" fill="white" opacity="0.2" />
      <rect x="56" y="48" width="6" height="2" rx="1" fill="white" opacity="0.2" />
      {/* Smirk */}
      <path d="M55 75Q60 75 62 72" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </motion.g>
  </CharacterWrapper>
);

export const GhostCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.bouncing}>
      <path d="M30 45Q30 25 50 25Q70 25 70 45V75L63 68L57 75L50 68L43 75L37 68L30 75V45Z" fill={color} />
      <path d="M35 45Q35 30 50 30Q65 30 65 45" fill={accentColor} opacity="0.1" />
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "48%" }}>
        <circle cx="42" cy="48" r="4.5" fill={eyeColor} />
        <circle cx="58" cy="48" r="4.5" fill={eyeColor} />
        <circle cx="42" cy="48" r="2" fill="black" />
        <circle cx="58" cy="48" r="2" fill="black" />
      </motion.g>
    </motion.g>
  </CharacterWrapper>
);

export const RobotCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#E8FF47" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      <rect x="25" y="30" width="50" height="45" rx="6" fill={color} />
      <rect x="47" y="20" width="6" height="10" fill={color} />
      <circle cx="50" cy="20" r="3" fill={accentColor} />
      {/* Screen */}
      <rect x="32" y="38" width="36" height="20" rx="2" fill="#222" />
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "48%" }}>
        <rect x="38" y="45" width="6" height="6" rx="1" fill={eyeColor} />
        <rect x="56" y="45" width="6" height="6" rx="1" fill={eyeColor} />
      </motion.g>
      {/* Vents */}
      <rect x="40" y="65" width="20" height="2" fill={accentColor} opacity="0.2" />
      <rect x="40" y="69" width="20" height="2" fill={accentColor} opacity="0.2" />
    </motion.g>
  </CharacterWrapper>
);

export const AlienCharacter = ({ size, color = "#0D0D0D", accentColor = "#FFFFFF", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.breathing}>
      <path d="M25 50Q25 20 50 20Q75 20 75 50Q75 75 50 85Q25 75 25 50Z" fill={color} />
      <path d="M35 45Q35 25 50 25Q65 25 65 45" fill={accentColor} opacity="0.1" />
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "45%" }}>
        <ellipse cx="40" cy="48" rx="8" ry="12" fill={eyeColor} transform="rotate(-20 40 48)" />
        <ellipse cx="60" cy="48" rx="8" ry="12" fill={eyeColor} transform="rotate(20 60 48)" />
        <circle cx="40" cy="48" r="3" fill="black" transform="rotate(-20 40 48)" />
        <circle cx="60" cy="48" r="3" fill="black" transform="rotate(20 60 48)" />
      </motion.g>
    </motion.g>
  </CharacterWrapper>
);

export const TigerCharacter = ({ size, color = "#0D0D0D", accentColor = "#E8FF47", eyeColor = "#FFFFFF" }: CharacterProps) => (
  <CharacterWrapper size={size}>
    <motion.g animate={animations.bouncing}>
      <circle cx="32" cy="40" r="8" fill={color} />
      <circle cx="68" cy="40" r="8" fill={color} />
      <circle cx="50" cy="60" r="30" fill={color} />
      <circle cx="50" cy="60" r="22" fill={accentColor} opacity="0.05" />
      {/* Stripes */}
      <path d="M30 50L40 55M30 60L40 65M70 50L60 55M70 60L60 65" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <motion.g animate={animations.blinking} style={{ originX: "50%", originY: "55%" }}>
        <path d="M40 52Q40 48 45 52" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M60 52Q60 48 55 52" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
      {/* Snout */}
      <circle cx="50" cy="72" r="6" fill={accentColor} opacity="0.1" />
      <path d="M48 70L50 72L52 70" stroke={accentColor} strokeWidth="1" fill="none" />
    </motion.g>
  </CharacterWrapper>
);

export const CHARACTER_MAP: Record<string, React.ComponentType<CharacterProps>> = {
  bunny: BunnyCharacter,
  panda: PandaCharacter,
  fox: FoxCharacter,
  frog: FrogCharacter,
  devil: DevilCharacter,
  cool: CoolCharacter,
  ghost: GhostCharacter,
  robot: RobotCharacter,
  alien: AlienCharacter,
  tiger: TigerCharacter,
};
