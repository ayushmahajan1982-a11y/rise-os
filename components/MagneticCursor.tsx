"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CURSOR_SIZE = 12;
const INTERACTIVE_SELECTOR =
  "[data-magnetic], a, button, input, textarea, select, [role='button']";

export default function MagneticCursor() {
  const pointerX = useMotionValue(-CURSOR_SIZE);
  const pointerY = useMotionValue(-CURSOR_SIZE);
  const [isTargeting, setIsTargeting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = isTargeting
    ? { stiffness: 105, damping: 28, mass: 0.65 }
    : { stiffness: 150, damping: 15, mass: 0.1 };

  const x = useSpring(pointerX, springConfig);
  const y = useSpring(pointerY, springConfig);

  useEffect(() => {
    const moveCursor = (event: MouseEvent) => {
      const interactiveTarget = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest(INTERACTIVE_SELECTOR);

      pointerX.set(event.clientX - CURSOR_SIZE / 2);
      pointerY.set(event.clientY - CURSOR_SIZE / 2);
      setIsTargeting(Boolean(interactiveTarget));
      setIsVisible(true);
    };

    const hideCursor = () => setIsVisible(false);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
    };
  }, [pointerX, pointerY]);

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        scale: isTargeting ? 0.35 : 1,
        opacity: isVisible ? 1 : 0,
        borderRadius: isTargeting ? "50%" : "0%",
        backgroundColor: isTargeting ? "#FFFFFF" : "rgba(255,255,255,0)",
      }}
      transition={{
        scale: { duration: 0.12, ease: "easeOut" },
        opacity: { duration: 0.1 },
        borderRadius: { duration: 0.12 },
        backgroundColor: { duration: 0.12 },
      }}
      className="magnetic-cursor pointer-events-none fixed left-0 top-0 z-[10000] h-3 w-3 border border-white"
      style={{ x, y, mixBlendMode: "difference" }}
    />
  );
}
