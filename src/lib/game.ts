import { db, rtdb, ensureAuth } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc,
  serverTimestamp, query, orderBy, deleteDoc, getDocs, writeBatch, Timestamp,
} from "firebase/firestore";
import { ref, push, onChildAdded, set, remove, onValue, off } from "firebase/database";
import type { Avatar } from "./avatar";
import { pickWord } from "./words";

export type GameSettings = {
  rounds: number;
  drawTime: number; // seconds
  numFakes: 1 | 2;
  category: string;
  customWord?: string;
  wordRevealMode: "category" | "category+letter";
  voteStyle: "majority" | "host";
  chatDuringDraw: boolean;
};

export const defaultSettings: GameSettings = {
  rounds: 2,
  drawTime: 45,
  numFakes: 1,
  category: "Animals",
  wordRevealMode: "category",
  voteStyle: "majority",
  chatDuringDraw: true,
};

export type RoomStatus = "lobby" | "reveal" | "playing" | "voting" | "guessing" | "results";

export type RoomDoc = {
  code: string;
  hostUID: string;
  status: RoomStatus;
  settings: GameSettings;
  currentRound: number;
  currentTurnIndex: number;
  turnStartedAt?: Timestamp | null;
  turnOrder: string[]; // uids
  word?: string;       // visible to clients (game is local-trust)
  category?: string;
  fakeUIDs?: string[];
  usedWords?: string[];
  revealedAt?: Timestamp | null;
  revealReady?: Record<string, boolean>;
  votes?: Record<string, string>; // voterUID -> targetUID
  accusedUID?: string | null;
  fakeGuess?: string | null;
  winner?: "real" | "fake" | null;
  countdown?: number | null;
  createdAt?: Timestamp;
};

export type PlayerDoc = {
  uid: string;
  nickname: string;
  avatar: Avatar;
  isHost: boolean;
  score: number;
  connected: boolean;
  joinedAt?: Timestamp;
};

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateCode(len = 4) {
  let s = "";
  for (let i = 0; i < len; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

export const roomRef = (code: string) => doc(db, "rooms", code.toUpperCase());
export const playersCol = (code: string) => collection(db, "rooms", code.toUpperCase(), "players");
export const playerRef = (code: string, uid: string) => doc(db, "rooms", code.toUpperCase(), "players", uid);
export const chatCol = (code: string) => collection(db, "rooms", code.toUpperCase(), "chat");

export async function createRoom(code: string, host: PlayerDoc) {
  const u = await ensureAuth();
  const codeU = code.toUpperCase();
  await setDoc(roomRef(codeU), {
    code: codeU,
    hostUID: u.uid,
    status: "lobby",
    settings: defaultSettings,
    currentRound: 0,
    currentTurnIndex: 0,
    turnOrder: [],
    countdown: null,
    createdAt: serverTimestamp(),
  } as Partial<RoomDoc>);
  await setDoc(playerRef(codeU, u.uid), { ...host, uid: u.uid, isHost: true, joinedAt: serverTimestamp() });
}

export async function joinRoom(code: string, p: PlayerDoc) {
  const u = await ensureAuth();
  const codeU = code.toUpperCase();
  const r = await getDoc(roomRef(codeU));
  if (!r.exists()) throw new Error("Room not found");
  const data = r.data() as RoomDoc;
  if (data.status !== "lobby") throw new Error("Game already started");
  await setDoc(playerRef(codeU, u.uid), {
    ...p,
    uid: u.uid,
    isHost: data.hostUID === u.uid,
    joinedAt: serverTimestamp(),
    score: p.score ?? 0,
    connected: true,
  });
}

export function subscribeRoom(code: string, cb: (r: RoomDoc | null) => void) {
  return onSnapshot(roomRef(code), (snap) => cb(snap.exists() ? (snap.data() as RoomDoc) : null));
}
export function subscribePlayers(code: string, cb: (players: PlayerDoc[]) => void) {
  const q = query(playersCol(code), orderBy("joinedAt", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as PlayerDoc)));
}
export function subscribeChat(code: string, cb: (msgs: any[]) => void) {
  const q = query(chatCol(code), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function sendChat(code: string, payload: { uid: string; nickname: string; avatar: Avatar; text: string }) {
  await addDoc(chatCol(code), { ...payload, timestamp: serverTimestamp() });
}

export async function leaveRoom(code: string, uid: string) {
  try {
    await deleteDoc(playerRef(code, uid));
  } catch {}
}

export async function kickPlayer(code: string, uid: string) {
  await deleteDoc(playerRef(code, uid));
}

export async function updateSettings(code: string, settings: Partial<GameSettings>) {
  await updateDoc(roomRef(code), { settings: { ...defaultSettings, ...settings } as any });
}

export async function updateCountdown(code: string, countdown: number | null) {
  await updateDoc(roomRef(code), { countdown } as any);
}

export async function patchRoom(code: string, patch: Partial<RoomDoc>) {
  await updateDoc(roomRef(code), patch as any);
}

export async function startGame(code: string, players: PlayerDoc[], settings: GameSettings) {
  const order = [...players.map((p) => p.uid)].sort(() => Math.random() - 0.5);
  const fakes: string[] = [];
  const pool = [...order];
  for (let i = 0; i < settings.numFakes && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    fakes.push(pool.splice(idx, 1)[0]);
  }
  const word = (settings.customWord && settings.customWord.trim()) || pickWord(settings.category);
  await clearStrokes(code);
  await patchRoom(code, {
    status: "reveal",
    turnOrder: order,
    currentRound: 1,
    currentTurnIndex: 0,
    turnStartedAt: null,
    word,
    category: settings.category,
    fakeUIDs: fakes,
    usedWords: [word],
    revealReady: {},
    votes: {},
    accusedUID: null,
    fakeGuess: null,
    winner: null,
  });
}

export async function markRevealReady(code: string, uid: string, current: Record<string, boolean> = {}) {
  await updateDoc(roomRef(code), { [`revealReady.${uid}`]: true } as any);
}

export async function beginPlaying(code: string) {
  await patchRoom(code, { status: "playing", turnStartedAt: serverTimestamp() as any });
}

export async function nextTurn(code: string, room: RoomDoc) {
  const totalTurnsPerRound = room.turnOrder.length;
  const isLastTurnOfRound = room.currentTurnIndex + 1 >= totalTurnsPerRound;
  if (isLastTurnOfRound && room.currentRound >= room.settings.rounds) {
    await patchRoom(code, { status: "voting" });
    return;
  }
  if (isLastTurnOfRound) {
    await patchRoom(code, {
      currentRound: room.currentRound + 1,
      currentTurnIndex: 0,
      turnStartedAt: serverTimestamp() as any,
    });
  } else {
    await patchRoom(code, {
      currentTurnIndex: room.currentTurnIndex + 1,
      turnStartedAt: serverTimestamp() as any,
    });
  }
}

export async function castVote(code: string, voterUID: string, targetUID: string) {
  await updateDoc(roomRef(code), { [`votes.${voterUID}`]: targetUID } as any);
}

export async function finalizeVote(code: string, room: RoomDoc, players: PlayerDoc[]) {
  const tally: Record<string, number> = {};
  Object.values(room.votes ?? {}).forEach((t) => { tally[t] = (tally[t] || 0) + 1; });
  let topUID = ""; let topVotes = -1;
  for (const uid of players.map((p) => p.uid)) {
    const v = tally[uid] ?? 0;
    if (v > topVotes) { topVotes = v; topUID = uid; }
  }
  const isFake = (room.fakeUIDs ?? []).includes(topUID);
  if (isFake) {
    await patchRoom(code, { status: "guessing", accusedUID: topUID });
  } else {
    await patchRoom(code, { status: "results", accusedUID: topUID, winner: "fake" });
    await applyScores(code, players, room, "fake");
  }
}

export async function submitFakeGuess(code: string, room: RoomDoc, players: PlayerDoc[], guess: string) {
  const correct = guess.trim().toLowerCase() === (room.word ?? "").trim().toLowerCase();
  const winner = correct ? "fake" : "real";
  await patchRoom(code, { status: "results", fakeGuess: guess, winner });
  await applyScores(code, players, room, winner);
}

async function applyScores(code: string, players: PlayerDoc[], room: RoomDoc, winner: "real" | "fake") {
  const fakes = new Set(room.fakeUIDs ?? []);
  const batch = writeBatch(db);
  for (const p of players) {
    const isFake = fakes.has(p.uid);
    let delta = 0;
    if (winner === "real" && !isFake) delta = 1;
    if (winner === "fake" && isFake) delta = 2;
    if (delta) batch.update(playerRef(code, p.uid), { score: (p.score ?? 0) + delta } as any);
  }
  await batch.commit();
}

export async function playAgain(code: string, players: PlayerDoc[], settings: GameSettings, used: string[] = []) {
  const order = [...players.map((p) => p.uid)].sort(() => Math.random() - 0.5);
  const fakes: string[] = [];
  const pool = [...order];
  for (let i = 0; i < settings.numFakes && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    fakes.push(pool.splice(idx, 1)[0]);
  }
  const word = (settings.customWord && settings.customWord.trim()) || pickWord(settings.category, used);
  await clearStrokes(code);
  await patchRoom(code, {
    status: "reveal",
    turnOrder: order,
    currentRound: 1,
    currentTurnIndex: 0,
    word,
    category: settings.category,
    fakeUIDs: fakes,
    usedWords: [...used, word],
    revealReady: {},
    votes: {},
    accusedUID: null,
    fakeGuess: null,
    winner: null,
  });
}

export async function backToLobby(code: string) {
  await clearStrokes(code);
  await patchRoom(code, {
    status: "lobby",
    currentRound: 0,
    currentTurnIndex: 0,
    turnOrder: [],
    word: "",
    fakeUIDs: [],
    revealReady: {},
    votes: {},
    accusedUID: null,
    fakeGuess: null,
    winner: null,
    countdown: null,
  });
}

// ===== RTDB strokes =====
export type Stroke = {
  uid: string;
  color: string;
  width: number;
  tool?: "pen" | "line" | "square" | "circle";
  points: { x: number; y: number }[];
  ts: number;
};

export const strokesRef = (code: string) => ref(rtdb, `canvas/${code.toUpperCase()}/strokes`);

export async function pushStroke(code: string, stroke: Stroke) {
  await push(strokesRef(code), stroke);
}

export function subscribeStrokes(code: string, onAdd: (s: Stroke) => void, onClear: () => void) {
  const r = strokesRef(code);
  const addCb = onChildAdded(r, (snap) => {
    const v = snap.val(); if (v) onAdd(v);
  });
  const valCb = onValue(r, (snap) => {
    if (!snap.exists()) onClear();
  });
  return () => { off(r, "child_added", addCb); off(r, "value", valCb); };
}

export async function clearStrokes(code: string) {
  await remove(strokesRef(code));
}
