import { useRef, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { CHARACTER_MAP } from "@/components/AvatarCharacters";

// ═══════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════

const springTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...springTransition, delay: i * 0.08 },
  }),
};

const stagger = {
  visible: {
    transition: { delayChildren: 0.1, staggerChildren: 0.08 },
  },
};

// ═══════════════════════════════════════
// BACKGROUND CANVAS ANIMATION
// ═══════════════════════════════════════

function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Ghost strokes data — simulated drawing paths
    const strokes = [
      {
        color: "rgba(232,255,71,0.06)",
        width: 4,
        speed: 0.0004,
        points: generateCurve(w * 0.2, h * 0.3, w * 0.6, h * 0.5, 80),
      },
      {
        color: "rgba(255,107,107,0.05)",
        width: 3,
        speed: 0.0003,
        points: generateCurve(w * 0.5, h * 0.2, w * 0.8, h * 0.7, 60),
      },
      {
        color: "rgba(232,255,71,0.04)",
        width: 5,
        speed: 0.0005,
        points: generateCurve(w * 0.1, h * 0.6, w * 0.9, h * 0.4, 100),
      },
      {
        color: "rgba(72, 219, 251, 0.04)",
        width: 3,
        speed: 0.00035,
        points: generateCircle(w * 0.65, h * 0.35, Math.min(w, h) * 0.15, 80),
      },
      {
        color: "rgba(162, 155, 254, 0.04)",
        width: 4,
        speed: 0.00025,
        points: generateCurve(w * 0.3, h * 0.7, w * 0.7, h * 0.2, 70),
      },
    ];


    let startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, w, h);

      strokes.forEach((stroke) => {
        const progress = (elapsed * stroke.speed) % 1;
        const count = Math.floor(progress * stroke.points.length);

        if (count < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < count; i++) {
          const p = stroke.points[i];
          const pp = stroke.points[i - 1];
          const mx = (pp.x + p.x) / 2;
          const my = (pp.y + p.y) / 2;
          ctx.quadraticCurveTo(pp.x, pp.y, mx, my);
        }
        ctx.stroke();

        // Ghost cursor
        if (count > 0 && count < stroke.points.length) {
          const cp = stroke.points[count - 1];
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = stroke.color.replace(/[\d.]+\)$/, "0.3)");
          ctx.fill();
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
    startTime = performance.now();
  }, []);

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", draw);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}

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

function generateCircle(cx: number, cy: number, r: number, points: number) {
  const result = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    result.push({
      x: cx + Math.cos(angle) * r + Math.sin(angle * 3) * r * 0.1,
      y: cy + Math.sin(angle) * r + Math.cos(angle * 2) * r * 0.1,
    });
  }
  return result;
}

// ═══════════════════════════════════════
// SCROLL CONTROLLED STROKES
// ═══════════════════════════════════════

function ScrollControlledStrokes() {
  const { scrollYProgress } = useScroll();
  
  // Create multiple parallax layers for strokes
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const r1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.svg
        style={{ y: y1, rotate: r1, opacity: 0.15 }}
        className="absolute top-[20%] -left-20 w-[600px] h-[300px]"
        viewBox="0 0 600 300"
      >
        <path
          d="M50,150 Q150,50 300,150 T550,150"
          fill="none"
          stroke="#E8FF47"
          strokeWidth="40"
          strokeLinecap="round"
        />
      </motion.svg>

      <motion.svg
        style={{ y: y2, rotate: r2, opacity: 0.1 }}
        className="absolute top-[60%] -right-20 w-[500px] h-[400px]"
        viewBox="0 0 500 400"
      >
        <path
          d="M50,50 C150,50 150,350 250,350 S350,50 450,50"
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="30"
          strokeLinecap="round"
        />
      </motion.svg>
      
      <motion.div 
        style={{ 
          y: useTransform(scrollYProgress, [0, 1], [100, -300]),
          rotate: useTransform(scrollYProgress, [0, 1], [-10, 20]),
          opacity: 0.05
        }}
        className="absolute top-[40%] left-[60%] w-64 h-64 border-[20px] border-[#48DBFB] rounded-full"
      />
    </div>
  );
}

// ═══════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════

function Hero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundCanvas />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(232,255,71,0.06)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          custom={0}
          variants={fadeUp}
          className="font-heading text-[clamp(48px,8vw,100px)] font-bold leading-[1.05] tracking-tight mb-6"
        >
          One of you is{" "}
          <span className="relative inline-block">
            <span className="text-[#E8FF47]">lying</span>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8C30 2 70 2 100 6C130 10 170 10 198 4"
                stroke="#E8FF47"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-draw"
              />
            </svg>
          </span>
          <span className="text-[#E8FF47]">.</span>
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          className="text-[#888880] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A drawing game where one player fakes it. Everyone draws.
          <br className="hidden md:block" />
          Only one doesn't know what.
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => navigate("/me?next=/create")}
            className="btn-primary text-lg px-10 py-4 min-w-[200px]"
            id="cta-create-room"
          >
            Create a room
          </button>
          <button
            onClick={() => navigate("/me?next=/join")}
            className="btn-ghost text-lg px-10 py-4 min-w-[200px]"
            id="cta-join-room"
          >
            Join a room
          </button>
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
    desc: "Who's the imposter? Vote them out. But if the Fake Artist guesses the word — they win!",
    icon: "🗳️",
  },
];

function StepCard({ step, i, scrollProgress }: { step: typeof STEPS[0], i: number, scrollProgress: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0% -10% 0%" });
  
  // Component morphing: border-radius and scale changes as you scroll
  const borderRadius = useTransform(scrollProgress, [0.1 * i, 0.2 * i + 0.2], ["16px", "40px"]);
  const rotate = useTransform(scrollProgress, [0.1 * i, 0.2 * i + 0.2], [0, i % 2 === 0 ? 2 : -2]);

  return (
    <motion.div
      ref={ref}
      style={{ borderRadius, rotate }}
      variants={fadeUp}
      custom={i + 2}
      className="card group relative overflow-hidden hover:border-[rgba(255,255,255,0.15)] transition-all duration-300"
    >
      {/* Accent number badge */}
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#E8FF47] text-[#0D0D0D] font-mono font-bold text-sm mb-6">
        {step.num}
      </div>

      {/* Icon */}
      <div className="text-5xl mb-4">{step.icon}</div>

      <h3 className="font-heading text-xl font-bold mb-2">{step.title}</h3>
      <p className="text-[#888880] text-sm leading-relaxed">{step.desc}</p>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(232,255,71,0.05)_0%,transparent_60%)]" />
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
      className="relative py-32 px-6 max-w-6xl mx-auto"
      id="how-it-works"
    >
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    }
  };

  // Morph feature cards: scale and border radius pulse with scroll
  const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.95, 1, 0.95]);
  const borderRadius = useTransform(scrollYProgress, [0.3, 0.5, 0.7], ["16px", "32px", "16px"]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, borderRadius }}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card h-full flex flex-col items-center text-center p-8 group transition-transform duration-200"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Feature preview area */}
        <div className="w-full h-48 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] mb-6 flex items-center justify-center overflow-hidden relative">
          {feature.preview === "avatar" && <AvatarPreview />}
          {feature.preview === "canvas" && <CanvasPreview />}
          {feature.preview === "chat" && <ChatPreview />}
        </div>

        <div className="mb-4">{feature.icon}</div>
        <h3 className="font-heading text-2xl font-bold mb-3">{feature.title}</h3>
        <p className="text-[#888880] leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

function AvatarPreview() {
  const characters = ["bunny", "panda", "fox", "frog", "devil"];
  const bgColors = ["#FF6B6B", "#FECA57", "#48DBFB", "#A29BFE", "#55EFC4"];
  const bodyColors = ["#FFFFFF", "#0D0D0D", "#FFD93D", "#6BCB77", "#A29BFE"];

  return (
    <div className="flex gap-3">
      {characters.map((charId, i) => {
        const Character = CHARACTER_MAP[charId] || CHARACTER_MAP.bunny;
        return (
          <motion.div
            key={i}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColors[i] }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Character size={32} color={bodyColors[i]} />
          </motion.div>
        );
      })}
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
  const messages = [
    { name: "SpicyPelican", text: "Definitely a cat \uD83D\uDC31", color: "#FF6B6B" },
    { name: "NoodleWitch", text: "hmm idk about that...", color: "#48DBFB" },
    { name: "CosmicOtter", text: "Player 3 is sus \uD83D\uDC40", color: "#FECA57" },
    { name: "PixelNinja", text: "wait what are we drawing?", color: "#A29BFE" },
    { name: "TurboMango", text: "LMAO nice try", color: "#55EFC4" },
  ];

  return (
    <div className="w-full h-full p-3 flex flex-col gap-2 overflow-hidden">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          className="flex items-start gap-2 text-xs"
          animate={{ y: [20, 0], opacity: [0, 1] }}
          transition={{
            duration: 0.5,
            delay: i * 0.8,
            repeat: Infinity,
            repeatDelay: messages.length * 0.8,
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: msg.color }}
          />
          <div>
            <span className="font-mono text-[10px]" style={{ color: msg.color }}>
              {msg.name}
            </span>
            <p className="text-[#888880]">{msg.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section className="py-32 px-6 max-w-6xl mx-auto" id="features">
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
// PARALLAX DIVIDER
// ═══════════════════════════════════════

function ParallaxDivider() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className="overflow-hidden py-12 border-y border-[rgba(255,255,255,0.03)]">
      <motion.div style={{ x }} className="whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="inline-block font-heading text-6xl md:text-8xl font-bold text-[rgba(255,255,255,0.03)] mx-8 select-none"
          >
            ArtOrNot
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] relative">
      <ScrollControlledStrokes />
      <Hero />
      <ParallaxDivider />
      <HowItWorks />
      <Features />
      <ParallaxDivider />
      <Footer />
    </main>
  );
}


