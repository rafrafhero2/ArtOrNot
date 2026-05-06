export type Avatar = {
  bgColor: string;
  faceEmoji: string;
  hat: string; // hat id, "" = none
};

export const AVATAR_BG_COLORS = [
  "#E8FF47", "#FF6B6B", "#7CC4FF", "#B388FF", "#FFB86B",
  "#6BFFB8", "#FF6BD6", "#FFE66B", "#6BD6FF", "#C7FF6B",
];

export const AVATAR_FACES = [
  "🐸","🐼","🦊","🐙","👾","🌚","🎭","🐲","🦄","🐧",
  "🦉","🐯","🐵","🐨","🦁","🐰","🦝","🐢","🐳","🦋",
  "🤖","👽","🦖","🐝","🐬",
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
];

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
    faceEmoji: AVATAR_FACES[Math.floor(Math.random() * AVATAR_FACES.length)],
    hat: AVATAR_HATS[Math.floor(Math.random() * AVATAR_HATS.length)].id,
  };
}

const KEY = "artornot.profile.v1";
export type Profile = { nickname: string; avatar: Avatar };

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
