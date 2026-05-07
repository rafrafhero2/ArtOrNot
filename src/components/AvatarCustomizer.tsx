import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, Check, Lock, RefreshCw, Loader2 } from "lucide-react";
import AvatarView from "@/components/AvatarView";
import { ArtGem } from "./ArtGem";
import {
  AVATAR_BG_COLORS, AVATAR_BODY_COLORS, AVATAR_ACCENT_COLORS, AVATAR_EYE_COLORS,
  AVATAR_FACES, AVATAR_HATS,
  randomAvatar, randomNickname, COSTS,
  type Avatar, type Profile
} from "@/lib/avatar";
import { CHARACTER_MAP } from "@/components/AvatarCharacters";
import { useToast } from "@/components/ui/use-toast";

const ease = [0.16, 1, 0.3, 1] as const;

interface AvatarCustomizerProps {
  profile: Profile;
  updateProfile: (p: Profile) => void;
  onSave?: () => void;
  compact?: boolean;
}

export default function AvatarCustomizer({ profile, updateProfile, onSave, compact }: AvatarCustomizerProps) {
  const { toast } = useToast();
  const [avatar, setAvatar] = useState<Avatar>(profile.avatar);
  const [nickname, setNickname] = useState<string>(profile.nickname);
  
  const tabs = ["Color", "Body", "Accent", "Eyes", "Face", "Hat"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Color");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const valid = useMemo(() => nickname.trim().length >= 2 && nickname.length <= 16, [nickname]);

  const save = async () => {
    if (!valid || isSaving || isSaved) return;
    setIsSaving(true);
    await updateProfile({ ...profile, nickname: nickname.trim(), avatar });
    setIsSaving(false);
    setIsSaved(true);
    
    // Show saved animation for 1 second then redirect
    setTimeout(() => {
      if (onSave) onSave();
    }, 1000);
  };

  const buyItem = (type: "HAT" | "COLOR" | "FACE", idOrColor: string) => {
    const cost = COSTS[type];
    if (profile.credits < cost) {
      toast({ title: "Not enough gems!", description: `You need ${cost - profile.credits} more gems.`, variant: "destructive" });
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

  return (
    <div className={`flex flex-col ${compact ? "gap-4" : "gap-8"}`}>
      <div className="flex flex-col items-center">
        <motion.div
          key={JSON.stringify(avatar)}
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <AvatarView avatar={avatar} size={compact ? 100 : 140} />
        </motion.div>

        <div className="mt-6 flex items-center gap-2 w-full max-w-xs">
          <input
            value={nickname} maxLength={16}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-lg outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => setNickname(randomNickname())}
            className="text-muted-foreground hover:text-primary p-2 transition-colors"
            title="Randomize name"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-1 p-1 rounded-full bg-white/5 border border-white/[0.06] w-fit mx-auto overflow-x-auto max-w-full">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${tab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
          >{t}</button>
        ))}
      </div>

      <div className={`${compact ? "min-h-[140px]" : "min-h-[180px]"}`}>
        {["Color", "Body", "Accent", "Eyes"].includes(tab) && (
          <div className={`grid ${compact ? "grid-cols-5" : "grid-cols-5 sm:grid-cols-10"} gap-x-3 gap-y-4 justify-items-center`}>
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
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 relative flex items-center justify-center ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                    style={{ background: c }}
                  >
                    {locked && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <Lock size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                  {locked && (
                    <div className="flex items-center gap-0.5 text-[8px] font-bold text-primary">
                      <ArtGem size={8} /> {COSTS.COLOR}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "Face" && (
          <div className={`grid ${compact ? "grid-cols-5" : "grid-cols-5 sm:grid-cols-10"} gap-3 justify-items-center`}>
            {AVATAR_FACES.map((f) => {
              const Character = CHARACTER_MAP[f] || CHARACTER_MAP.bunny;
              return (
                <button
                  key={f}
                  onClick={() => setAvatar((a) => ({ ...a, characterId: f }))}
                  className={`w-10 h-10 rounded-xl grid place-items-center hover:bg-white/5 transition-colors ${avatar.characterId === f ? "bg-white/10 ring-1 ring-primary" : ""}`}
                >
                  <Character size={24} color={avatar.bodyColor} accentColor={avatar.accentColor} eyeColor={avatar.eyeColor} />
                </button>
              );
            })}
          </div>
        )}

        {tab === "Hat" && (
          <div className={`grid ${compact ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-6"} gap-x-4 gap-y-4 justify-items-center`}>
            {AVATAR_HATS.map((h) => {
              const locked = isLocked("HAT", h.id);
              const active = avatar.hat === h.id;
              
              return (
                <div key={h.id || "none"} className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (locked) buyItem("HAT", h.id);
                      else setAvatar((a) => ({ ...a, hat: h.id }));
                    }}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-all ${active ? "bg-white/10 ring-1 ring-primary" : ""}`}
                  >
                    <AvatarView avatar={{ ...avatar, hat: h.id }} size={compact ? 44 : 56} className={locked ? "opacity-50 grayscale" : ""} />
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{h.label}</span>
                    {locked && (
                      <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1 border border-white/10 shadow-lg">
                        <Lock size={8} className="text-primary" />
                      </div>
                    )}
                  </button>
                  {locked && (
                    <div className="flex items-center gap-1 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <ArtGem size={8} /> {COSTS.HAT}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between items-center gap-3">
        <button
          onClick={() => { setAvatar(randomAvatar()); setNickname(randomNickname()); }}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          <Dice5 size={14} /> Surprise me
        </button>
        <button 
          onClick={save} 
          disabled={!valid || isSaving || isSaved} 
          className={`btn-primary py-2 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-xl relative overflow-hidden min-w-[140px] ${isSaved ? "bg-green-500 border-green-600 hover:bg-green-500" : ""}`}
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                <Loader2 size={16} className="animate-spin" /> Saving...
              </motion.div>
            ) : isSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                <Check size={16} /> Saved!
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                <Check size={16} /> Save Changes
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
