import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Crown, X, Copy, Check, Play, LogOut, Settings as SettingsIcon,
  ChevronDown, Eraser, Undo2, Timer, Vote as VoteIcon, MessageCircle,
} from "lucide-react";
import AvatarView from "@/components/AvatarView";
import Chat from "@/components/Chat";
import { loadProfile } from "@/lib/avatar";
import { ensureAuth } from "@/lib/firebase";
import {
  subscribeRoom, subscribePlayers, type RoomDoc, type PlayerDoc,
  updateSettings, kickPlayer, leaveRoom, startGame, defaultSettings,
  markRevealReady, beginPlaying, nextTurn, pushStroke, subscribeStrokes,
  castVote, finalizeVote, submitFakeGuess, playAgain, backToLobby,
  type Stroke, type GameSettings,
} from "@/lib/game";
import { CATEGORIES } from "@/lib/words";

const ease = [0.16, 1, 0.3, 1] as const;
const STROKE_COLORS = ["#0D0D0D","#FF6B6B","#E8FF47","#7CC4FF","#B388FF","#FFB86B","#6BFFB8","#FF6BD6","#FFE66B","#6BD6FF","#C7FF6B","#888888"];
const BRUSH_SIZES = [3, 6, 10];

export default function Room() {
  const { code: codeRaw } = useParams();
  const code = (codeRaw ?? "").toUpperCase();
  const navigate = useNavigate();

  const [uid, setUid] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [players, setPlayers] = useState<PlayerDoc[]>([]);
  const [showChat, setShowChat] = useState(false);
  const profile = loadProfile();

  useEffect(() => {
    if (!profile) navigate(`/me?next=${encodeURIComponent(`/join/${code}`)}`);
  }, []);

  useEffect(() => { ensureAuth().then((u) => setUid(u.uid)); }, []);
  useEffect(() => subscribeRoom(code, setRoom), [code]);
  useEffect(() => subscribePlayers(code, setPlayers), [code]);

  // Auto leave on unload
  useEffect(() => {
    const handler = () => { if (uid) leaveRoom(code, uid); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [uid, code]);

  // Detect being kicked
  const meExists = uid && players.some((p) => p.uid === uid);
  useEffect(() => {
    if (uid && room && players.length > 0 && !meExists) {
      toast.error("You were removed from the room");
      navigate("/");
    }
  }, [meExists, players.length, room]);

  if (!profile || !uid) return <CenterLoader />;
  if (!room) return <CenterLoader label={`Joining ${code}...`} />;

  const me = players.find((p) => p.uid === uid);
  const isHost = room.hostUID === uid;

  if (room.status === "lobby") return (
    <Lobby code={code} room={room} players={players} uid={uid} isHost={isHost} />
  );
  return (
    <Game code={code} room={room} players={players} uid={uid} isHost={isHost} me={me} showChat={showChat} setShowChat={setShowChat} />
  );
}

function CenterLoader({ label }: { label?: string }) {
  return (
    <div className="min-h-screen grid place-items-center text-muted-foreground">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {label ?? "Loading..."}
      </div>
    </div>
  );
}

/* ======================== LOBBY ======================== */

function Lobby({ code, room, players, uid, isHost }: { code: string; room: RoomDoc; players: PlayerDoc[]; uid: string; isHost: boolean }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmKick, setConfirmKick] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const settings = { ...defaultSettings, ...room.settings };
  const profile = loadProfile()!;

  const link = `${window.location.origin}/join/${code}`;
  const minPlayers = 3;

  const updateS = (patch: Partial<GameSettings>) => {
    if (!isHost) return;
    updateSettings(code, { ...settings, ...patch });
  };

  const triggerStart = async () => {
    if (!isHost) return;
    if (players.length < minPlayers) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      startGame(code, players, settings);
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 800);
    return () => clearTimeout(t);
  }, [countdown]);

  const slots = Math.max(0, 6 - players.length);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="container py-4 flex items-center justify-between">
        <button onClick={() => { leaveRoom(code, uid); navigate("/"); }} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <LogOut size={14}/> Leave
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Room</span>
          <span className="font-mono font-bold text-2xl tracking-[0.2em] text-primary">{code}</span>
          <button
            onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); toast.success("Link copied"); setTimeout(() => setCopied(false), 1500); }}
            className="text-muted-foreground hover:text-foreground p-1.5"
            title="Copy invite link"
          >{copied ? <Check size={16}/> : <Copy size={16}/>}</button>
        </div>
        <div className="w-16"/>
      </nav>

      <div className="container grid lg:grid-cols-5 gap-5 pb-20">
        {/* Left: players + chat */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Players <span className="text-muted-foreground text-sm font-sans">{players.length}/6</span></h2>
              {players.length < minPlayers && (
                <span className="text-xs text-muted-foreground">Need {minPlayers - players.length} more to start</span>
              )}
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              <AnimatePresence initial={false}>
                {players.map((p) => (
                  <motion.div
                    key={p.uid}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <AvatarView avatar={p.avatar} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate flex items-center gap-1.5">
                        {p.nickname}
                        {p.isHost && <Crown size={13} className="text-primary" />}
                        {p.uid === uid && <span className="text-[10px] text-muted-foreground">(you)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">Score {p.score ?? 0}</div>
                    </div>
                    {isHost && p.uid !== uid && (
                      <div className="relative">
                        {confirmKick === p.uid ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { kickPlayer(code, p.uid); setConfirmKick(null); }} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">Kick</button>
                            <button onClick={() => setConfirmKick(null)} className="text-xs px-2 py-1 rounded-full bg-white/10">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmKick(p.uid)} className="text-muted-foreground hover:text-accent p-1.5" title="Kick">
                            <X size={16}/>
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {Array.from({ length: slots }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/10 text-muted-foreground text-sm">
                  <div className="w-11 h-11 rounded-full border border-dashed border-white/15"/>
                  Waiting for player...
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface h-[360px] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] text-xs uppercase tracking-[0.2em] text-muted-foreground">Chat</div>
            <Chat code={code} uid={uid} nickname={profile.nickname} avatar={profile.avatar} />
          </div>
        </div>

        {/* Right: settings */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card-surface p-5">
            <button onClick={() => setSettingsOpen((v) => !v)} className="w-full flex items-center justify-between">
              <h2 className="font-display text-xl flex items-center gap-2"><SettingsIcon size={16}/> Game settings</h2>
              <ChevronDown size={18} className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {settingsOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-5 space-y-5">
                    <Field label="Rounds">
                      <Pills value={settings.rounds} options={[1,2,3,4,5]} disabled={!isHost} onChange={(v) => updateS({ rounds: v as number })} />
                    </Field>
                    <Field label="Drawing time">
                      <Pills value={settings.drawTime} options={[15,30,45,60]} suffix="s" disabled={!isHost} onChange={(v) => updateS({ drawTime: v as number })} />
                    </Field>
                    <Field label="Fake artists">
                      <Pills value={settings.numFakes} options={[1,2]} disabled={!isHost} onChange={(v) => updateS({ numFakes: v as 1|2 })} />
                    </Field>
                    <Field label="Category">
                      <Pills value={settings.category} options={CATEGORIES} disabled={!isHost} onChange={(v) => updateS({ category: v as string })} />
                    </Field>
                    <Field label="Custom word (optional)">
                      <input
                        disabled={!isHost}
                        value={settings.customWord ?? ""}
                        onChange={(e) => updateS({ customWord: e.target.value })}
                        placeholder="e.g. Ferris wheel"
                        className="w-full bg-white/5 rounded-xl px-3 py-2 text-sm border border-white/[0.06] focus:border-primary outline-none disabled:opacity-50"
                      />
                    </Field>
                    <Field label="Reveal mode">
                      <Pills value={settings.wordRevealMode} options={[
                        { v: "category", l: "Category only" },
                        { v: "category+letter", l: "+ Hint letter" },
                      ]} disabled={!isHost} onChange={(v) => updateS({ wordRevealMode: v as any })} />
                    </Field>
                    <Field label="Vote style">
                      <Pills value={settings.voteStyle} options={[
                        { v: "majority", l: "Majority" },
                        { v: "host", l: "Host decides" },
                      ]} disabled={!isHost} onChange={(v) => updateS({ voteStyle: v as any })} />
                    </Field>
                    <Field label="Chat during drawing">
                      <Pills value={settings.chatDuringDraw ? "on" : "off"} options={[
                        { v: "on", l: "Allowed" }, { v: "off", l: "Silent" },
                      ]} disabled={!isHost} onChange={(v) => updateS({ chatDuringDraw: v === "on" })} />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isHost && (
            <button
              onClick={triggerStart}
              disabled={players.length < minPlayers}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              title={players.length < minPlayers ? "Need at least 3 players" : ""}
            >
              <Play size={18} className="inline -mt-0.5 mr-2"/> Start game
            </button>
          )}
          {!isHost && (
            <div className="card-surface p-5 text-sm text-muted-foreground text-center">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center backdrop-blur-md bg-background/70"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="font-display font-bold text-[180px] text-primary leading-none"
            >
              {countdown === 0 ? "GO" : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</div>
      {children}
    </div>
  );
}

function Pills<T extends string | number>({ value, options, onChange, disabled, suffix }: {
  value: T; options: (T | { v: T; l: string })[]; onChange: (v: T) => void; disabled?: boolean; suffix?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const v = (typeof o === "object" ? o.v : o) as T;
        const l = typeof o === "object" ? o.l : `${o}${suffix ?? ""}`;
        const active = v === value;
        return (
          <button
            key={String(v)}
            disabled={disabled}
            onClick={() => onChange(v)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 border-white/[0.08] text-foreground hover:border-white/30"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >{l}</button>
        );
      })}
    </div>
  );
}

/* ======================== GAME ======================== */

function Game({ code, room, players, uid, isHost, me, showChat, setShowChat }: {
  code: string; room: RoomDoc; players: PlayerDoc[]; uid: string; isHost: boolean; me?: PlayerDoc;
  showChat: boolean; setShowChat: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const profile = loadProfile()!;
  const settings = { ...defaultSettings, ...room.settings };
  const turnOrder = room.turnOrder ?? [];
  const currentUID = turnOrder[room.currentTurnIndex];
  const isMyTurn = currentUID === uid && room.status === "playing";
  const isFake = (room.fakeUIDs ?? []).includes(uid);
  const playerByUID = useMemo(() => Object.fromEntries(players.map((p) => [p.uid, p])), [players]);

  // Reveal modal state
  const [revealAck, setRevealAck] = useState(false);
  useEffect(() => { if (room.status !== "reveal") setRevealAck(false); }, [room.status]);

  // when all confirm, host moves to playing
  useEffect(() => {
    if (room.status !== "reveal" || !isHost) return;
    const ready = room.revealReady ?? {};
    const allReady = players.every((p) => ready[p.uid]);
    if (allReady && players.length > 0) beginPlaying(code);
  }, [room.status, room.revealReady, players, isHost, code]);

  // Timer + auto-pass turn (host-only authoritative)
  const [timeLeft, setTimeLeft] = useState(settings.drawTime);
  useEffect(() => {
    if (room.status !== "playing" || !room.turnStartedAt) return;
    const startMs = (room.turnStartedAt as any).toMillis ? (room.turnStartedAt as any).toMillis() : Date.now();
    const tick = () => {
      const left = Math.max(0, settings.drawTime - Math.floor((Date.now() - startMs) / 1000));
      setTimeLeft(left);
      if (left <= 0 && isHost) nextTurn(code, room);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [room.status, room.turnStartedAt, room.currentTurnIndex, isHost]);

  const confettiOnce = useRef(false);
  useEffect(() => {
    if (room.status === "results" && !confettiOnce.current) {
      confettiOnce.current = true;
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.4 }, colors: ["#E8FF47","#FF6B6B","#7CC4FF","#F5F5F0"] });
    }
    if (room.status !== "results") confettiOnce.current = false;
  }, [room.status]);

  const exit = () => { leaveRoom(code, uid); navigate("/"); };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/[0.06]">
        <div className="container py-3 flex items-center gap-4">
          <span className="font-mono font-bold text-primary tracking-[0.2em]">{code}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Round {Math.max(1, room.currentRound)}/{settings.rounds}</span>
          <div className="flex-1" />
          {room.status === "playing" && (
            <div className="flex items-center gap-2 font-mono text-sm">
              <Timer size={14}/> {timeLeft}s
            </div>
          )}
          <button onClick={() => setShowChat(!showChat)} className="lg:hidden text-muted-foreground hover:text-foreground p-1.5"><MessageCircle size={18}/></button>
          <button onClick={exit} className="text-muted-foreground hover:text-accent p-1.5" title="Leave"><LogOut size={16}/></button>
        </div>
        {room.status === "playing" && (
          <div className="h-1 bg-white/5">
            <motion.div className="h-full bg-primary" animate={{ width: `${(timeLeft / settings.drawTime) * 100}%` }} transition={{ duration: 0.25, ease: "linear" }} />
          </div>
        )}
      </div>

      {/* Layout: canvas center, sidebar right */}
      <div className="container flex-1 grid lg:grid-cols-[1fr_320px] gap-5 py-5">
        <div className="flex flex-col items-center min-w-0">
          {(room.status === "playing" || room.status === "reveal") && (
            <CanvasArea code={code} isMyTurn={isMyTurn} room={room} players={players} uid={uid} isHost={isHost} />
          )}
          {room.status === "voting" && (
            <VotingArea code={code} room={room} players={players} uid={uid} isHost={isHost} />
          )}
          {(room.status === "guessing" || room.status === "results") && (
            <ResultsArea code={code} room={room} players={players} uid={uid} isFake={isFake} isHost={isHost} settings={settings} />
          )}
        </div>

        {/* sidebar */}
        <aside className={`flex-col gap-4 ${showChat ? "fixed inset-x-0 bottom-0 top-16 z-40 bg-background p-4 flex" : "hidden"} lg:flex lg:relative lg:inset-auto lg:bg-transparent lg:p-0`}>
          <div className="card-surface p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Turn order</div>
            <div className="space-y-2">
              {turnOrder.map((tuid, i) => {
                const p = playerByUID[tuid];
                if (!p) return null;
                const isCurrent = tuid === currentUID && room.status === "playing";
                const done = i < room.currentTurnIndex;
                return (
                  <div key={tuid} className="flex items-center gap-3">
                    <div className="relative">
                      <AvatarView avatar={p.avatar} size={36} ring={isCurrent} />
                      {isCurrent && <div className="absolute -inset-1 rounded-full animate-pulse-ring" />}
                      {done && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground grid place-items-center text-[10px]">✓</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate flex items-center gap-1">
                        {p.nickname}
                        {p.isHost && <Crown size={11} className="text-primary"/>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Score {p.score ?? 0}</div>
                    </div>
                    {isHost && p.uid !== uid && (
                      <button onClick={() => { kickPlayer(code, p.uid); }} className="text-muted-foreground hover:text-accent p-1 text-xs" title="Kick">
                        <X size={14}/>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card-surface flex-1 min-h-[260px] flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.06] text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
              <span>Chat</span>
              <button className="lg:hidden text-muted-foreground" onClick={() => setShowChat(false)}><X size={14}/></button>
            </div>
            <Chat
              code={code} uid={uid} nickname={profile.nickname} avatar={profile.avatar}
              disabled={room.status === "playing" && !settings.chatDuringDraw}
              disabledHint="Silent during drawing"
            />
          </div>
        </aside>
      </div>

      {/* Reveal modal */}
      <AnimatePresence>
        {room.status === "reveal" && !revealAck && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease }}
              className="card-surface p-10 max-w-lg w-full text-center"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Round {room.currentRound} — Category</div>
              <div className="font-display text-3xl mt-2">{room.category}</div>
              <div className="mt-8">
                {isFake ? (
                  <>
                    <div className="font-display text-7xl text-accent">???</div>
                    <p className="mt-4 text-muted-foreground">You are the <span className="text-accent font-semibold">Fake Artist</span>. Blend in.</p>
                  </>
                ) : (
                  <>
                    <div className="font-display text-5xl md:text-6xl text-primary break-words">{room.word}</div>
                    {settings.wordRevealMode === "category+letter" && (
                      <p className="mt-3 text-sm text-muted-foreground">Hint shared: starts with <span className="font-mono text-foreground">{(room.word ?? "?")[0]}</span></p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => { setRevealAck(true); markRevealReady(code, uid); }}
                className="btn-primary mt-10"
              >Got it</button>
              <div className="text-xs text-muted-foreground mt-4">
                Waiting for {players.filter((p) => !(room.revealReady ?? {})[p.uid]).length - (revealAck ? 0 : 1)} more...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ======================== CANVAS ======================== */

function CanvasArea({ code, isMyTurn, room, players, uid, isHost }: {
  code: string; isMyTurn: boolean; room: RoomDoc; players: PlayerDoc[]; uid: string; isHost: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>(STROKE_COLORS[0]);
  const [width, setWidth] = useState<number>(BRUSH_SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<{ points: { x: number; y: number }[] } | null>(null);
  const me = players.find((p) => p.uid === uid);

  // assign default color from avatar bg first time
  useEffect(() => { if (me?.avatar?.bgColor) setColor(me.avatar.bgColor); }, [me?.avatar?.bgColor]);

  // resize
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.min(el.clientWidth, 700);
      setSize({ w, h: w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const redraw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#FAFAF5";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const s of strokesRef.current) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width * dpr;
      const pts = s.points;
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * size.w * dpr, pts[0].y * size.h * dpr);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i], pp = pts[i - 1];
        const mx = ((p.x + pp.x) / 2) * size.w * dpr;
        const my = ((p.y + pp.y) / 2) * size.h * dpr;
        ctx.quadraticCurveTo(pp.x * size.w * dpr, pp.y * size.h * dpr, mx, my);
      }
      ctx.stroke();
    }
    if (drawingRef.current) {
      const pts = drawingRef.current.points;
      ctx.strokeStyle = erasing ? "#FAFAF5" : color;
      ctx.lineWidth = (erasing ? width * 2 : width) * dpr;
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x * size.w * dpr, pts[0].y * size.h * dpr);
        for (let i = 1; i < pts.length; i++) {
          const p = pts[i], pp = pts[i - 1];
          const mx = ((p.x + pp.x) / 2) * size.w * dpr;
          const my = ((p.y + pp.y) / 2) * size.h * dpr;
          ctx.quadraticCurveTo(pp.x * size.w * dpr, pp.y * size.h * dpr, mx, my);
        }
        ctx.stroke();
      }
    }
  };

  // Set canvas DPR size
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size.w * dpr; c.height = size.h * dpr;
    redraw();
  }, [size]);

  // Subscribe strokes
  useEffect(() => {
    strokesRef.current = [];
    const unsub = subscribeStrokes(
      code,
      (s) => { strokesRef.current.push(s); redraw(); },
      () => { strokesRef.current = []; redraw(); }
    );
    return unsub;
  }, [code]);

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onDown = (e: React.PointerEvent) => {
    if (!isMyTurn) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = { points: [getPos(e)] };
    redraw();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!isMyTurn || !drawingRef.current) return;
    drawingRef.current.points.push(getPos(e));
    redraw();
  };
  const onUp = async () => {
    if (!isMyTurn || !drawingRef.current) return;
    const pts = drawingRef.current.points;
    drawingRef.current = null;
    // require minimum stroke length
    if (pts.length < 4) { redraw(); return; }
    const stroke: Stroke = {
      uid, color: erasing ? "#FAFAF5" : color, width: erasing ? width * 2 : width,
      points: pts, ts: Date.now(),
    };
    await pushStroke(code, stroke);
    // pass turn
    await nextTurn(code, room);
  };

  const undoActive = () => {
    if (drawingRef.current && drawingRef.current.points.length > 1) {
      drawingRef.current.points.pop();
      redraw();
    }
  };

  return (
    <div className="w-full max-w-[720px]">
      {isMyTurn && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-center text-sm pill bg-primary/15 text-primary border border-primary/30 inline-block"
        >Your turn — draw ONE stroke.</motion.div>
      )}
      {!isMyTurn && room.status === "playing" && (
        <div className="mb-3 text-center text-sm text-muted-foreground">
          {(() => {
            const cur = players.find((p) => p.uid === room.turnOrder[room.currentTurnIndex]);
            return cur ? `${cur.nickname} is drawing...` : "Waiting...";
          })()}
        </div>
      )}
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          width={size.w} height={size.h}
          style={{ width: size.w, height: size.h, touchAction: "none" }}
          className="rounded-2xl bg-canvas mx-auto block shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] no-cursor"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
      </div>

      {/* Tools */}
      <div className={`mt-4 flex flex-wrap items-center justify-center gap-3 ${!isMyTurn ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/5 border border-white/[0.06]">
          {BRUSH_SIZES.map((s) => (
            <button key={s} onClick={() => { setWidth(s); setErasing(false); }} className={`w-8 h-8 rounded-full grid place-items-center ${width === s && !erasing ? "bg-primary text-primary-foreground" : "hover:bg-white/10"}`}>
              <span className="rounded-full bg-current" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 border border-white/[0.06]">
          {STROKE_COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setErasing(false); }} className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c && !erasing ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <button onClick={() => setErasing((v) => !v)} className={`pill text-sm border ${erasing ? "bg-accent text-accent-foreground border-accent" : "border-white/10 text-foreground bg-white/5"}`}>
          <Eraser size={14} className="inline -mt-0.5 mr-1.5"/> Erase
        </button>
        <button onClick={undoActive} className="pill text-sm border border-white/10 bg-white/5">
          <Undo2 size={14} className="inline -mt-0.5 mr-1.5"/> Undo
        </button>
      </div>
    </div>
  );
}

/* ======================== VOTING ======================== */

function VotingArea({ code, room, players, uid, isHost }: { code: string; room: RoomDoc; players: PlayerDoc[]; uid: string; isHost: boolean }) {
  const myVote = (room.votes ?? {})[uid];
  const settings = { ...defaultSettings, ...room.settings };
  const tally: Record<string, number> = {};
  Object.values(room.votes ?? {}).forEach((t) => { tally[t] = (tally[t] || 0) + 1; });
  const allVoted = players.every((p) => (room.votes ?? {})[p.uid]);

  useEffect(() => {
    if (!isHost) return;
    if (settings.voteStyle === "majority" && allVoted) {
      finalizeVote(code, room, players);
    }
  }, [allVoted, isHost]);

  return (
    <div className="w-full max-w-[820px] mx-auto text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Voting</div>
      <h2 className="font-display text-4xl md:text-5xl mt-2">Who is the Fake Artist?</h2>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {players.map((p, i) => {
          const voted = myVote === p.uid;
          const cant = p.uid === uid;
          return (
            <motion.button
              key={p.uid}
              disabled={cant}
              onClick={() => castVote(code, uid, p.uid)}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease }}
              className={`card-surface p-5 flex flex-col items-center gap-3 transition-all ${voted ? "ring-2 ring-primary" : ""} ${cant ? "opacity-50" : "hover:bg-white/[0.04] active:scale-[0.98]"}`}
            >
              <AvatarView avatar={p.avatar} size={64} />
              <div className="font-medium truncate w-full">{p.nickname}</div>
              <div className="font-mono text-xs text-muted-foreground">Votes: {tally[p.uid] ?? 0}</div>
              {!cant && (
                <span className={`pill text-xs ${voted ? "bg-primary text-primary-foreground" : "bg-white/5 border border-white/10"}`}>
                  <VoteIcon size={12} className="inline -mt-0.5 mr-1"/> {voted ? "Voted" : "Vote"}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {isHost && settings.voteStyle === "host" && (
        <button onClick={() => finalizeVote(code, room, players)} className="btn-primary mt-8">End voting</button>
      )}
      {isHost && settings.voteStyle === "majority" && !allVoted && (
        <button onClick={() => finalizeVote(code, room, players)} className="btn-ghost mt-8 text-sm">Force end voting</button>
      )}
    </div>
  );
}

/* ======================== RESULTS ======================== */

function ResultsArea({ code, room, players, uid, isFake, isHost, settings }: {
  code: string; room: RoomDoc; players: PlayerDoc[]; uid: string; isFake: boolean; isHost: boolean; settings: GameSettings;
}) {
  const fakeUIDs = room.fakeUIDs ?? [];
  const fakes = players.filter((p) => fakeUIDs.includes(p.uid));
  const accused = players.find((p) => p.uid === room.accusedUID);
  const [guess, setGuess] = useState("");

  if (room.status === "guessing") {
    const amAccused = uid === room.accusedUID;
    return (
      <div className="w-full max-w-xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.7, ease }}
          className="font-display text-3xl md:text-4xl"
        >
          The accused: <span className="text-accent">{accused?.nickname}</span>
        </motion.div>
        <p className="mt-4 text-muted-foreground">They were the Fake Artist. They get one chance to guess the word.</p>
        {amAccused ? (
          <div className="mt-8 card-surface p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category: {room.category}</div>
            <input
              autoFocus value={guess} onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess..."
              className="mt-4 w-full bg-white/5 rounded-xl px-4 py-3 text-lg text-center border border-white/[0.06] focus:border-primary outline-none"
            />
            <button onClick={() => submitFakeGuess(code, room, players, guess)} disabled={!guess.trim()} className="btn-primary mt-4 w-full disabled:opacity-50">Submit guess</button>
          </div>
        ) : (
          <div className="mt-8 text-muted-foreground animate-pulse">Waiting for {accused?.nickname} to guess...</div>
        )}
      </div>
    );
  }

  // results
  const winner = room.winner;
  const fakeGuessedRight = !!room.fakeGuess && room.fakeGuess.trim().toLowerCase() === (room.word ?? "").trim().toLowerCase();

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.08, 1], opacity: 1 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">The Fake Artist was...</div>
        <div className="mt-4 flex justify-center gap-4">
          {fakes.map((p) => (
            <div key={p.uid} className="flex flex-col items-center">
              <AvatarView avatar={p.avatar} size={88} ring ringColor="#FF6B6B" />
              <div className="mt-2 font-display text-2xl text-accent">{p.nickname}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 text-muted-foreground">
        Word was <span className="font-display text-foreground text-xl">"{room.word}"</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-6 card-surface p-6"
      >
        {winner === "real" && <div className="font-display text-3xl text-primary">Real players win! 🎉</div>}
        {winner === "fake" && (
          <div>
            <div className="font-display text-3xl text-accent">Fake Artist wins!</div>
            {room.fakeGuess && (
              <div className="text-sm text-muted-foreground mt-2">
                Guessed "{room.fakeGuess}" — {fakeGuessedRight ? "correct!" : "but the real players failed to catch them."}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Scoreboard */}
      <div className="mt-6 card-surface p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Scoreboard</div>
        <div className="space-y-2">
          {[...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((p) => (
            <div key={p.uid} className="flex items-center gap-3">
              <AvatarView avatar={p.avatar} size={32} />
              <div className="flex-1 text-left text-sm">{p.nickname}{fakeUIDs.includes(p.uid) && <span className="ml-2 text-[10px] text-accent">(fake)</span>}</div>
              <div className="font-mono text-primary">{p.score ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => playAgain(code, players, settings, room.usedWords ?? [])} className="btn-primary">Play again</button>
          <button onClick={() => backToLobby(code)} className="btn-ghost">Back to lobby</button>
        </div>
      )}
      {!isHost && <div className="mt-6 text-sm text-muted-foreground">Waiting for host...</div>}
    </div>
  );
}
