import { useEffect, useRef } from "react";

// Animated background canvas: ghost cursors drawing fake brushstrokes that
// build a simple shape (a sun) in a loop. Pure canvas, no deps.
export default function GhostCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0, h = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    type Stroke = { color: string; width: number; pts: [number, number][] };

    function buildShape(): Stroke[] {
      const cx = w * 0.5, cy = h * 0.5;
      const r = Math.min(w, h) * 0.18;
      const out: Stroke[] = [];
      // sun circle in segments
      const seg = 6;
      for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2;
        const a1 = ((i + 1) / seg) * Math.PI * 2;
        const pts: [number, number][] = [];
        const steps = 16;
        for (let s = 0; s <= steps; s++) {
          const a = a0 + ((a1 - a0) * s) / steps;
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        out.push({ color: i % 2 === 0 ? "#E8FF47" : "#FF6B6B", width: 3, pts });
      }
      // rays
      const rays = 10;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2;
        const x0 = cx + Math.cos(a) * (r * 1.25);
        const y0 = cy + Math.sin(a) * (r * 1.25);
        const x1 = cx + Math.cos(a) * (r * 1.7);
        const y1 = cy + Math.sin(a) * (r * 1.7);
        const pts: [number, number][] = [];
        const steps = 8;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
        }
        out.push({ color: i % 3 === 0 ? "#7CC4FF" : "#F5F5F0", width: 2.5, pts });
      }
      return out;
    }

    let strokes = buildShape();
    let drawn: { stroke: Stroke; progress: number }[] = [];
    let active: { stroke: Stroke; progress: number } | null = null;
    let queueIdx = 0;
    let pauseUntil = 0;

    function reset() {
      strokes = buildShape();
      drawn = [];
      active = null;
      queueIdx = 0;
      pauseUntil = performance.now() + 800;
    }

    function step(now: number) {
      ctx.clearRect(0, 0, w, h);
      // draw completed
      for (const d of drawn) drawStroke(d.stroke, 1);
      // active
      if (active) {
        active.progress += 0.012;
        if (active.progress >= 1) {
          drawn.push({ stroke: active.stroke, progress: 1 });
          active = null;
          pauseUntil = now + 120;
        } else {
          drawStroke(active.stroke, active.progress);
          drawCursor(active.stroke, active.progress);
        }
      } else if (now > pauseUntil) {
        if (queueIdx >= strokes.length) {
          pauseUntil = now + 1200;
          setTimeout(reset, 1200);
          queueIdx++;
        } else if (queueIdx < strokes.length) {
          active = { stroke: strokes[queueIdx++], progress: 0 };
        }
      }
      raf = requestAnimationFrame(step);
    }

    function drawStroke(s: Stroke, p: number) {
      const pts = s.pts;
      const last = Math.max(1, Math.floor(pts.length * p));
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = s.color + "55";
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < last; i++) {
        const [x, y] = pts[i];
        const [px, py] = pts[i - 1];
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      }
      ctx.stroke();
    }
    function drawCursor(s: Stroke, p: number) {
      const idx = Math.min(s.pts.length - 1, Math.floor(s.pts.length * p));
      const [x, y] = s.pts[idx];
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
