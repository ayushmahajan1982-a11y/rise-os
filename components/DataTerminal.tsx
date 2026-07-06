"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import type { DailyScore, PillarScores } from "@/lib/dailyScores";

type DataTerminalProps = {
  currentData: DailyScore;
  onClose: () => void;
  onSync: () => void;
};

type ScoreKey = keyof PillarScores;

const fields: Array<{ key: ScoreKey; label: string }> = [
  { key: "health", label: "HEALTH" },
  { key: "studies", label: "STUDIES" },
  { key: "future", label: "FUTURE" },
  { key: "relationship", label: "RELATIONSHIP" },
  { key: "money", label: "MONEY" },
];

const clampScore = (value: number) => Math.min(100, Math.max(0, value));

export default function DataTerminal({
  currentData,
  onClose,
  onSync,
}: DataTerminalProps) {
  const [scores, setScores] = useState<PillarScores>({
    health: currentData.health,
    studies: currentData.studies,
    future: currentData.future,
    relationship: currentData.relationship,
    money: currentData.money,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateScore = (key: ScoreKey, value: string) => {
    const parsedValue = Number(value);

    setScores((current) => ({
      ...current,
      [key]: Number.isFinite(parsedValue) ? clampScore(parsedValue) : 0,
    }));
  };

  const syncData = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSyncing(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("daily_scores")
      .update(scores)
      .eq("id", currentData.id)
      .eq("profile_id", currentData.profileId);

    if (updateError) {
      setError(updateError.message);
      setIsSyncing(false);
      return;
    }

    onSync();
    onClose();
  };

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ type: "spring", stiffness: 150, damping: 22, mass: 0.8 }}
      className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black/80 px-5 py-10 text-white backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-terminal-title"
    >
      <form
        onSubmit={syncData}
        className="w-full max-w-4xl border border-white bg-black p-6 sm:p-10"
      >
        <header className="flex items-start justify-between border-b border-white/20 pb-6">
          <div>
            <p className="font-dot text-[10px] tracking-[0.24em] text-white/40">
              DATA TERMINAL / 01
            </p>
            <h2
              id="data-terminal-title"
              className="mt-2 font-dot text-2xl tracking-[0.18em] sm:text-3xl"
            >
              UPDATE PROTOCOL
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-magnetic
            aria-label="Close data terminal"
            className="border border-white px-3 py-2 font-dot text-xs hover:bg-white hover:text-black"
          >
            ESC
          </button>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="text-[10px] tracking-[0.2em] text-white/50">
                {field.label}
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={scores[field.key]}
                onChange={(event) => updateScore(field.key, event.target.value)}
                className="mt-3 w-full border-0 border-b border-white bg-black px-0 py-3 font-dot text-3xl text-white outline-none ring-0 [appearance:textfield] focus:border-[#FF0000] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-5 font-dot text-xs text-[#FF0000]">
            SYNC ERROR / {error.toUpperCase()}
          </p>
        )}

        <button
          type="submit"
          disabled={isSyncing}
          data-magnetic
          className="w-full border border-white bg-white px-5 py-4 font-dot text-sm tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:cursor-wait disabled:bg-black disabled:text-white/50"
        >
          {isSyncing ? "SYNCING..." : "SYNC DATA"}
        </button>
      </form>
    </motion.div>
  );
}
