"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LiquidGraph from "@/components/LiquidGraph";
import PillarCards from "@/components/PillarCards";
import ScrambleText from "@/components/ScrambleText";
import DataTerminal from "@/components/DataTerminal";
import WireframeNode from "@/components/WireframeNode";
import { useDailyScores } from "@/hooks/useDailyScores";
import { useActiveOperator } from "@/hooks/useOperatorProfile";

const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const hashOperatorName = (name: string) => {
  const hash = [...name].reduce(
    (current, character) => (current * 31 + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
  return hash.toString(16).toUpperCase().padStart(8, "0").slice(-8);
};

export default function Home() {
  const activeOperator = useActiveOperator();
  const [operatorName, setOperatorName] = useState("UNKNOWN");
  const [uptime, setUptime] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const { data, error, isLoading, refresh } =
    useDailyScores(true, activeOperator);

  useEffect(() => {
    const syncOperatorName = () => {
      setOperatorName(localStorage.getItem("active_operator_name") || "UNKNOWN");
    };

    syncOperatorName();
    window.addEventListener("operator-session-updated", syncOperatorName);
    return () =>
      window.removeEventListener("operator-session-updated", syncOperatorName);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const operatorHash = useMemo(
    () => hashOperatorName(operatorName),
    [operatorName],
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="flex items-center gap-4 font-dot text-sm tracking-[0.2em] sm:text-base">
          <span className="h-2 w-2 rounded-full bg-[#FF0000]" />
          <ScrambleText>INITIALIZING SYSTEM...</ScrambleText>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div className="font-dot text-sm tracking-[0.2em]">
          <p className="text-[#FF0000]">SYSTEM LINK FAILED</p>
          <p className="mt-3 text-xs text-white/50">
            {error ?? "NO DAILY SCORES FOUND"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8 sm:py-10">
        <header className="mx-auto w-full max-w-6xl pb-5 pt-8">
          <div className="grid gap-8 md:grid-cols-[0.9fr_3.2fr_1.1fr] md:items-end">
            <div className="font-dot text-[10px] leading-relaxed tracking-[0.16em] text-white/45 md:pb-4">
              <p>SYS_STATUS: <span className="text-[#FF0000]">ACTIVE</span></p>
              <p>UPTIME: {formatUptime(uptime)}</p>
            </div>

            <h1 className="font-dot text-[clamp(3.5rem,10vw,8.5rem)] leading-[0.78] tracking-[-0.07em] text-white">
              <ScrambleText>{`HI, ${operatorName.toUpperCase()}.`}</ScrambleText>
            </h1>

            <div className="flex flex-col items-start gap-4 font-dot text-[10px] leading-relaxed tracking-[0.14em] text-white/45 md:items-end md:text-right">
              <WireframeNode />
              <div>
                <p>OPERATOR_ID: {operatorHash}</p>
                <p>CLEARANCE: LVL_01</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="relative h-px flex-1 bg-white">
              <span className="absolute -right-1 -top-[3px] h-2 w-2 rounded-full bg-[#FF0000]" />
            </div>
            <button
              type="button"
              data-magnetic
              onClick={() => setIsTerminalOpen(true)}
              className="rounded-full border border-white bg-transparent px-4 py-2 font-dot text-[10px] tracking-[0.18em] text-white hover:bg-white hover:text-black"
            >
              LOG DATA
            </button>
          </div>
        </header>

        <section className="mx-auto w-full max-w-6xl py-6 sm:py-8">
          <div className="border-b border-white/20 pb-6">
            <LiquidGraph scores={data} />
          </div>
          <div className="mt-6 sm:mt-8">
            <PillarCards data={data} />
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isTerminalOpen && (
          <DataTerminal
            currentData={data}
            onClose={() => setIsTerminalOpen(false)}
            onSync={refresh}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
