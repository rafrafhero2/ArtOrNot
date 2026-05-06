import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import AvatarView from "@/components/AvatarView";
import {
  AVATAR_BG_COLORS, AVATAR_FACES, AVATAR_HATS,
  loadProfile, saveProfile, randomAvatar, randomNickname,
  type Avatar,
} from "@/lib/avatar";
import { Dice5, Pencil, ArrowLeft, Check } from "lucide-react";
import { ensureAuth } from "@/lib/firebase";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Customizer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/create";

  const initial = loadProfile();
  const [avatar, setAvatar] = useState<Avatar>(initial?.avatar ?? randomAvatar());
  const [nickname, setNickname] = useState<string>(initial?.nickname ?? randomNickname());
  const [editingName, setEditingName] = useState(false);

  useEffect(() => { ensureAuth(); }, []);

  const tabs = ["Color", "Face", "Hat"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Color");

  const valid = useMemo(() => nickname.trim().length >= 2 && nickname.length <= 16, [nickname]);

  const save = async () => {
    if (!valid) return;
    saveProfile({ nickname: nickname.trim(), avatar });
    navigate(next);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="container py-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft size={16}/> Back
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Make your guy</span>
        <div className="w-16" />
      </nav>

      <div className="container max-w-3xl pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
          className="card-surface p-8 md:p-12"
        >
          <div className="flex flex-col items-center">
            <motion.div
              key={JSON.stringify(avatar)}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <AvatarView avatar={avatar} size={140} />
            </motion.div>

            <div className="mt-6 flex items-center gap-2">
              {editingName ? (
                <input
                  autoFocus value={nickname} maxLength={16}
                  onChange={(e) => setNickname(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  className="bg-transparent border-b border-white/20 focus:border-primary outline-none text-center font-display text-2xl px-2 py-1"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="font-display text-2xl flex items-center gap-2 hover:text-primary transition-colors"
                >
                  {nickname} <Pencil size={14} className="opacity-60" />
                </button>
              )}
              <button
                onClick={() => setNickname(randomNickname())}
                className="text-muted-foreground hover:text-foreground p-2"
                aria-label="Random nickname"
                title="Random nickname"
              >
                <Dice5 size={16}/>
              </button>
            </div>
            {!valid && <p className="text-xs text-accent mt-1">Nickname must be 2–16 characters.</p>}
          </div>

          {/* tabs */}
          <div className="mt-10 flex justify-center gap-1 p-1 rounded-full bg-white/5 border border-white/[0.06] w-fit mx-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{t}</button>
            ))}
          </div>

          <div className="mt-8 min-h-[180px]">
            {tab === "Color" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 justify-items-center">
                {AVATAR_BG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatar((a) => ({ ...a, bgColor: c }))}
                    className={`w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 relative ${avatar.bgColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                    aria-label={`color ${c}`}
                  />
                ))}
              </div>
            )}
            {tab === "Face" && (
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 justify-items-center">
                {AVATAR_FACES.map((f) => (
                  <button
                    key={f}
                    onClick={() => setAvatar((a) => ({ ...a, faceEmoji: f }))}
                    className={`w-12 h-12 rounded-xl text-2xl grid place-items-center hover:bg-white/5 transition-colors ${avatar.faceEmoji === f ? "bg-white/10 ring-1 ring-primary" : ""}`}
                  >{f}</button>
                ))}
              </div>
            )}
            {tab === "Hat" && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 justify-items-center">
                {AVATAR_HATS.map((h) => (
                  <button
                    key={h.id || "none"}
                    onClick={() => setAvatar((a) => ({ ...a, hat: h.id }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 ${avatar.hat === h.id ? "bg-white/10 ring-1 ring-primary" : ""}`}
                    title={h.label}
                  >
                    <AvatarView avatar={{ ...avatar, hat: h.id }} size={56} />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{h.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between items-center gap-3">
            <button
              onClick={() => { setAvatar(randomAvatar()); setNickname(randomNickname()); }}
              className="btn-ghost text-sm"
            >
              <Dice5 size={14} className="inline -mt-0.5 mr-2"/> Surprise me
            </button>
            <button onClick={save} disabled={!valid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={16} className="inline -mt-0.5 mr-2"/> Save & continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
