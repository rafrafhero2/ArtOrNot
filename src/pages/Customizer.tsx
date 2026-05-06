import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import AvatarView from "@/components/AvatarView";
import {
  AVATAR_BG_COLORS, AVATAR_BODY_COLORS, AVATAR_ACCENT_COLORS, AVATAR_EYE_COLORS,
  AVATAR_FACES, AVATAR_HATS,
  loadProfile, saveProfile, randomAvatar, randomNickname,
  type Avatar,
} from "@/lib/avatar";
import { Dice5, Pencil, ArrowLeft, Check } from "lucide-react";
import { CHARACTER_MAP } from "@/components/AvatarCharacters";
import { ensureAuth } from "@/lib/firebase";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Customizer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/create";

  const profile = loadProfile();
  
  // Ensure all avatar fields are present to avoid uncontrolled input warnings
  const initialAvatar = useMemo(() => {
    const base = profile?.avatar || randomAvatar();
    return {
      ...randomAvatar(), // Get all defaults (accentColor, eyeColor, etc)
      ...base,           // Override with loaded profile
    };
  }, [profile]);

  const [avatar, setAvatar] = useState<Avatar>(initialAvatar);
  const [nickname, setNickname] = useState<string>(profile?.nickname ?? randomNickname());
  const [editingName, setEditingName] = useState(false);

  useEffect(() => { ensureAuth(); }, []);

  const tabs = ["Color", "Body", "Accent", "Eyes", "Face", "Hat"] as const;
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
          <ArrowLeft size={16} /> Back
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
                <Dice5 size={16} />
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
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
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
                    aria-label={`background color ${c}`}
                  />
                ))}
                {/* Custom Color */}
                <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors group">
                  <input
                    type="color"
                    value={avatar.bgColor}
                    onChange={(e) => setAvatar((a) => ({ ...a, bgColor: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom background color"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <span className="text-xl opacity-40">+</span>
                  </div>
                </div>
              </div>
            )}

            {tab === "Body" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 justify-items-center">
                {AVATAR_BODY_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatar((a) => ({ ...a, bodyColor: c }))}
                    className={`w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 relative ${avatar.bodyColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                    aria-label={`body color ${c}`}
                  />
                ))}
                {/* Custom Color */}
                <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors group">
                  <input
                    type="color"
                    value={avatar.bodyColor}
                    onChange={(e) => setAvatar((a) => ({ ...a, bodyColor: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom body color"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <span className="text-xl opacity-40">+</span>
                  </div>
                </div>
              </div>
            )}

            {tab === "Accent" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 justify-items-center">
                {AVATAR_ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatar((a) => ({ ...a, accentColor: c }))}
                    className={`w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 relative ${avatar.accentColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                    aria-label={`accent color ${c}`}
                  />
                ))}
                {/* Custom Color */}
                <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors group">
                  <input
                    type="color"
                    value={avatar.accentColor}
                    onChange={(e) => setAvatar((a) => ({ ...a, accentColor: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom accent color"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <span className="text-xl opacity-40">+</span>
                  </div>
                </div>
              </div>
            )}

            {tab === "Eyes" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 justify-items-center">
                {AVATAR_EYE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatar((a) => ({ ...a, eyeColor: c }))}
                    className={`w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 relative ${avatar.eyeColor === c ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                    aria-label={`eye color ${c}`}
                  />
                ))}
                {/* Custom Color */}
                <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors group">
                  <input
                    type="color"
                    value={avatar.eyeColor}
                    onChange={(e) => setAvatar((a) => ({ ...a, eyeColor: e.target.value }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom eye color"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                    <span className="text-xl opacity-40">+</span>
                  </div>
                </div>
              </div>
            )}

            {tab === "Face" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-items-center">
                {AVATAR_FACES.map((f) => {
                  const Character = CHARACTER_MAP[f] || CHARACTER_MAP.bunny;
                  return (
                    <button
                      key={f}
                      onClick={() => setAvatar((a) => ({ ...a, characterId: f }))}
                      className={`w-12 h-12 rounded-xl grid place-items-center hover:bg-white/5 transition-colors ${avatar.characterId === f ? "bg-white/10 ring-1 ring-primary" : ""}`}
                    >
                      <Character size={32} color={avatar.bodyColor} accentColor={avatar.accentColor} eyeColor={avatar.eyeColor} />
                    </button>
                  );
                })}
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
              <Dice5 size={14} className="inline -mt-0.5 mr-2" /> Surprise me
            </button>
            <button onClick={save} disabled={!valid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={16} className="inline -mt-0.5 mr-2" /> Save & continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}