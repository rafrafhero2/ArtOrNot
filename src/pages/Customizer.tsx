import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AvatarView from "@/components/AvatarView";
import {
  AVATAR_BG_COLORS, AVATAR_BODY_COLORS, AVATAR_ACCENT_COLORS, AVATAR_EYE_COLORS,
  AVATAR_FACES, AVATAR_HATS,
  randomAvatar, randomNickname, COSTS,
  type Avatar, type Profile
} from "@/lib/avatar";
import { Dice5, Pencil, ArrowLeft, Check, Lock, Coins, User as UserIcon, LogOut } from "lucide-react";
import { CHARACTER_MAP } from "@/components/AvatarCharacters";
import { logout } from "@/lib/firebase";
import { useProfile } from "@/hooks/useProfile";
import AuthModal from "@/components/AuthModal";
import { useToast } from "@/components/ui/use-toast";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Customizer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/create";
  const { toast } = useToast();
  
  const { profile, updateProfile, loading, user } = useProfile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [avatar, setAvatar] = useState<Avatar>(profile.avatar);
  const [nickname, setNickname] = useState<string>(profile.nickname);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    setAvatar(profile.avatar);
    setNickname(profile.nickname);
  }, [profile]);

  const tabs = ["Color", "Body", "Accent", "Eyes", "Face", "Hat"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Color");

  const valid = useMemo(() => nickname.trim().length >= 2 && nickname.length <= 16, [nickname]);

  const save = async () => {
    if (!valid) return;
    await updateProfile({ ...profile, nickname: nickname.trim(), avatar });
    navigate(next);
  };

  const buyItem = (type: "HAT" | "COLOR" | "FACE", idOrColor: string) => {
    const cost = COSTS[type];
    if (profile.credits < cost) {
      toast({ title: "Not enough credits!", description: `You need ${cost - profile.credits} more coins.`, variant: "destructive" });
      return;
    }

    const newProfile = { ...profile, credits: profile.credits - cost };
    if (type === "HAT") newProfile.unlockedHats = [...profile.unlockedHats, idOrColor];
    if (type === "COLOR") newProfile.unlockedColors = [...profile.unlockedColors, idOrColor];
    
    updateProfile(newProfile);
    toast({ title: "Unlocked!", description: "New item added to your collection" });
  };

  const isLocked = (type: "HAT" | "COLOR", idOrColor: string) => {
    if (type === "HAT") return !profile.unlockedHats.includes(idOrColor);
    if (type === "COLOR") return !profile.unlockedColors.includes(idOrColor.toLowerCase()) && !profile.unlockedColors.includes(idOrColor.toUpperCase());
    return false;
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      
      <nav className="container py-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
            <Coins size={16} className="text-primary" />
            <span className="font-mono font-bold">{profile.credits}</span>
          </div>
          
          {user && !user.isAnonymous ? (
            <button onClick={() => logout()} className="btn-ghost p-2 rounded-full" title="Sign out">
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="btn-primary p-2 px-4 rounded-full text-xs flex items-center gap-2">
              <UserIcon size={14} /> Sign In
            </button>
          )}
        </div>
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
              >
                <Dice5 size={16} />
              </button>
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-1 p-1 rounded-full bg-white/5 border border-white/[0.06] w-fit mx-auto overflow-x-auto max-w-full">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
              >{t}</button>
            ))}
          </div>

          <div className="mt-8 min-h-[180px]">
            {["Color", "Body", "Accent", "Eyes"].includes(tab) && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-x-3 gap-y-6 justify-items-center">
                {(tab === "Color" ? AVATAR_BG_COLORS : tab === "Body" ? AVATAR_BODY_COLORS : tab === "Accent" ? AVATAR_ACCENT_COLORS : AVATAR_EYE_COLORS).map((c) => {
                  const locked = isLocked("COLOR", c);
                  const active = (tab === "Color" ? avatar.bgColor : tab === "Body" ? avatar.bodyColor : tab === "Accent" ? avatar.accentColor : avatar.eyeColor) === c;
                  
                  return (
                    <div key={c} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (locked) buyItem("COLOR", c);
                          else {
                            if (tab === "Color") setAvatar(a => ({ ...a, bgColor: c }));
                            if (tab === "Body") setAvatar(a => ({ ...a, bodyColor: c }));
                            if (tab === "Accent") setAvatar(a => ({ ...a, accentColor: c }));
                            if (tab === "Eyes") setAvatar(a => ({ ...a, eyeColor: c }));
                          }
                        }}
                        className={`w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-95 relative flex items-center justify-center ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                        style={{ background: c }}
                      >
                        {locked && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <Lock size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                      {locked && (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
                          <Coins size={8} /> {COSTS.COLOR}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "Face" && (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-4 justify-items-center">
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
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-4 gap-y-6 justify-items-center">
                {AVATAR_HATS.map((h) => {
                  const locked = isLocked("HAT", h.id);
                  const active = avatar.hat === h.id;
                  
                  return (
                    <div key={h.id || "none"} className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => {
                          if (locked) buyItem("HAT", h.id);
                          else setAvatar((a) => ({ ...a, hat: h.id }));
                        }}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 ${active ? "bg-white/10 ring-1 ring-primary" : ""}`}
                      >
                        <AvatarView avatar={{ ...avatar, hat: h.id }} size={56} className={locked ? "opacity-50 grayscale" : ""} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{h.label}</span>
                        {locked && (
                          <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 border border-white/10 shadow-lg">
                            <Lock size={10} className="text-primary" />
                          </div>
                        )}
                      </button>
                      {locked && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Coins size={10} /> {COSTS.HAT}
                        </div>
                      )}
                    </div>
                  );
                })}
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