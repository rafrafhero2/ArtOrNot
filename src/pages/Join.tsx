import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loadProfile } from "@/lib/avatar";
import { joinRoom } from "@/lib/game";
import { ensureAuth } from "@/lib/firebase";

export default function Join() {
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const profile = loadProfile();
  const initial = (codeParam ?? "").toUpperCase().slice(0, 4).padEnd(4, " ").slice(0, 4);
  const [chars, setChars] = useState<string[]>(initial.split("").map((c) => c === " " ? "" : c));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (!profile) {
      navigate(`/me?next=${encodeURIComponent(`/join${codeParam ? "/" + codeParam : ""}`)}`);
    }
  }, []);

  const code = chars.join("");

  useEffect(() => {
    if (profile && codeParam && code.length === 4) {
      attempt(code);
    }
  }, [profile]);

  if (!profile) return null;

  const setChar = (i: number, v: string) => {
    const c = (v.toUpperCase().match(/[A-Z0-9]/) ?? [""])[0];
    setChars((prev) => {
      const n = [...prev]; n[i] = c; return n;
    });
    if (c && i < 3) refs[i + 1].current?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) refs[i - 1].current?.focus();
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    if (t.length) {
      e.preventDefault();
      const next = [0, 1, 2, 3].map((i) => t[i] ?? "");
      setChars(next);
      const focusIdx = Math.min(t.length, 3);
      refs[focusIdx].current?.focus();
    }
  };

  const attempt = async (c?: string) => {
    const codeFinal = (c ?? code).toUpperCase();
    if (codeFinal.length !== 4) { setError("Enter a 4-character code"); return; }
    setError(null); setBusy(true);
    try {
      const u = await ensureAuth();
      await joinRoom(codeFinal, {
        uid: u.uid, nickname: profile.nickname, avatar: profile.avatar,
        isHost: false, score: 0, connected: true,
      });
      navigate(`/room/${codeFinal}`);
    } catch (e: any) {
      setError(e.message ?? "Could not join room");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="container py-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft size={16}/> Back
        </Link>
      </nav>
      <div className="container max-w-xl pb-20">
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card-surface p-8 md:p-12">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Enter room code</div>
            <h1 className="font-display text-3xl mt-2">Joining as {profile.nickname}</h1>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            {[0,1,2,3].map((i) => (
              <input
                key={i}
                ref={refs[i]}
                value={chars[i]}
                onChange={(e) => setChar(i, e.target.value.slice(-1))}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={onPaste}
                inputMode="text"
                maxLength={1}
                className="font-mono font-bold text-4xl text-center w-16 h-20 rounded-2xl bg-white/5 border border-white/[0.08] focus:border-primary focus:outline-none uppercase"
              />
            ))}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 justify-center text-sm text-accent">
              <AlertCircle size={14}/> {error}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => attempt()}
              disabled={busy || code.length < 4}
              className="btn-primary disabled:opacity-50"
            >{busy ? "Joining..." : "Join room"}</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
