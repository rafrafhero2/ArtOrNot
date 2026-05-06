import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Edit2, Check, Lock, Sparkles, User, Palette } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { loadProfile, saveProfile, AVATAR_HATS, type Profile } from "@/lib/avatar";
import AvatarView from "@/components/AvatarView";
import { ThemeBackground } from "@/components/ThemeBackground";
import { ArtGem } from "@/components/ArtGem";

export default function Wardrobe() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(loadProfile());
  const [selectedHat, setSelectedHat] = useState(profile?.avatar.hat || "");

  const handleEquip = (hatId: string) => {
    if (!profile) return;
    const newProfile = {
      ...profile,
      avatar: { ...profile.avatar, hat: hatId }
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    setSelectedHat(hatId);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white relative overflow-hidden selection:bg-primary/30">
      <ThemeBackground bgHue="#0A0F0A" glowColor="rgba(232, 255, 71, 0.03)" />
      
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {[...Array(8)].map((_, i) => (
           <motion.div
             key={i}
             animate={{ 
               x: [0, (i % 2 === 0 ? 150 : -150), 0],
               y: [0, (i % 3 === 0 ? 150 : -150), 0],
               rotate: [0, 180, 360],
               scale: [1, 1.2, 1],
               opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
             className="absolute w-[500px] h-[500px] border-[0.5px] border-primary/20 rounded-full"
             style={{ 
               top: `${Math.random() * 100}%`, 
               left: `${Math.random() * 100}%`,
               filter: 'blur(80px)'
             }}
           />
         ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-heading font-black italic text-xl tracking-tighter uppercase">Wardrobe</span>
          </Link>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
              <ArtGem size={18} />
              <span className="font-mono font-black text-lg">{profile?.credits || 0}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl pt-32 pb-32 px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Character Preview */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-32 flex flex-col items-center">
              <div className="relative mb-12 group">
                {/* Pedestal Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                
                <motion.div
                  key={selectedHat}
                  initial={{ scale: 0.9, opacity: 0, rotateY: -20 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  className="relative z-10 drop-shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)]"
                >
                  <AvatarView avatar={profile?.avatar!} size={320} />
                </motion.div>
                
                {/* Floating Props */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-10 -right-10 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20"
                >
                   <Sparkles className="text-primary" size={24} />
                </motion.div>
              </div>

              <div className="text-center w-full max-w-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                   <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Active Avatar</span>
                   <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20" />
                </div>
                <h1 className="font-display text-5xl font-black italic mb-6 tracking-tighter uppercase">{profile?.nickname}</h1>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => navigate("/me")}
                    className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all"
                  >
                    <Palette size={14} /> STYLE
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 py-4 bg-primary text-black hover:bg-primary/90 rounded-2xl text-xs font-black transition-all shadow-[0_10px_30px_-10px_rgba(232,255,71,0.4)]"
                  >
                    <Check size={14} /> EQUIPPED
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Item Grid */}
          <div className="flex-grow">
            <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
              <div>
                <h2 className="font-display text-4xl font-black italic tracking-tight uppercase mb-2">My Collection</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                   <User size={14} /> Unlocked {profile?.unlockedHats.length} / {AVATAR_HATS.length} items
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {AVATAR_HATS.map((hat, i) => {
                const isUnlocked = profile?.unlockedHats.includes(hat.id);
                const isSelected = selectedHat === hat.id;
                const isSecret = hat.rarity === "Secret";

                return (
                  <motion.div
                    key={hat.id || "none"}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={isUnlocked ? { y: -8, scale: 1.02 } : {}}
                    onClick={() => isUnlocked && handleEquip(hat.id)}
                    className={`group relative flex flex-col items-center p-8 rounded-[32px] border transition-all cursor-pointer overflow-hidden ${
                      isSelected 
                        ? "bg-primary/10 border-primary/50 shadow-[0_20px_40px_-10px_rgba(232,255,71,0.1)]" 
                        : isUnlocked 
                          ? "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]" 
                          : "bg-black/40 border-white/5 opacity-50 grayscale"
                    }`}
                  >
                    {/* Item Background Decor */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    {isSecret && isUnlocked && (
                       <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)] animate-pulse" />
                    )}

                    <div className="relative w-24 h-24 flex items-center justify-center z-10 mb-6">
                      {hat.id === "" ? (
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                           <span className="text-[10px] text-white/40 font-bold">X</span>
                        </div>
                      ) : (
                        <div className="relative">
                           <svg 
                            className={`w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110 ${isSecret ? "contrast-150 animate-pulse" : ""}`} 
                            viewBox="0 0 100 100" 
                            dangerouslySetInnerHTML={{ __html: hat.svg }} 
                          />
                          {isSecret && (
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-0 bg-white blur-2xl rounded-full -z-10"
                            />
                          )}
                        </div>
                      )}
                      
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock size={24} className="text-white/20" />
                        </div>
                      )}
                    </div>

                    <div className="text-center relative z-10 w-full">
                      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? "text-primary" : "text-white/40 group-hover:text-white/80"}`}>
                        {hat.label || "No Hat"}
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {isSelected && (
                          <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
                            <Check size={8} /> Active
                          </span>
                        )}
                        {isSecret && isUnlocked && (
                          <span className="text-[8px] font-black text-white uppercase bg-white/20 px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                            <Sparkles size={8} /> Secret
                          </span>
                        )}
                      </div>
                    </div>

                    {isSecret && isUnlocked && (
                      <div className="absolute -top-1 -right-1 bg-white text-black text-[7px] font-black px-2 py-1 rounded-bl-xl shadow-2xl z-20">
                         VOID TIER
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
