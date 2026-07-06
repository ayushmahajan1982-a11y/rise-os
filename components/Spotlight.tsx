"use client";

import { useEffect, useRef } from "react";

export default function Spotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trackPointer = (event: MouseEvent) => {
      spotlightRef.current?.style.setProperty("--x", `${event.clientX}px`);
      spotlightRef.current?.style.setProperty("--y", `${event.clientY}px`);
    };

    window.addEventListener("mousemove", trackPointer, { passive: true });
    return () => window.removeEventListener("mousemove", trackPointer);
  }, []);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.06), transparent 40%)",
      }}
    />
  );
}
