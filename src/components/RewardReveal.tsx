import { motion, AnimatePresence } from "framer-motion";
import { ArtGem } from "./ArtGem";
import { AVATAR_HATS } from "@/lib/avatar";

interface Reward {
  type: "gems" | "hat";
  id?: string;
  amount?: number;
  label: string;
  rarity?: string;
}

export function RewardReveal({ reward, onContinue }: { reward: Reward, onContinue: () => void }) {
  const hatSvg = reward.type === "hat" ? AVATAR_HATS.find(h => h.id === reward.id)?.svg : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6"
    >
      <div className="relative w-full max-w-lg flex flex-col items-center">
        {/* Pedestal / Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        {/* Flash */}
        <motion.div
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.6 }}
          className="absolute w-20 h-20 bg-white rounded-full z-20"
        />

        <motion.div
          initial={{ scale: 0, rotateY: 0 }}
          animate={{ scale: 1.2, rotateY: 360 }}
          transition={{ 
            scale: { type: "spring", stiffness: 300, damping: 20 },
            rotateY: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
          className="relative z-10 flex items-center justify-center min-h-[200px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {reward.type === "gems" ? (
            <ArtGem size={120} className="drop-shadow-[0_0_30px_rgba(72,219,251,0.6)]" />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-4">
              <svg viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: hatSvg || "" }} />
            </div>
          )}
        </motion.div>

        <div className="mt-16 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display text-4xl font-black italic tracking-tighter text-white mb-2">
              {reward.label}
            </h2>
            <div className="pill bg-white/10 border border-white/10 inline-block px-6 py-1 text-xs uppercase tracking-widest font-bold">
              {reward.rarity || "Unlocked"}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={onContinue}
            className="btn-primary mt-12 px-12 py-4 text-lg font-black shadow-[0_0_30px_rgba(232,255,71,0.3)]"
          >
            CONTINUE
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
