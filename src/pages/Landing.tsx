import { useRef, useEffect, useCallback, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, Variants } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import Lenis from "lenis";
import { CHARACTER_MAP } from "@/components/AvatarCharacters";
import { useProfile } from "@/hooks/useProfile";
import AuthModal from "@/components/AuthModal";
import { logout } from "@/lib/firebase";

// ═══════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════

const springTransition = { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: (i: any) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...springTransition, delay: i * 0.12 },
  }),
};

const brushStroke: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, delay: 0.8, ease: "easeInOut" },
      opacity: { duration: 0.4, delay: 0.8 }
    }
  }
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.1, staggerChildren: 0.12 },
  },
};

import { ThemeBackground } from "@/components/ThemeBackground";
import { ArtGem } from "@/components/ArtGem";

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════
function generateCurve(
  x1: number, y1: number, x2: number, y2: number, points: number
) {
  const result = [];
  for (let i = 0; i < points; i++) {
    const t = i / points;
    const cx = x1 + (x2 - x1) * 0.5 + Math.sin(t * Math.PI * 2) * (x2 - x1) * 0.3;
    const cy = y1 + (y2 - y1) * 0.5 + Math.cos(t * Math.PI * 3) * (y2 - y1) * 0.2;
    const x = x1 + (x2 - x1) * t + Math.sin(t * Math.PI) * (cx - (x1 + x2) / 2);
    const y = y1 + (y2 - y1) * t + Math.cos(t * Math.PI) * (cy - (y1 + y2) / 2);
    result.push({ x, y });
  }
  return result;
}

// Removed ScrollControlledStrokes globally

// ═══════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════

function Hero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <ThemeBackground
        bgHue="#0A0F0A"
        glowColor="rgba(232, 255, 71, 0.2)"
        colors={["rgba(232, 255, 71, 0.3)", "rgba(255, 255, 255, 0.1)"]}
      />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h1
          custom={0}
          variants={fadeUp}
          className="font-heading text-[clamp(48px,9vw,110px)] font-bold leading-[0.95] tracking-tight mb-8"
        >
          One of you is{" "}
          <span className="relative inline-block px-2">
            <span className="gradient-text drop-shadow-[0_0_30px_rgba(232,255,71,0.4)]">lying</span>
            <svg
              className="absolute -bottom-2 left-0 w-full overflow-visible"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M2 8C30 2 70 2 100 6C130 10 170 10 198 4"
                stroke="#E8FF47"
                strokeWidth="4"
                strokeLinecap="round"
                variants={brushStroke}
              />
            </svg>
          </span>
          <span className="text-[#E8FF47]">.</span>
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          className="text-[#888880] text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
        >
          A high-stakes drawing party game where suspicion is the main brushstroke.
          <br className="hidden md:block" />
          Everyone draws. Only one doesn't know what.
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -4, backgroundColor: "rgba(232, 255, 71, 1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create")}
            className="bg-primary text-[#0D0D0D] font-heading font-bold rounded-full transition-colors duration-300 px-12 py-5 text-xl min-w-[240px]"
            id="cta-create-room"
          >
            Create a room
          </motion.button>
          <motion.button
            whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/me?next=/join")}
            className="pill border border-white/20 text-foreground font-semibold hover:border-white/50 bg-transparent transition-colors duration-300 text-xl px-12 py-5 min-w-[240px]"
            id="cta-join-room"
          >
            Join a room
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#888880]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs tracking-widest uppercase font-mono">
          Scroll to explore
        </span>
        <svg
          className="w-5 h-5 animate-bounce-soft"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════

const STEPS = [
  {
    num: "01",
    title: "Create a room",
    desc: "Get a 4-digit code and share it with your friends. It takes 2 seconds.",
    icon: "🏠",
  },
  {
    num: "02",
    title: "Everyone gets the word",
    desc: "All players see the secret word... except one. The Fake Artist gets nothing.",
    icon: "🤫",
  },
  {
    num: "03",
    title: "Draw one stroke at a time",
    desc: "Take turns adding a single brushstroke to the shared canvas. Blend in or stand out.",
    icon: "🎨",
  },
  {
    num: "04",
    title: "Vote & reveal",
    desc: "Who's the imposter? Vote them out. But if the Fake Artist guesses the word - they win!",
    icon: "🗳️",
  },
];

function StepCard({ step, i, scrollProgress }: { step: typeof STEPS[0], i: number, scrollProgress: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0% -10% 0%" });

  const borderRadius = useTransform(scrollProgress, [0.1 * i, 0.2 * i + 0.2], ["24px", "48px"]);
  const rotate = useTransform(scrollProgress, [0.1 * i, 0.2 * i + 0.2], [0, i % 2 === 0 ? 1 : -1]);

  return (
    <motion.div
      ref={ref}
      style={{ borderRadius, rotate }}
      variants={fadeUp}
      custom={i + 2}
      whileHover={{ y: -8, scale: 1.02 }}
      className="card group relative overflow-hidden bg-surface border border-white/[0.04] hover:border-[#48DBFB]/40 p-8 shadow-lg hover:shadow-[0_0_30px_rgba(72,219,251,0.15)]"
    >
      {/* Accent number badge */}
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-[#0D0D0D] font-mono font-bold text-lg mb-8 shadow-[0_0_20px_rgba(232,255,71,0.2)]">
        {step.num}
      </div>

      {/* Icon */}
      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{step.icon}</div>

      <h3 className="font-heading text-2xl font-bold mb-3">{step.title}</h3>
      <p className="text-[#888880] text-base leading-relaxed">{step.desc}</p>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(72,219,251,0.1)_0%,transparent_60%)]" />
    </motion.div>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden"
      id="how-it-works"
    >
      <ThemeBackground
        bgHue="#050C12"
        glowColor="rgba(72, 219, 251, 0.15)"
        colors={["rgba(72, 219, 251, 0.3)", "rgba(255, 255, 255, 0.1)"]}
      />
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="font-heading text-4xl md:text-5xl font-bold text-center mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            custom={1}
            variants={fadeUp}
            className="text-[#888880] text-center mb-16 text-lg"
          >
            Four steps. Infinite suspicion.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <StepCard key={step.num} step={step} i={i} scrollProgress={scrollYProgress} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════

const FEATURES = [
  {
    title: "Custom characters",
    desc: "Build your avatar with colors, faces, and hats. Express yourself before you even draw.",
    icon: <LucideIcons.User className="w-8 h-8 text-[#E8FF47]" />,
    preview: "avatar",
  },
  {
    title: "Real-time drawing",
    desc: "Every brushstroke syncs instantly across all players. Smooth, lag-free, satisfying.",
    icon: <LucideIcons.Pencil className="w-8 h-8 text-[#E8FF47]" />,
    preview: "canvas",
  },
  {
    title: "Live chat",
    desc: "Strategize, accuse, misdirect. The social deduction starts before the vote.",
    icon: <LucideIcons.MessageSquare className="w-8 h-8 text-[#E8FF47]" />,
    preview: "chat",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -8, scale: 1.02 }}
        className="card h-full flex flex-col items-center text-center p-10 group bg-surface border border-white/[0.04] hover:border-[#A29BFE]/40 hover:shadow-[0_0_40px_rgba(162,155,254,0.15)]"
        style={{ transformStyle: "preserve-3d", rotateX, rotateY, willChange: "transform" }}
      >
        {/* Feature preview area */}
        <div
          className="w-full h-56 rounded-2xl bg-card border border-white/[0.04] mb-8 flex items-center justify-center overflow-hidden relative shadow-inner"
          style={{ transform: "translateZ(30px)" }}
        >
          {feature.preview === "avatar" && <AvatarPreview />}
          {feature.preview === "canvas" && <CanvasPreview />}
          {feature.preview === "chat" && <ChatPreview />}
        </div>

        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500" style={{ transform: "translateZ(50px)" }}>
          {feature.icon}
        </div>
        <h3 className="font-heading text-2xl font-bold mb-4" style={{ transform: "translateZ(40px)" }}>{feature.title}</h3>
        <p className="text-[#888880] text-lg leading-relaxed" style={{ transform: "translateZ(20px)" }}>{feature.desc}</p>

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_100%,rgba(162,155,254,0.08)_0%,transparent_70%)]" />
      </motion.div>
    </motion.div>
  );
}

function AvatarPreview() {
  const characters = ["bunny", "panda", "fox", "frog", "devil", "robot", "ghost"];
  const bgColors = ["#FF6B6B", "#FECA57", "#48DBFB", "#A29BFE", "#55EFC4", "#FF9F43", "#C7FF6B"];
  const bodyColors = ["#FFFFFF", "#0D0D0D", "#FFD93D", "#6BCB77", "#A29BFE", "#FD79A8", "#48DBFB"];
  const hats = ["", "party", "crown", "chef", "halo", "headphones", "cap"];

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Indices for parts based on step
  const charIdx = step % characters.length;
  const bgIdx = (step + 2) % bgColors.length;
  const bodyIdx = (step + 4) % bodyColors.length;
  const hatIdx = step % hats.length;

  const currentLabel = ["Face", "Color", "Body", "Hat", "Style", "Ready!"][step];
  const Character = CHARACTER_MAP[characters[charIdx]] || CHARACTER_MAP.bunny;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
      {/* Background Pulse */}
      <motion.div
        key={`bg-${bgIdx}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.15 }}
        className="absolute w-40 h-40 rounded-full blur-3xl"
        style={{ backgroundColor: bgColors[bgIdx] }}
      />

      <div className="relative flex flex-col items-center">
        {/* Floating Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLabel}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute -top-8 px-3 py-1 bg-primary text-[#0D0D0D] rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(232,255,71,0.4)] z-20"
          >
            {currentLabel}
          </motion.div>
        </AnimatePresence>

        {/* The Avatar */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, step % 2 === 0 ? 2 : -2, 0]
          }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden"
          style={{ backgroundColor: bgColors[bgIdx] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${characters[charIdx]}-${bodyColors[bodyIdx]}`}
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Character size={64} color={bodyColors[bodyIdx]} />
            </motion.div>
          </AnimatePresence>

          {/* Hat Layer */}
          <AnimatePresence>
            {hats[hatIdx] && (
              <motion.div
                key={hats[hatIdx]}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Simplified Hat view or SVG */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 opacity-80">
                  {/* We can use the hat SVG from AVATAR_HATS if we want, but let's keep it simple for now or import it */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* UI Dots */}
        <div className="mt-6 flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: step === i ? 1.5 : 1,
                backgroundColor: step === i ? "#E8FF47" : "rgba(255,255,255,0.2)"
              }}
              className="w-1.5 h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 160;

    ctx.fillStyle = "#FAFAF5";
    ctx.fillRect(0, 0, 280, 160);

    let frame = 0;
    const colors = ["#E74C3C", "#3498DB", "#2ECC71", "#9B59B6"];
    let currentStroke = 0;

    const strokes = [
      generateCurve(40, 80, 120, 40, 30),
      generateCurve(100, 60, 200, 100, 30),
      generateCurve(160, 30, 240, 80, 30),
      generateCurve(60, 120, 220, 130, 30),
    ];

    function animate() {
      frame++;
      const strokeProgress = frame % 120;
      if (strokeProgress === 0) {
        currentStroke = (currentStroke + 1) % strokes.length;
        if (currentStroke === 0) {
          ctx.fillStyle = "#FAFAF5";
          ctx.fillRect(0, 0, 280, 160);
        }
      }

      const pts = strokes[currentStroke];
      const count = Math.min(Math.floor((strokeProgress / 120) * pts.length), pts.length);

      if (count >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = colors[currentStroke];
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < count; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return <canvas ref={canvasRef} className="rounded-lg" style={{ width: 280, height: 160 }} />;
}

function ChatPreview() {
  const allMessages = [
    { name: "SpicyPelican", text: "Definitely a cat 🐱", color: "#FF6B6B" },
    { name: "NoodleWitch", text: "hmm idk about that...", color: "#48DBFB" },
    { name: "CosmicOtter", text: "Player 3 is sus 👀", color: "#FECA57" },
    { name: "PixelNinja", text: "wait what are we drawing?", color: "#A29BFE" },
    { name: "TurboMango", text: "LMAO nice try", color: "#55EFC4" },
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => (prev >= allMessages.length ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, [allMessages.length]);

  return (
    <div className="w-full h-full p-4 flex flex-col justify-end gap-3 overflow-hidden bg-black/20">
      <AnimatePresence mode="popLayout">
        {allMessages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={`${i}-${visibleCount === 0}`} // Reset keys on restart
            layout
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="flex items-start gap-3 text-xs"
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 border border-white/10 shadow-sm"
              style={{ backgroundColor: msg.color }}
            />
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
              <span className="block font-mono text-[10px] font-bold mb-0.5" style={{ color: msg.color }}>
                {msg.name}
              </span>
              <p className="text-white/80 leading-snug">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Skeleton for "typing" effect when empty or transitioning */}
      {visibleCount < allMessages.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1 px-4 py-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
        </motion.div>
      )}
    </div>
  );
}

function Features() {
  return (
    <section className="relative py-32 overflow-hidden" id="features">
      <ThemeBackground
        bgHue="#0A0512"
        glowColor="rgba(162, 155, 254, 0.15)"
        colors={["rgba(162, 155, 254, 0.3)", "rgba(255, 107, 107, 0.2)"]}
      />
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-[#E8FF47]">fun</span>
          </h2>
          <p className="text-[#888880] text-lg">
            Every detail designed to make your game night unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════

function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl font-bold">
            Art<span className="text-[#E8FF47]">Or</span>Not
          </span>
          <span className="text-[#888880] text-sm">
            A Fake Artist Goes to New York \u2014 online.
          </span>
        </div>
        <span className="text-[#888880] text-sm">
          Made with \u2615 and Framer Motion
        </span>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════
// GRADIENT DIVIDER
// ═══════════════════════════════════════

function GradientDivider({ fromHue, toHue, glowColor }: { fromHue: string, toHue: string, glowColor: string }) {
  return (
    <div
      className="w-full relative flex items-center justify-center py-16 overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${fromHue}, ${toHue})` }}
    >
      <div className="absolute w-[80%] max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div
        className="absolute w-[40%] max-w-lg h-[2px] bg-gradient-to-r from-transparent to-transparent animate-glow-pulse"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${glowColor}, transparent)` }}
      />
      <div
        className="absolute w-[20%] max-w-xs h-[4px] bg-gradient-to-r from-transparent to-transparent blur-[4px]"
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${glowColor}, transparent)` }}
      />
    </div>
  );
}

// ═══════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════

function LandingNavbar() {
  const { profile, user } = useProfile();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${isScrolled ? "glass-nav py-3" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform">
              <LucideIcons.Pencil size={18} className="text-[#0D0D0D]" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              Art<span className="text-primary">Or</span>Not
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#888880]">
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <Link to="/shop" className="hover:text-white transition-colors flex items-center gap-2">
                <LucideIcons.ShoppingBag size={14} className="text-primary" /> Shop
              </Link>
              <Link to="/wardrobe" className="hover:text-white transition-colors flex items-center gap-2">
                <LucideIcons.User size={14} className="text-primary" /> Wardrobe
              </Link>
            </div>

            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

            <div className="flex items-center gap-4">
              {user && !user.isAnonymous ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <ArtGem size={14} />
                    <span className="font-mono text-sm font-bold">{profile.credits}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-sm font-medium text-[#888880] hover:text-white transition-colors"
                  >
                    <LucideIcons.LogOut size={16} />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-2 bg-white text-[#0D0D0D] px-5 py-2 rounded-full font-bold text-sm hover:bg-primary transition-all active:scale-95 shadow-lg"
                >
                  <LucideIcons.User size={16} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

// ═══════════════════════════════════════
// GLOBAL BRUSH STROKES
// ═══════════════════════════════════════

function GlobalBrushStrokes() {
  const { scrollYProgress } = useScroll();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      // Wait for all fonts to load to prevent layout shifts
      if (document.fonts) await document.fonts.ready;
      
      // Add a small safety buffer for Lenis and scroll physics to initialize
      setTimeout(() => {
        if (mounted) setIsReady(true);
      }, 300);
    };

    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
      // Fallback
      setTimeout(init, 1500);
    }
    
    return () => {
      mounted = false;
      window.removeEventListener('load', init);
    };
  }, []);

  const strokeColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    ["#E8FF47", "#48DBFB", "#A29BFE", "#A29BFE"]
  );

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -600]);
  const y3 = useTransform(scrollYProgress, [0, 1], [200, -300]);

  const r1 = useTransform(scrollYProgress, [0, 1], [-10, 25]);
  const r2 = useTransform(scrollYProgress, [0, 1], [15, -20]);

  return (
    <div
      style={{
        opacity: isReady ? 1 : 0,
        filter: isReady ? "blur(0px)" : "blur(30px)",
        transition: "opacity 0.6s ease-out, filter 0.6s ease-out",
        pointerEvents: "none"
      }}
      className="fixed inset-0 z-[5] overflow-hidden"
    >
      {/* Top Left Stroke */}
      <motion.svg
        style={{ y: y1, rotate: r1, opacity: 0.15 }}
        className="absolute top-[15%] -left-[10%] w-[50vw] h-[30vh] min-w-[600px]"
        viewBox="0 0 600 300"
      >
        <motion.path
          d="M50,150 Q150,50 300,150 T550,150"
          fill="none"
          style={{ stroke: strokeColor }}
          strokeWidth="40"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Middle Right Stroke */}
      <motion.svg
        style={{ y: y2, rotate: r2, opacity: 0.12 }}
        className="absolute top-[50%] -right-[5%] w-[45vw] h-[40vh] min-w-[500px]"
        viewBox="0 0 500 400"
      >
        <motion.path
          d="M50,50 C150,50 150,350 250,350 S350,50 450,50"
          fill="none"
          style={{ stroke: strokeColor }}
          strokeWidth="30"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Bottom Left Stroke */}
      <motion.svg
        style={{ y: y3, rotate: r1, opacity: 0.1 }}
        className="absolute top-[80%] -left-[5%] w-[40vw] h-[40vh] min-w-[400px]"
        viewBox="0 0 400 400"
      >
        <motion.path
          d="M 50,350 C 50,150 150,50 350,50"
          fill="none"
          style={{ stroke: strokeColor }}
          strokeWidth="45"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════

export default function Landing() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white">
      <LandingNavbar />
      <GlobalBrushStrokes />

      <Hero />
      <GradientDivider fromHue="#0A0F0A" toHue="#050C12" glowColor="rgba(72,219,251,0.8)" />

      <HowItWorks />
      <GradientDivider fromHue="#050C12" toHue="#0A0512" glowColor="rgba(162,155,254,0.8)" />

      <Features />
      <GradientDivider fromHue="#0A0512" toHue="#0A0F0A" glowColor="rgba(232,255,71,0.5)" />

      <div className="bg-[#0A0F0A]">
        <Footer />
      </div>
    </main>
  );
}


