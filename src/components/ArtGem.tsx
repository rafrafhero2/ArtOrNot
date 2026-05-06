import { motion } from "framer-motion";

export function ArtGem({ size = 20, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48DBFB" />
          <stop offset="100%" stopColor="#A29BFE" />
        </linearGradient>
        <filter id="gemGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <motion.path
        d="M12 2L4 10L12 22L20 10L12 2Z"
        fill="url(#gemGradient)"
        stroke="white"
        strokeWidth="0.5"
        style={{ filter: "url(#gemGlow)" }}
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 0.9, 0.8] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <path d="M12 2V22M4 10H20M12 2L20 10L12 22L4 10L12 2Z" stroke="white" strokeWidth="0.2" opacity="0.5" />
    </svg>
  );
}

export function GemGainAnimation({ amount, onComplete }: { amount: number, onComplete?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden"
    >
      {/* Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Screen Shake Container */}
      <motion.div
        animate={{ 
          x: [0, -10, 10, -5, 5, 0],
          y: [0, 5, -5, 2, -2, 0]
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Sunburst Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 5, rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 bg-[conic-gradient(from_0deg,transparent_0%,rgba(72,219,251,0.2)_5%,transparent_10%,rgba(72,219,251,0.2)_15%,transparent_20%,rgba(72,219,251,0.2)_25%,transparent_30%,rgba(72,219,251,0.2)_35%,transparent_40%,rgba(72,219,251,0.2)_45%,transparent_50%,rgba(72,219,251,0.2)_55%,transparent_60%,rgba(72,219,251,0.2)_65%,transparent_70%,rgba(72,219,251,0.2)_75%,transparent_80%,rgba(72,219,251,0.2)_85%,transparent_90%,rgba(72,219,251,0.2)_95%,transparent_100%)] rounded-full blur-xl mix-blend-screen"
        />

        {/* Ray / Shine Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0.5], scale: [0, 4, 3], rotate: 180 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-64 h-64 bg-gradient-to-r from-primary/20 via-primary/40 to-transparent rounded-full blur-3xl mix-blend-screen"
        />

        <motion.div
          initial={{ scale: 0, y: 40 }}
          animate={{ scale: [0, 1.3, 1], y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center gap-6 bg-black/90 backdrop-blur-2xl border border-white/20 p-10 rounded-[40px] shadow-[0_0_100px_rgba(72,219,251,0.4)] relative z-10"
        >
          {/* Inner Shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[40px] pointer-events-none" />
          
          <div className="relative">
            <ArtGem size={72} className="drop-shadow-[0_0_30px_rgba(72,219,251,0.8)]" />
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-white/20 blur-xl rounded-full"
            />
          </div>

          <div className="flex flex-col">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm uppercase tracking-[0.4em] text-primary font-black drop-shadow-sm"
            >
              Victory Reward
            </motion.span>
            <motion.span 
              className="text-7xl font-display font-black text-white italic tracking-tight"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              +{amount}
            </motion.span>
          </div>
        </motion.div>
        
        {/* Burst of floating gems and sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1.5, 0],
              x: (Math.random() - 0.5) * 800,
              y: (Math.random() - 0.5) * 600,
              rotate: Math.random() * 360,
              opacity: 0
            }}
            transition={{ duration: 1.2, delay: 0.2 + Math.random() * 0.3, ease: "easeOut" }}
            className="absolute"
          >
            {i % 2 === 0 ? <ArtGem size={24} /> : <div className="w-2 h-2 bg-white rounded-full blur-[2px]" />}
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Right Notification */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ delay: 0.5, type: "spring", damping: 20 }}
        className="absolute bottom-10 right-10 flex items-center gap-4 bg-primary text-[#0D0D0D] px-6 py-4 rounded-2xl font-bold shadow-2xl z-50"
      >
        <ArtGem size={24} className="brightness-0" />
        <span className="text-sm tracking-tight uppercase">You have earned {amount} Gems!</span>
      </motion.div>
    </motion.div>
  );
}
