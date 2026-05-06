import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArtGem } from "./ArtGem";
import { AVATAR_HATS } from "@/lib/avatar";
import { RewardReveal } from "./RewardReveal";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Secret";

interface RarityData {
  color: string;
  glow: string;
  label: string;
  rewards: { type: "gems" | "hat", id?: string, amount?: number, label: string }[];
}

const RARITIES: Record<Rarity, RarityData> = {
  Common: { 
    color: "#888880", glow: "rgba(136, 136, 128, 0.3)", label: "Common",
    rewards: [{ type: "gems", amount: 50, label: "50 Gems" }]
  },
  Rare: { 
    color: "#48DBFB", glow: "rgba(72, 219, 251, 0.4)", label: "Rare",
    rewards: [
      { type: "gems", amount: 150, label: "150 Gems" },
      { type: "hat", id: "pirate", label: "Pirate Hat" }
    ]
  },
  Epic: { 
    color: "#A29BFE", glow: "rgba(162, 155, 254, 0.5)", label: "Epic",
    rewards: [
      { type: "gems", amount: 500, label: "500 Gems" },
      { type: "hat", id: "viking", label: "Viking Helmet" }
    ]
  },
  Legendary: { 
    color: "#FFD93D", glow: "rgba(255, 217, 61, 0.6)", label: "Legendary",
    rewards: [
      { type: "gems", amount: 2000, label: "2000 Gems" },
      { type: "hat", id: "golden_crown", label: "Golden Crown" },
      { type: "hat", id: "diamond_hat", label: "Diamond Hat" }
    ]
  },
  Secret: { 
    color: "#FFFFFF", glow: "rgba(255, 255, 255, 0.8)", label: "Secret",
    rewards: [
      { type: "hat", id: "secret_mask", label: "Void Mask" },
      { type: "hat", id: "glitch_eyes", label: "Glitch Eyes" }
    ]
  },
};

function Chest3D({ color, glow, isUpgrading, isSecret, rotation }: { color: string, glow: string, isUpgrading: boolean, isSecret: boolean, rotation: number }) {
  const layers = 8;
  
  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      <motion.div
        animate={{ 
          scale: isUpgrading ? [1, 1.8, 1] : [1, 1.2, 1],
          opacity: isUpgrading ? [0.4, 0.9, 0.4] : [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 rounded-full blur-[60px] pointer-events-none"
        style={{ backgroundColor: isSecret ? "white" : glow }}
      />
      
      <motion.div 
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: rotation }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="relative w-48 h-48"
      >
        {[...Array(layers)].map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0"
            style={{ transform: `translateZ(${i * 3}px)` }}
          >
            <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${isSecret ? "contrast-150" : ""}`}>
              <defs>
                <pattern id="secretPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                   <motion.rect 
                     width="10" height="10" fill="black" 
                     animate={{ fill: ["#000", "#fff", "#000"] }}
                     transition={{ duration: 0.2, repeat: Infinity }}
                   />
                   <rect x="0" y="0" width="5" height="5" fill="white" opacity="0.5" />
                </pattern>
                <linearGradient id={`chestGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isSecret ? "url(#secretPattern)" as any : (i === layers - 1 ? color : "#1a1a1a")} />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
              </defs>
              
              <path d="M20 40 Q20 20 50 20 Q80 20 80 40 L85 45 H15 L20 40Z" fill={isSecret ? "url(#secretPattern)" : `url(#chestGrad-${i})`} stroke={i === layers - 1 ? (isSecret ? "white" : "white") : "none"} strokeWidth={isSecret ? "1" : "0.5"} />
              <path d="M15 45 H85 V75 Q85 85 75 85 H25 Q15 85 15 75 V45Z" fill={isSecret ? "url(#secretPattern)" : `url(#chestGrad-${i})`} stroke={i === layers - 1 ? (isSecret ? "white" : "white") : "none"} strokeWidth={isSecret ? "1" : "0.5"} />
              
              {i === layers - 1 && (
                <>
                  <rect x="30" y="20" width="6" height="65" fill={isSecret ? "white" : "#C0C0C0"} opacity={isSecret ? 0.8 : 0.3} />
                  <rect x="64" y="20" width="6" height="65" fill={isSecret ? "white" : "#C0C0C0"} opacity={isSecret ? 0.8 : 0.3} />
                  <circle cx="50" cy="55" r="5" fill={isSecret ? "black" : "#FFD700"} stroke="white" strokeWidth="1" />
                </>
              )}
            </svg>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function CrateDrop({ onComplete }: { onComplete: (reward: any) => void }) {
  const [rarity, setRarity] = useState<Rarity>("Common");
  const [taps, setTaps] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [shake, setShake] = useState(false);

  const handleTap = () => {
    if (reward || isUpgrading) return;
    
    // Subtle screen shake
    setShake(true);
    setTimeout(() => setShake(false), 200);

    if (taps >= 3) {
      setIsOpening(true);
      setTimeout(() => {
        const pool = RARITIES[rarity].rewards;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        setReward({ ...selected, rarity });
      }, 1000);
      return;
    }

    const nextTaps = taps + 1;
    setTaps(nextTaps);

    let upgraded = false;
    let secretTriggered = false;
    const roll = Math.random();
    
    // Secret check (1%)
    if (roll < 0.01 && rarity !== "Secret") {
      secretTriggered = true;
      upgraded = true;
    } else {
      if (rarity === "Common" && roll < 0.50) upgraded = true;
      else if (rarity === "Rare" && roll < 0.25) upgraded = true;
      else if (rarity === "Epic" && roll < 0.10) upgraded = true;
    }

    if (upgraded) {
      setRotation(prev => prev + 360);
      setIsUpgrading(true);
      setTimeout(() => {
        if (secretTriggered) {
          setRarity("Secret");
        } else {
          const order: Rarity[] = ["Common", "Rare", "Epic", "Legendary"];
          const nextRarity = order[order.indexOf(rarity) + 1] || rarity;
          setRarity(nextRarity);
        }
        setTimeout(() => setIsUpgrading(false), 500);
      }, 100);
    }
  };

  return (
    <motion.div 
      animate={shake ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-3xl cursor-pointer select-none overflow-hidden" 
      onClick={handleTap}
    >
      <AnimatePresence>
        {!reward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -20, 0],
              x: isOpening ? [-1, 1, -1, 1, 0] : 0
            }}
            exit={{ scale: 2, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 0.05, repeat: Infinity }
            }}
            className="relative"
          >
            <Chest3D 
              color={RARITIES[rarity].color} 
              glow={RARITIES[rarity].glow} 
              isUpgrading={isUpgrading} 
              isSecret={rarity === "Secret"} 
              rotation={rotation}
            />
            
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-white/20 ${i < taps ? "bg-primary shadow-[0_0_10px_rgba(232,255,71,0.5)]" : "bg-white/5"}`} />
              ))}
            </div>

            <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-center w-full">
               <motion.span 
                 key={rarity}
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className={`text-4xl font-display font-black uppercase italic tracking-tighter ${rarity === "Secret" ? "text-white drop-shadow-[0_0_10px_white]" : ""}`}
                 style={{ color: rarity === "Secret" ? "white" : RARITIES[rarity].color }}
               >
                 {RARITIES[rarity].label}
               </motion.span>
               <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-2">TAP TO UPGRADE</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reward && (
          <RewardReveal 
            reward={reward} 
            onContinue={() => {
              onComplete(reward);
              setReward(null);
            }} 
          />
        )}
      </AnimatePresence>

      {rarity === "Secret" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay"
        />
      )}
    </motion.div>
  );
}
