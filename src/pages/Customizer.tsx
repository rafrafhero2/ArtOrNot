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
import { ArtGem } from "@/components/ArtGem";
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
            <ArtGem size={16} />
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
          <AvatarCustomizer 
            profile={profile} 
            updateProfile={updateProfile} 
            onSave={() => navigate(next)}
          />
        </motion.div>
      </div>
    </div>
  );
}