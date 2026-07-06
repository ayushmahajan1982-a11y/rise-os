"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import ScrambleText from "@/components/ScrambleText";
import { supabase } from "@/lib/supabase/client";

type SpotlightCardProps = {
  title: string;
  value: string;
  label: string;
  href: string;
  focusAreas: readonly [string | null, string | null];
  focusDone: readonly [boolean, boolean];
  tableName: string;
  rowId: string;
  profileId: string;
};

type SpotlightProperties = CSSProperties & {
  "--mouse-x": string;
  "--mouse-y": string;
};

export default function SpotlightCard({
  title,
  value,
  label,
  href,
  focusAreas,
  focusDone,
  tableName,
  rowId,
  profileId,
}: SpotlightCardProps) {
  const [completionState, setCompletionState] = useState<[boolean, boolean]>([
    focusDone[0],
    focusDone[1],
  ]);
  const hasFocusAreas = focusAreas.some(Boolean);

  const trackSpotlight = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const hideSpotlight = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--mouse-x", "-999px");
    event.currentTarget.style.setProperty("--mouse-y", "-999px");
  };

  const toggleFocusItem = async (index: 0 | 1) => {
    const previousState = completionState;
    const nextState: [boolean, boolean] = [...completionState];
    nextState[index] = !nextState[index];
    setCompletionState(nextState);

    const pillarKey = title.toLowerCase();
    const column = `${pillarKey}_focus_${index + 1}_done`;
    const { error } = await supabase
      .from(tableName)
      .update({ [column]: nextState[index] })
      .eq("id", rowId)
      .eq("profile_id", profileId);

    if (error) setCompletionState(previousState);
  };

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      glareEnable={false}
      transitionSpeed={600}
      perspective={1000}
      className="h-64"
    >
      <article
        onMouseMove={trackSpotlight}
        onMouseLeave={hideSpotlight}
        className="spotlight-card h-full rounded-2xl border border-[#111111] bg-black"
        style={
          {
            "--mouse-x": "-999px",
            "--mouse-y": "-999px",
            transformStyle: "preserve-3d",
          } as SpotlightProperties
        }
      >
        <div className="spotlight-card__content flex flex-col bg-black p-5 text-white hover:bg-[#050505]">
          <Link href={href} data-magnetic className="flex flex-1 flex-col">
            <motion.div
              className="flex items-baseline gap-2"
              style={{ transform: "translateZ(40px)" }}
            >
              <ScrambleText
                className="font-dot text-5xl leading-none text-white md:text-6xl"
              >
                {value}
              </ScrambleText>
              <span className="text-[10px] tracking-[0.16em] text-white/45">
                {label}
              </span>
            </motion.div>

            <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 border border-white/50"
                />
                <h2 className="text-sm tracking-[0.2em] text-white/80">
                  {title}
                </h2>
              </div>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#FF0000]"
              />
            </div>
          </Link>

          {hasFocusAreas && (
            <div className="mt-4 space-y-2 border-t border-white/15 pt-3">
              {focusAreas.map((area, index) => {
                if (!area) return null;
                const isDone = completionState[index];

                return (
                  <button
                    key={`${area}-${index}`}
                    type="button"
                    data-magnetic="true"
                    aria-pressed={isDone}
                    onClick={() => void toggleFocusItem(index as 0 | 1)}
                    className={`flex w-full items-center gap-2 text-left text-[10px] uppercase tracking-widest ${
                      isDone
                        ? "text-[#333333] line-through decoration-white"
                        : "text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1 w-1 shrink-0 rounded-full ${
                        isDone
                          ? "bg-[#333333]"
                          : "bg-[#FF0000] shadow-[0_0_6px_#FF0000]"
                      }`}
                    />
                    {area}
                  </button>
                );
              })}
            </div>
          )}

          {!hasFocusAreas && (
            <p className="mt-auto border-t border-white/15 pt-3 font-dot text-[9px] tracking-[0.16em] text-white/30">
              DAILY INDEX / NO PROTOCOL ASSIGNED
            </p>
          )}
        </div>
      </article>
    </Tilt>
  );
}
