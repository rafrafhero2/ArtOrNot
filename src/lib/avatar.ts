export type Avatar = {
  bgColor: string;
  bodyColor: string;
  accentColor: string;
  eyeColor: string;
  characterId: string;
  hat: string; // hat id, "" = none
};

export const AVATAR_BG_COLORS = [
  "#E8FF47", "#FF6B6B", "#7CC4FF", "#B388FF", "#FFB86B",
  "#6BFFB8", "#FF6BD6", "#FFE66B", "#6BD6FF", "#C7FF6B",
];

export const AVATAR_BODY_COLORS = [
  "#0D0D0D", "#FFFFFF", "#FF6B6B", "#48DBFB", "#FFD93D",
  "#6BCB77", "#A29BFE", "#FD79A8", "#FF9F43", "#C7FF6B",
];

export const AVATAR_ACCENT_COLORS = [
  "#FF6B6B", "#48DBFB", "#FFD93D", "#E8FF47", "#FFFFFF",
  "#0D0D0D", "#A29BFE", "#FD79A8", "#FF9F43", "#6BCB77",
];

export const AVATAR_EYE_COLORS = [
  "#FFFFFF", "#0D0D0D", "#E8FF47", "#FF6B6B", "#48DBFB",
  "#FFD93D", "#A29BFE", "#FD79A8", "#FF9F43", "#6BCB77",
];

export const AVATAR_FACES = [
  "bunny", "panda", "fox", "frog", "devil",
  "cool", "ghost", "robot", "alien", "tiger"
];

export const AVATAR_HATS = [
  { id: "", label: "None", svg: "" },
  { id: "party", label: "Party", svg: `<polygon points="50,2 38,30 62,30" fill="#FF6B6B" stroke="#0D0D0D" stroke-width="2"/><circle cx="50" cy="2" r="3" fill="#E8FF47"/>` },
  { id: "crown", label: "Crown", svg: `<path d="M28 28 L36 12 L44 24 L50 8 L56 24 L64 12 L72 28 Z" fill="#E8FF47" stroke="#0D0D0D" stroke-width="2"/><circle cx="50" cy="20" r="2.5" fill="#FF6B6B"/>` },
  { id: "chef", label: "Chef", svg: `<ellipse cx="50" cy="18" rx="22" ry="14" fill="#F5F5F0" stroke="#0D0D0D" stroke-width="2"/><rect x="32" y="24" width="36" height="8" fill="#F5F5F0" stroke="#0D0D0D" stroke-width="2"/>` },
  { id: "halo", label: "Halo", svg: `<ellipse cx="50" cy="14" rx="20" ry="5" fill="none" stroke="#E8FF47" stroke-width="3"/>` },
  { id: "headphones", label: "Phones", svg: `<path d="M22 40 Q22 12 50 12 Q78 12 78 40" fill="none" stroke="#0D0D0D" stroke-width="3"/><rect x="16" y="34" width="12" height="18" rx="4" fill="#FF6B6B" stroke="#0D0D0D" stroke-width="2"/><rect x="72" y="34" width="12" height="18" rx="4" fill="#FF6B6B" stroke="#0D0D0D" stroke-width="2"/>` },
  { id: "top", label: "Top hat", svg: `<rect x="34" y="6" width="32" height="22" fill="#0D0D0D" stroke="#0D0D0D" stroke-width="2"/><rect x="26" y="26" width="48" height="6" fill="#0D0D0D"/><rect x="34" y="14" width="32" height="3" fill="#E8FF47"/>` },
  { id: "beanie", label: "Beanie", svg: `<path d="M28 30 Q28 8 50 8 Q72 8 72 30 Z" fill="#7CC4FF" stroke="#0D0D0D" stroke-width="2"/><rect x="26" y="28" width="48" height="6" fill="#7CC4FF" stroke="#0D0D0D" stroke-width="2"/>` },
  { id: "wizard", label: "Wizard", svg: `<path d="M50 0 L36 32 L64 32 Z" fill="#B388FF" stroke="#0D0D0D" stroke-width="2"/><circle cx="46" cy="14" r="1.6" fill="#E8FF47"/><circle cx="52" cy="22" r="1.6" fill="#E8FF47"/>` },
  { id: "cap", label: "Cap", svg: `<path d="M30 30 Q30 12 50 12 Q70 12 70 30 Z" fill="#FF6B6B" stroke="#0D0D0D" stroke-width="2"/><rect x="50" y="28" width="28" height="5" rx="2" fill="#FF6B6B" stroke="#0D0D0D" stroke-width="2"/>` },
  { id: "horns", label: "Horns", svg: `<path d="M30 28 Q24 8 36 12" fill="none" stroke="#FF6B6B" stroke-width="4" stroke-linecap="round"/><path d="M70 28 Q76 8 64 12" fill="none" stroke="#FF6B6B" stroke-width="4" stroke-linecap="round"/>` },
  { id: "antenna", label: "Antenna", svg: `<line x1="50" y1="30" x2="50" y2="6" stroke="#0D0D0D" stroke-width="2"/><circle cx="50" cy="4" r="4" fill="#E8FF47" stroke="#0D0D0D" stroke-width="2"/>` },
  { id: "pirate", label: "Pirate", svg: `<path d="M15 32 Q15 10 50 10 Q85 10 85 32 L50 32 Z" fill="#0D0D0D" stroke="#FFFFFF" stroke-width="1"/><circle cx="50" cy="21" r="3" fill="#FFFFFF" opacity="0.8"/><path d="M40 21 L60 21" stroke="#FFFFFF" stroke-width="1"/>` },
  { id: "viking", label: "Viking", svg: `<path d="M25 30 Q25 10 50 10 Q75 10 75 30 Z" fill="#BDBDBD" stroke="#0D0D0D" stroke-width="2"/><path d="M25 20 Q10 5 25 15" fill="#FFFFFF" stroke="#0D0D0D" stroke-width="1"/><path d="M75 20 Q90 5 75 15" fill="#FFFFFF" stroke="#0D0D0D" stroke-width="1"/>` },
  { id: "knight", label: "Knight", svg: `<path d="M30 35 V15 Q30 5 50 5 Q70 5 70 15 V35" fill="#757575" stroke="#0D0D0D" stroke-width="2"/><rect x="35" y="20" width="30" height="4" fill="#212121"/><rect x="35" y="28" width="30" height="4" fill="#212121"/>` },
  { id: "golden_crown", label: "G-Crown", svg: `<path d="M20 30 L25 10 L40 22 L50 5 L60 22 L75 10 L80 30 Z" fill="#FFD700" stroke="#0D0D0D" stroke-width="2"/><circle cx="50" cy="22" r="3" fill="#FF0000"/>` },
  { id: "diamond_hat", label: "Diamond", svg: `<path d="M50 5 L25 20 L50 35 L75 20 Z" fill="#48DBFB" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/><path d="M50 5 V35 M25 20 H75" stroke="#FFFFFF" stroke-width="1" opacity="0.5"/>` },
  { id: "secret_mask", label: "Void Mask", rarity: "Secret", svg: `<circle cx="50" cy="25" r="15" fill="black" stroke="white" stroke-width="2"/><rect x="40" y="20" width="4" height="4" fill="white"/><rect x="56" y="20" width="4" height="4" fill="white"/>` },
  { id: "glitch_eyes", label: "Glitch", rarity: "Secret", svg: `<rect x="30" y="20" width="10" height="4" fill="white" opacity="0.8"/><rect x="60" y="20" width="10" height="4" fill="white" opacity="0.8"/>` },
];

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Secret";

export interface AvatarItem {
  id: string;
  label: string;
  svg: string;
  rarity?: Rarity;
  price?: number;
}

const ADJ = ["Spicy","Noodle","Cosmic","Wobbly","Sneaky","Glitter","Funky","Crispy","Chaotic","Velvet","Turbo","Mellow","Zesty","Sleepy","Loud","Tiny","Mighty","Fuzzy","Salty","Royal"];
const NOUN = ["Pelican","Witch","Goblin","Yeti","Otter","Comet","Pixel","Toaster","Bandit","Penguin","Dragon","Muffin","Wizard","Llama","Falcon","Cactus","Phantom","Walrus","Raccoon","Beetle"];

export function randomNickname(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${n}${num}`;
}

export function randomAvatar(): Avatar {
  return {
    bgColor: AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)],
    bodyColor: AVATAR_BODY_COLORS[Math.floor(Math.random() * AVATAR_BODY_COLORS.length)],
    accentColor: AVATAR_ACCENT_COLORS[Math.floor(Math.random() * AVATAR_ACCENT_COLORS.length)],
    eyeColor: AVATAR_EYE_COLORS[Math.floor(Math.random() * AVATAR_EYE_COLORS.length)],
    characterId: AVATAR_FACES[Math.floor(Math.random() * AVATAR_FACES.length)],
    hat: AVATAR_HATS[Math.floor(Math.random() * AVATAR_HATS.length)].id,
  };
}

const KEY = "artornot.profile.v1";

export type Profile = { 
  nickname: string; 
  avatar: Avatar;
  credits: number;
  unlockedHats: string[];
  unlockedColors: string[];
  isPremium?: boolean;
};

export const INITIAL_CREDITS = 100;
export const WIN_CREDITS = 50;

export const COSTS = {
  HAT: 150,
  COLOR: 50,
  FACE: 200,
};

export const DEFAULT_PROFILE: Profile = {
  nickname: randomNickname(),
  avatar: randomAvatar(),
  credits: INITIAL_CREDITS,
  unlockedHats: ["", "party", "cap", "beanie"],
  unlockedColors: [
    ...AVATAR_BG_COLORS.slice(0, 5),
    ...AVATAR_BODY_COLORS.slice(0, 5),
    ...AVATAR_ACCENT_COLORS.slice(0, 5),
    ...AVATAR_EYE_COLORS.slice(0, 5),
  ],
};

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    // Migration: ensure new fields exist
    return {
      ...DEFAULT_PROFILE,
      ...p,
      avatar: { ...DEFAULT_PROFILE.avatar, ...p.avatar }
    };
  } catch { return null; }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
