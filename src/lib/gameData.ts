// Random nickname generator
const ADJECTIVES = [
  "Spicy", "Cosmic", "Sneaky", "Fuzzy", "Groovy",
  "Noodle", "Pixel", "Turbo", "Mystic", "Zesty",
  "Crispy", "Wobbly", "Sparkle", "Crunchy", "Jazzy",
  "Bubbly", "Zippy", "Funky", "Dizzy", "Quirky",
  "Lucky", "Mighty", "Salty", "Witchy", "Frosty",
  "Toasty", "Breezy", "Sassy", "Jolly", "Peppy"
];

const NOUNS = [
  "Pelican", "Waffle", "Wizard", "Phoenix", "Noodle",
  "Penguin", "Mango", "Pirate", "Goblin", "Panda",
  "Cactus", "Donut", "Falcon", "Pickle", "Walrus",
  "Banana", "Dragon", "Otter", "Turtle", "Rocket",
  "Moose", "Squid", "Llama", "Badger", "Cobra",
  "Taco", "Ninja", "Sloth", "Dingo", "Raven"
];

export const generateNickname = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
};

// Room code generator
export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/1/O/0 confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Avatar data
export const AVATAR_COLORS = [
  "#FF6B6B", "#FF8E53", "#FECA57", "#48DBFB", "#0ABDE3",
  "#A29BFE", "#FD79A8", "#6C5CE7", "#00CEC9", "#55EFC4"
];

export const AVATAR_BODY_COLORS = [
  "#0D0D0D", "#FFFFFF", "#FF6B6B", "#48DBFB", "#FFD93D",
  "#6BCB77", "#A29BFE", "#FD79A8", "#FF9F43", "#C7FF6B",
];

export const AVATAR_FACES = [
  "bunny", "panda", "fox", "frog", "devil",
  "cool", "ghost", "robot", "alien", "tiger"
];

export const AVATAR_HATS = [
  { id: "none", label: "None", svg: "" },
  { id: "crown", label: "Crown", svg: "👑" },
  { id: "party", label: "Party Hat", svg: "🎉" },
  { id: "chef", label: "Chef Hat", svg: "👨‍🍳" },
  { id: "halo", label: "Halo", svg: "😇" },
  { id: "headphones", label: "Headphones", svg: "🎧" },
  { id: "wizard", label: "Wizard", svg: "🧙" },
  { id: "cowboy", label: "Cowboy", svg: "🤠" },
  { id: "devil", label: "Devil", svg: "😈" },
  { id: "astronaut", label: "Astronaut", svg: "🧑‍🚀" },
  { id: "pirate", label: "Pirate", svg: "🏴‍☠️" },
];

export interface AvatarData {
  bgColor: string;
  bodyColor: string;
  characterId: string;
  hat: string;
}

export const DEFAULT_AVATAR: AvatarData = {
  bgColor: AVATAR_COLORS[0],
  bodyColor: AVATAR_BODY_COLORS[0],
  characterId: AVATAR_FACES[0],
  hat: "none",
};

// Drawing colors
export const DRAWING_COLORS = [
  "#1A1A2E", "#E74C3C", "#E67E22", "#F1C40F",
  "#2ECC71", "#1ABC9C", "#3498DB", "#9B59B6",
  "#E91E63", "#FF5722", "#795548", "#607D8B"
];

// Game settings defaults
export const DEFAULT_SETTINGS = {
  rounds: 2,
  drawTime: 30,
  numFakes: 1,
  category: "Random",
  wordRevealMode: "category" as "category" | "categoryHint",
  voteStyle: "majority" as "majority" | "host",
  chatDuringDraw: true,
  customWord: "",
};

export type GameSettings = typeof DEFAULT_SETTINGS;

// Types
export interface PlayerData {
  uid: string;
  nickname: string;
  avatar: AvatarData;
  isFake: boolean;
  score: number;
  joinedAt: number;
  isHost: boolean;
  isConnected: boolean;
}

export interface RoomData {
  roomCode: string;
  hostUID: string;
  status: "lobby" | "playing" | "voting" | "results";
  settings: GameSettings;
  currentRound: number;
  currentTurnIndex: number;
  word: string;
  createdAt: number;
  players: PlayerData[];
  turnOrder: string[];
}

export interface ChatMessage {
  id: string;
  uid: string;
  nickname: string;
  avatar: AvatarData;
  text: string;
  timestamp: number;
}

export interface StrokeData {
  uid: string;
  color: string;
  width: number;
  points: { x: number; y: number }[];
  timestamp: number;
}
