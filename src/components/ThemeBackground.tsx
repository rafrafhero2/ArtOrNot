import { useEffect, useRef } from "react";

export function ParticleCanvas({ colors }: { colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: {x: number, y: number, r: number, dx: number, dy: number, color: string}[] = [];
    const colorList = colors || ["rgba(232, 255, 71, 0.2)", "rgba(85, 239, 196, 0.2)", "rgba(72, 219, 251, 0.15)"];

    const resize = () => {
      // Use offset dimensions to support absolute positioning within sections
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(canvas.width / 12, 80);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 3 + 1,
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4,
          color: colorList[Math.floor(Math.random() * colorList.length)]
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let animFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame);
    };
  }, [JSON.stringify(colors)]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      style={{ filter: "blur(0.5px)" }}
    />
  );
}

export function ThemeBackground({
  colors = ["rgba(232, 255, 71, 0.3)", "rgba(255, 255, 255, 0.1)"],
  glowColor = "rgba(232, 255, 71, 0.2)",
  bgHue = "#0A0F0A"
}: {
  colors?: string[];
  glowColor?: string;
  bgHue?: string;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ backgroundColor: bgHue }}>
      <ParticleCanvas colors={colors} />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[80vw] max-h-[800px] rounded-full opacity-[0.15] mix-blend-screen animate-glow-pulse" 
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} 
      />
    </div>
  );
}
