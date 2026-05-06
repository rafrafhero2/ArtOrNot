import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { Pencil } from "lucide-react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringPrimary, setIsHoveringPrimary] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 35, stiffness: 750, mass: 0.1 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.style.cursor === "pointer" ||
        target.classList.contains("interactive");
      
      const isPrimary = 
        target.classList.contains("bg-primary") || 
        target.closest(".bg-primary") ||
        target.classList.contains("btn-primary") ||
        target.closest(".btn-primary");
      
      setIsHovering(!!isInteractive);
      setIsHoveringPrimary(!!isPrimary);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Subtle Glow Trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 2.5 : 1,
            opacity: isClicking ? 0.8 : 0.4,
            backgroundColor: isHoveringPrimary ? "rgba(255, 255, 255, 0.2)" : "rgba(232, 255, 71, 0.2)",
          }}
          className="w-12 h-12 rounded-full blur-xl transition-colors duration-300"
        />
      </motion.div>

      {/* Main Cursor (Pencil) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "0%",
          translateY: "-100%",
          transformOrigin: "bottom left",
        }}
      >
        <motion.div
          animate={{
            rotate: isClicking ? -15 : isHovering ? -20 : -35,
            scale: isClicking ? 0.85 : isHovering ? 1.1 : 1,
            color: isHoveringPrimary ? "#FFFFFF" : "#E8FF47",
          }}
          transition={{ type: "spring", damping: 15, stiffness: 400 }}
          className="relative drop-shadow-[0_0_8px_rgba(232,255,71,0.4)] transition-colors duration-300"
        >
          <Pencil 
            size={24} 
            strokeWidth={3}
            fill={isHovering ? "currentColor" : "rgba(232,255,71,0.1)"}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
