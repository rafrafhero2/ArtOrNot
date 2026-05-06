import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Clock, ArrowLeft, Tag, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AVATAR_HATS, loadProfile, saveProfile, type Rarity } from "@/lib/avatar";
import { ArtGem } from "@/components/ArtGem";
import { toast } from "sonner";
import { ThemeBackground } from "@/components/ThemeBackground";

const PRICES: Record<Rarity, number> = {
  Common: 50,
  Rare: 150,
  Epic: 500,
  Legendary: 2000,
  Secret: 9999
};

export default function Shop() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(loadProfile());
  const [timeLeft, setTimeLeft] = useState("");
  const [shopItems, setShopItems] = useState<any[]>([]);

  const generateShopItems = () => {
    const availableHats = AVATAR_HATS.filter(h => h.id !== "");
    const selected = [];
    for (let i = 0; i < 6; i++) {
      const hat = availableHats[Math.floor(Math.random() * availableHats.length)];
      const rarityOrder: Rarity[] = ["Common", "Rare", "Epic", "Legendary", "Secret"];
      const rarity = hat.rarity || rarityOrder[Math.floor(Math.random() * 4)];
      selected.push({
        ...hat,
        rarity,
        price: PRICES[rarity],
        discount: Math.random() < 0.2 ? 0.2 : 0,
        id_key: Math.random().toString(36).substr(2, 9)
      });
    }
    setShopItems(selected);
  };

  useEffect(() => {
    generateShopItems();
    const interval = setInterval(() => {
      const now = new Date();
      const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
      const diff = nextHour.getTime() - now.getTime();
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      if (diff < 1000) generateShopItems();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const buyItem = (item: any) => {
    if (!profile) return;
    const finalPrice = Math.floor(item.price * (1 - item.discount));
    if (profile.credits < finalPrice) {
      toast.error("Not enough Art Gems!");
      return;
    }
    if (profile.unlockedHats.includes(item.id)) {
      toast.info("You already own this item!");
      return;
    }
    const newProfile = {
      ...profile,
      credits: profile.credits - finalPrice,
      unlockedHats: [...profile.unlockedHats, item.id]
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    toast.success(`Purchased ${item.label}!`, {
      icon: <Sparkles className="text-primary" size={16} />
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 overflow-hidden selection:bg-primary/30">
      <ThemeBackground bgHue="#0A0F0A" glowColor="rgba(232, 255, 71, 0.05)" />
      
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-20, 1000],
              opacity: [0, 0.3, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              delay: Math.random() * 20,
              ease: "linear"
            }}
            className="absolute top-[-20px] w-1 h-1 bg-primary rounded-full blur-[1px]"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-heading font-black italic text-xl tracking-tighter">THE <span className="text-primary">SHOP</span></span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
              <ArtGem size={20} className="drop-shadow-[0_0_10px_rgba(72,219,251,0.5)]" />
              <span className="font-mono font-black text-xl tracking-tight">{profile?.credits || 0}</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 text-primary">
              <Clock size={16} className="animate-pulse" />
              <span className="font-mono font-bold text-sm tracking-widest">{timeLeft}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl pt-32 px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <TrendingUp size={12} /> Daily Rotation
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-black italic tracking-tighter leading-none">
              GEAR <br /> <span className="text-white/20">UP.</span>
            </h1>
          </div>
          <div className="max-w-xs text-muted-foreground text-sm leading-relaxed">
            Every hour we refresh our collection with rare and limited items. Once they're gone, they're gone.
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {shopItems.map((item, i) => {
            const isSecret = item.rarity === "Secret";
            const price = Math.floor(item.price * (1 - item.discount));
            const isOwned = profile?.unlockedHats.includes(item.id);
            
            return (
              <motion.div
                key={item.id_key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className={`group relative flex flex-col bg-gradient-to-b from-white/[0.03] to-transparent rounded-[40px] border border-white/5 p-8 transition-all hover:border-white/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden ${isSecret ? "border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.05)]" : ""}`}
              >
                {/* Rarity Glow */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-0 group-hover:opacity-20 transition-opacity blur-[80px] pointer-events-none"
                  style={{ 
                    backgroundColor: isSecret ? "white" : 
                      item.rarity === "Rare" ? "#48DBFB" :
                      item.rarity === "Epic" ? "#A29BFE" :
                      item.rarity === "Legendary" ? "#FFD93D" : "white"
                  }}
                />

                <div className="flex justify-between items-start mb-8">
                  <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    item.rarity === "Common" ? "bg-white/5 border-white/10 text-white/40" :
                    item.rarity === "Rare" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    item.rarity === "Epic" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                    item.rarity === "Legendary" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                    "bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  }`}>
                    {item.rarity}
                  </div>
                  {item.discount > 0 && (
                    <div className="flex items-center gap-1 text-red-400 font-black text-[10px] uppercase tracking-wider">
                      <Tag size={12} /> -{Math.round(item.discount * 100)}%
                    </div>
                  )}
                </div>

                <div className="relative aspect-square flex items-center justify-center mb-10">
                  <div className={`absolute inset-0 bg-white/5 rounded-[32px] transform rotate-3 group-hover:rotate-6 transition-transform duration-500 ${isSecret ? "grayscale contrast-125" : ""}`} />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-32 h-32"
                  >
                    <svg 
                      className={`w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] ${isSecret ? "grayscale contrast-200 animate-pulse" : ""}`} 
                      viewBox="0 0 100 100" 
                      dangerouslySetInnerHTML={{ __html: item.svg }} 
                    />
                  </motion.div>
                  {isSecret && (
                    <div className="absolute inset-0 z-20 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,0.05)_10%,transparent_20%)] animate-spin-slow" />
                  )}
                </div>

                <div className="mt-auto">
                  <h3 className="font-display text-3xl font-bold mb-2 tracking-tight group-hover:text-primary transition-colors">{item.label}</h3>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-1.5 font-mono font-black text-2xl">
                      <ArtGem size={18} /> {price}
                    </div>
                    {item.discount > 0 && (
                      <span className="text-white/20 line-through text-sm font-mono">{item.price}</span>
                    )}
                  </div>

                  <button
                    onClick={() => buyItem(item)}
                    disabled={isOwned}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                      isOwned 
                      ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-primary shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {isOwned ? "ALREADY OWNED" : (
                      <>
                        <ShoppingBag size={16} /> GET IT NOW
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
         <div className="w-1 h-8 bg-gradient-to-b from-white to-transparent rounded-full" />
      </div>
    </div>
  );
}
