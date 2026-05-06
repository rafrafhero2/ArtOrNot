import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import GhostCanvas from "@/components/GhostCanvas";
import AvatarView from "@/components/AvatarView";
import { Palette, Wifi, MessageCircle, ArrowDown } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease, staggerChildren: 0.08, delayChildren: 0.1 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateZ(0)`;
      }}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
      className="card-surface p-6 transition-transform duration-300 ease-snappy will-change-transform"
    >
      {children}
    </div>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="container flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-display text-lg font-bold">A</div>
          <span className="font-display font-bold tracking-tight text-lg">ArtOrNot</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/me?next=/join" className="btn-ghost text-sm hidden sm:inline-flex">Join</Link>
          <Link to="/me?next=/create" className="btn-primary text-sm">Play</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative">
        <div className="absolute inset-0 -z-10">
          <GhostCanvas className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="container pt-12 md:pt-20 pb-24 md:pb-36">
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="max-w-5xl"
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 pill border border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              A new party game for the internet
            </motion.span>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease }}
              className="mt-6 font-display font-bold text-[14vw] sm:text-[10vw] md:text-[7.5rem] leading-[0.95] tracking-tight text-balance"
            >
              One of you is{" "}
              <span className="relative inline-block">
                <span className="text-primary">lying</span>
                <svg viewBox="0 0 220 16" className="absolute left-0 -bottom-2 w-full h-3" preserveAspectRatio="none">
                  <path
                    d="M3 11 C 50 2, 120 2, 217 9"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="300"
                    className="animate-draw-stroke"
                  />
                </svg>
              </span>
              .
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, ease }}
              className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl"
            >
              A drawing game where one player fakes it. Everyone draws. Only one doesn't know what.
            </motion.p>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, ease }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link to="/me?next=/create" className="btn-primary text-base px-7 py-3.5">Create a room →</Link>
              <Link to="/me?next=/join" className="btn-ghost text-base px-7 py-3.5">Join a room</Link>
            </motion.div>
          </motion.div>
        </div>
        <a href="#how" className="absolute left-1/2 -translate-x-1/2 bottom-6 text-xs uppercase tracking-[0.2em] text-muted-foreground inline-flex flex-col items-center gap-2 hover:text-foreground transition-colors">
          Scroll to explore
          <span className="animate-bounce-soft"><ArrowDown size={16} /></span>
        </a>
      </header>

      {/* HOW IT WORKS */}
      <Section className="container py-24 md:py-36" >
        <div id="how" className="mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How it works</span>
          <h2 className="font-display font-bold text-4xl md:text-6xl mt-4 max-w-3xl text-balance">
            Four steps. Endless accusations.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { t: "Create a room", d: "Get a 4-letter code. Share it with friends." },
            { t: "Same word — except one", d: "Everyone sees the secret word. The Fake Artist doesn't." },
            { t: "Draw, one stroke at a time", d: "Take turns. Round by round. No conferring." },
            { t: "Vote the faker out", d: "Or get fooled. If caught, they get one chance to guess." },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease, delay: i * 0.06 }}
              className="card-surface p-6 relative h-full"
            >
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-display font-bold grid place-items-center text-sm">{i + 1}</div>
              <h3 className="mt-6 font-display font-bold text-2xl tracking-tight">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{s.d}</p>
              <div className="mt-6 h-32 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.04] grid place-items-center">
                <StepArt index={i} />
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FEATURES */}
      <Section className="container py-24 md:py-36">
        <div id="features" className="mb-12 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Features</span>
          <h2 className="font-display font-bold text-4xl md:text-6xl mt-4 text-balance">
            Built for the chaos of group chats.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <TiltCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Palette size={14}/> Custom characters</div>
            <h3 className="mt-3 font-display text-2xl">Make your guy.</h3>
            <p className="mt-2 text-muted-foreground text-sm">Mix faces, hats, and colors into avatars that show up everywhere — lobby, game, votes.</p>
            <div className="mt-6 flex justify-center">
              <AvatarPreview />
            </div>
          </TiltCard>
          <TiltCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><Wifi size={14}/> Real-time drawing</div>
            <h3 className="mt-3 font-display text-2xl">Synced strokes.</h3>
            <p className="mt-2 text-muted-foreground text-sm">Smooth Bezier strokes appear across every screen the moment you draw them.</p>
            <div className="mt-6 h-32 rounded-xl bg-canvas overflow-hidden">
              <MiniCanvas />
            </div>
          </TiltCard>
          <TiltCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"><MessageCircle size={14}/> Live chat</div>
            <h3 className="mt-3 font-display text-2xl">Accuse loudly.</h3>
            <p className="mt-2 text-muted-foreground text-sm">Talk trash before, during, and after. Optional silence during drawing for purists.</p>
            <FakeChat />
          </TiltCard>
        </div>
      </Section>

      {/* CTA */}
      <Section className="container py-24">
        <div className="card-surface p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -inset-32 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />
          <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight text-balance">
            Grab a room. Draw a thing. Lie about it.
          </h2>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link to="/me?next=/create" className="btn-primary px-7 py-3.5">Create a room</Link>
            <Link to="/me?next=/join" className="btn-ghost px-7 py-3.5">Join a room</Link>
          </div>
        </div>
      </Section>

      <footer className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary grid place-items-center text-primary-foreground font-display font-bold text-xs">A</div>
          <span>ArtOrNot — a drawing party game.</span>
        </div>
        <div>Made with ☕ and Framer Motion</div>
      </footer>
    </div>
  );
}

function StepArt({ index }: { index: number }) {
  if (index === 0) return <div className="font-mono text-3xl text-primary">X7K2</div>;
  if (index === 1) return <div className="flex gap-2 text-2xl">🐧 🐧 <span className="opacity-40">❓</span> 🐧</div>;
  if (index === 2) return (
    <svg viewBox="0 0 100 60" className="w-32">
      <path d="M10 50 Q 30 10, 50 30 T 90 20" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
  return <div className="flex gap-1 text-2xl">👉 🎭</div>;
}

function AvatarPreview() {
  const a1 = { bgColor: "#E8FF47", faceEmoji: "🦊", hat: "crown" };
  const a2 = { bgColor: "#FF6B6B", faceEmoji: "🐙", hat: "party" };
  const a3 = { bgColor: "#7CC4FF", faceEmoji: "👾", hat: "headphones" };
  return (
    <div className="flex -space-x-3">
      <AvatarView avatar={a1} size={64} />
      <AvatarView avatar={a2} size={64} />
      <AvatarView avatar={a3} size={64} />
    </div>
  );
}

function MiniCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr; c.height = r.height * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    let t = 0; let raf = 0;
    const draw = () => {
      ctx.clearRect(0,0,r.width,r.height);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      const path = (color: string, off: number, w: number) => {
        ctx.strokeStyle = color; ctx.lineWidth = w;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const x = (i / 60) * r.width;
          const y = r.height/2 + Math.sin((i/8) + t/20 + off) * 14;
          if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      };
      path("#0D0D0D", 0, 3);
      path("#FF6B6B", 1.2, 2.5);
      path("#7CC4FF", 2.4, 2);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="w-full h-full" />;
}

function FakeChat() {
  const msgs = [
    { who: "🦊", n: "FunkyFox", t: "ok that's def a leg" },
    { who: "🐙", n: "SaltyOcto", t: "or an antenna???" },
    { who: "👾", n: "GlitterGoblin", t: "im sweating" },
  ];
  return (
    <div className="mt-6 space-y-2">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1, ease, duration: 0.5 }}
          className="flex items-center gap-2 text-sm"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-base">{m.who}</div>
          <span className="text-muted-foreground text-xs">{m.n}</span>
          <span className="text-foreground/90 truncate">{m.t}</span>
        </motion.div>
      ))}
    </div>
  );
}
