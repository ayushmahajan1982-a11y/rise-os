"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";

const links = [
  { label: "HOME", href: "/" },
  { label: "HEALTH", href: "/health" },
  { label: "STUDIES", href: "/studies" },
  { label: "FUTURE", href: "/future" },
  { label: "RELATIONSHIP", href: "/relationship" },
  { label: "MONEY", href: "/money" },
];

export default function CommandNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const didDrag = useRef(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={constraintsRef}
        className="pointer-events-none fixed inset-0 z-[90]"
      >
        <motion.div
          drag
          dragMomentum={true}
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          whileDrag={{ scale: 1.08 }}
          onDragStart={() => {
            didDrag.current = true;
          }}
          onDragEnd={() => {
            requestAnimationFrame(() => {
              didDrag.current = false;
            });
          }}
          data-magnetic="false"
          className="pointer-events-auto fixed right-5 top-5 z-50 h-12 w-12 touch-none sm:right-8 sm:top-8"
        >
          <button
            type="button"
            aria-label="Open system menu"
            aria-expanded={isOpen}
            aria-controls="command-navigation"
            onClick={() => {
              if (!didDrag.current) setIsOpen(true);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-black/50 text-white backdrop-blur-xl transition-[border-color,box-shadow] duration-150 hover:border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
              <path d="M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close system menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/80"
            />

            <motion.aside
              id="command-navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 175,
                damping: 32,
                mass: 1.15,
                bounce: 0,
              }}
              className="fixed inset-y-0 right-0 z-[9999] flex w-full flex-col border-l border-[#FF0000] bg-black p-6 text-white sm:w-96 sm:p-8"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.025) 4px)",
              }}
            >
              <header className="flex items-center justify-between border-b border-white/20 pb-6">
                <p className="font-dot text-[10px] tracking-[0.2em] text-white/50">
                  COMMAND / NAV
                </p>
                <button
                  type="button"
                  data-magnetic="true"
                  onClick={() => setIsOpen(false)}
                  className="border border-white px-3 py-2 font-dot text-[10px] tracking-[0.16em] hover:bg-white hover:text-black"
                >
                  [ CLOSE ]
                </button>
              </header>

              <nav
                aria-label="System navigation"
                className="flex flex-1 flex-col justify-center gap-2"
              >
                {links.map((link, index) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      data-magnetic="true"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-baseline justify-between border-b py-4 font-dot text-2xl tracking-[0.08em] transition-colors duration-150 ${
                        isActive
                          ? "border-[#FF0000] text-[#FF0000]"
                          : "border-white/20 text-white hover:border-white"
                      }`}
                    >
                      <ScrambleText>{link.label}</ScrambleText>
                      <span className="text-[9px] tracking-[0.16em] text-white/30 group-hover:text-white">
                        {String(index).padStart(2, "0")}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <button
                type="button"
                data-magnetic="true"
                onClick={() => {
                  localStorage.removeItem("active_operator");
                  localStorage.removeItem("active_operator_name");
                  window.location.reload();
                }}
                className="mb-5 border border-[#FF0000] px-4 py-4 text-left font-dot text-[10px] tracking-[0.14em] text-[#FF0000] hover:bg-[#FF0000] hover:text-black"
              >
                [ TERMINATE SESSION / SWITCH OPERATOR ]
              </button>

              <footer className="border-t border-white/20 pt-5 font-dot text-[9px] tracking-[0.18em] text-white/35">
                RISE OS / ROUTING ONLINE
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
