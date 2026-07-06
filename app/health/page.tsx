"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";
import TrendChart from "@/components/TrendChart";
import { supabase } from "@/lib/supabase/client";
import {
  useActiveOperator,
  useOperatorAge,
} from "@/hooks/useOperatorProfile";
import { getQuestions } from "@/utils/questionEngine";

type View = "assessment" | "focus" | "dashboard";
type QuestionType = "number" | "boolean";

type Question = {
  id: string;
  prompt: string;
  type: QuestionType;
  min?: number;
  max?: number;
  unit?: string;
  normalize: (value: number) => number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const questionTemplates: Question[] = [
  {
    id: "sleep",
    prompt: "HOW MANY HOURS DID YOU SLEEP?",
    type: "number",
    min: 0,
    max: 12,
    unit: "HRS",
    normalize: (value) => clamp(10 - Math.abs(value - 8) * 1.5, 0, 10),
  },
  {
    id: "hydration",
    prompt: "RATE YOUR HYDRATION.",
    type: "number",
    min: 1,
    max: 10,
    unit: "/ 10",
    normalize: (value) => value,
  },
  {
    id: "heart-rate",
    prompt: "DID YOU ELEVATE YOUR HEART RATE TODAY?",
    type: "boolean",
    normalize: (value) => value,
  },
  {
    id: "steps",
    prompt: "HOW MANY STEPS DID YOU TAKE?",
    type: "number",
    min: 0,
    max: 20000,
    unit: "STEPS",
    normalize: (value) => clamp(value / 1000, 0, 10),
  },
  {
    id: "nutrition",
    prompt: "HOW MANY WHOLE-FOOD MEALS DID YOU EAT?",
    type: "number",
    min: 0,
    max: 6,
    unit: "MEALS",
    normalize: (value) => clamp((value / 3) * 10, 0, 10),
  },
  {
    id: "stress",
    prompt: "RATE YOUR CURRENT STRESS LEVEL.",
    type: "number",
    min: 1,
    max: 10,
    unit: "/ 10",
    normalize: (value) => 11 - value,
  },
  {
    id: "mobility",
    prompt: "DID YOU COMPLETE ANY MOBILITY WORK?",
    type: "boolean",
    normalize: (value) => value,
  },
  {
    id: "sunlight",
    prompt: "HOW MANY MINUTES OF SUNLIGHT DID YOU GET?",
    type: "number",
    min: 0,
    max: 120,
    unit: "MIN",
    normalize: (value) => clamp(value / 3, 0, 10),
  },
  {
    id: "energy",
    prompt: "RATE YOUR ENERGY LEVEL.",
    type: "number",
    min: 1,
    max: 10,
    unit: "/ 10",
    normalize: (value) => value,
  },
  {
    id: "bedtime",
    prompt: "DID YOU KEEP A CONSISTENT BEDTIME?",
    type: "boolean",
    normalize: (value) => value,
  },
];

const focusAreas = [
  "CARDIO",
  "DEEP SLEEP",
  "HYDRATION",
  "MOBILITY",
  "DIET",
  "RECOVERY",
  "STRENGTH",
  "STRESS CONTROL",
];

const viewMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function HealthPage() {
  const activeOperator = useActiveOperator();
  const age = useOperatorAge();
  const questions = useMemo(() => {
    const prompts = getQuestions("health", age);
    return questionTemplates.map((question, index) => ({
        ...question,
        prompt: prompts[index] ?? question.prompt,
      }));
  }, [age]);
  const [currentView, setCurrentView] = useState<View>("assessment");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [draftAnswer, setDraftAnswer] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [healthScore, setHealthScore] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const currentQuestion = questions[questionIndex];

  const trendData = useMemo(() => {
    const offsets = [-18, -13, -15, -8, -6, -3, 0];
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "TODAY"];
    return offsets.map((offset, index) => ({
      day: days[index],
      score: clamp(healthScore + offset, 0, 100),
    }));
  }, [healthScore]);

  const calculateScore = (completedAnswers: Record<string, number>) => {
    const total = questions.reduce((sum, question) => {
      return sum + question.normalize(completedAnswers[question.id] ?? 0);
    }, 0);

    return Math.round((total / (questions.length * 10)) * 100);
  };

  const answerQuestion = (value: number) => {
    const constrainedValue = clamp(
      value,
      currentQuestion.min ?? 0,
      currentQuestion.max ?? 10,
    );
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: constrainedValue,
    };

    setAnswers(updatedAnswers);
    setDraftAnswer("");

    if (questionIndex === questions.length - 1) {
      setHealthScore(calculateScore(updatedAnswers));
      setCurrentView("focus");
      return;
    }

    setQuestionIndex((index) => index + 1);
  };

  const submitNumberAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(draftAnswer);

    if (!Number.isFinite(value) || draftAnswer.trim() === "") return;
    answerQuestion(value);
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((current) => {
      if (current.includes(area)) {
        return current.filter((item) => item !== area);
      }

      if (current.length === 2) return current;
      return [...current, area];
    });
  };

  const confirmProtocol = async () => {
    if (selectedFocusAreas.length !== 2 || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    const { data: latestRow, error: lookupError } = await supabase
      .from("daily_scores")
      .select("id")
      .eq("profile_id", activeOperator)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError || !latestRow) {
      setSyncError(lookupError?.message ?? "No daily score row found.");
      setIsSyncing(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("daily_scores")
      .update({
        health: healthScore,
        health_focus_1: selectedFocusAreas[0],
        health_focus_2: selectedFocusAreas[1],
        health_focus_1_done: false,
        health_focus_2_done: false,
      })
      .eq("id", latestRow.id)
      .eq("profile_id", activeOperator);

    if (updateError) {
      setSyncError(updateError.message);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(false);
    setCurrentView("dashboard");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <Link
        href="/"
        data-magnetic
        className="fixed left-5 top-5 z-20 border border-white px-3 py-2 font-dot text-[10px] tracking-[0.18em] hover:bg-white hover:text-black sm:left-8 sm:top-8"
      >
        ← OVERVIEW
      </Link>

      <AnimatePresence mode="wait">
        {currentView === "assessment" && (
          <motion.section
            key={`assessment-${questionIndex}`}
            {...viewMotion}
            className="flex min-h-screen items-center justify-center px-5 py-24"
          >
            <div className="w-full max-w-5xl text-center">
              <p className="font-dot text-xs tracking-[0.24em] text-white/50">
                {`[ ${String(questionIndex + 1).padStart(2, "0")} // ${questions.length} ]`}
              </p>

              <h1 className="mx-auto mt-10 max-w-4xl text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                {currentQuestion.prompt}
              </h1>

              {currentQuestion.type === "number" ? (
                <form
                  onSubmit={submitNumberAnswer}
                  className="mx-auto mt-14 flex max-w-md flex-col items-center"
                >
                  <div className="flex w-full items-baseline gap-3 border-b border-white focus-within:border-[#FF0000]">
                    <input
                      autoFocus
                      type="number"
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      value={draftAnswer}
                      onChange={(event) => setDraftAnswer(event.target.value)}
                      className="w-full border-0 bg-black py-3 text-center font-dot text-6xl text-white outline-none [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="font-dot text-xs tracking-[0.18em] text-white/50">
                      {currentQuestion.unit}
                    </span>
                  </div>
                  <button
                    type="submit"
                    data-magnetic
                    disabled={draftAnswer.trim() === ""}
                    className="mt-8 border border-white px-8 py-3 font-dot text-xs tracking-[0.2em] hover:bg-white hover:text-black disabled:border-white/20 disabled:text-white/20"
                  >
                    COMMIT ANSWER
                  </button>
                </form>
              ) : (
                <div className="mx-auto mt-14 grid max-w-md grid-cols-2 gap-4">
                  <button
                    type="button"
                    data-magnetic
                    onClick={() => answerQuestion(10)}
                    className="border border-white py-5 font-dot text-sm tracking-[0.2em] hover:bg-white hover:text-black"
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    data-magnetic
                    onClick={() => answerQuestion(0)}
                    className="border border-white py-5 font-dot text-sm tracking-[0.2em] hover:bg-white hover:text-black"
                  >
                    NO
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {currentView === "focus" && (
          <motion.section
            key="focus"
            {...viewMotion}
            className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-24 sm:px-8"
          >
            <p className="font-dot text-xs tracking-[0.2em] text-[#FF0000]">
              ASSESSMENT COMPLETE
            </p>
            <h1 className="mt-5 max-w-5xl font-dot text-2xl leading-relaxed tracking-[0.1em] sm:text-4xl">
              <ScrambleText>
                {`TARGET ACQUIRED: SCORE ${healthScore}. SELECT 2 DAILY PROTOCOLS.`}
              </ScrambleText>
            </h1>

            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {focusAreas.map((area) => {
                const isSelected = selectedFocusAreas.includes(area);

                return (
                  <button
                    key={area}
                    type="button"
                    data-magnetic
                    aria-pressed={isSelected}
                    onClick={() => toggleFocusArea(area)}
                    className={`flex h-32 items-end border bg-black p-5 text-left font-dot text-xs tracking-[0.16em] transition-colors duration-150 ${
                      isSelected
                        ? "border-[#FF0000] text-white"
                        : "border-white/30 text-white/60 hover:border-white hover:text-white"
                    }`}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      {area}
                      <span className={isSelected ? "text-[#FF0000]" : ""}>
                        {isSelected ? "●" : "○"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex min-h-14 justify-end">
              {syncError && (
                <p className="mr-auto self-center font-dot text-[10px] tracking-[0.16em] text-[#FF0000]">
                  CORE SYNC FAILED / {syncError.toUpperCase()}
                </p>
              )}
              <AnimatePresence>
                {selectedFocusAreas.length === 2 && (
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    type="button"
                    data-magnetic
                    disabled={isSyncing}
                    onClick={() => void confirmProtocol()}
                    className="border border-white bg-white px-8 py-4 font-dot text-xs tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:cursor-wait disabled:bg-black disabled:text-white/50"
                  >
                    {isSyncing ? "SYNCING TO CORE..." : "CONFIRM PROTOCOL"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}

        {currentView === "dashboard" && (
          <motion.section
            key="dashboard"
            {...viewMotion}
            className="mx-auto min-h-screen w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32"
          >
            <header className="grid gap-8 border-b border-white/20 pb-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="font-dot text-xs tracking-[0.22em] text-[#FF0000]">
                  HEALTH / PROTOCOL ACTIVE
                </p>
                <h1 className="mt-4 font-dot text-6xl leading-none sm:text-8xl">
                  <ScrambleText>{healthScore}</ScrambleText>
                  <span className="ml-3 text-sm text-white/40">/ 100</span>
                </h1>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] tracking-[0.2em] text-white/40">
                  CURRENT FOCUS
                </p>
                <p className="mt-3 font-dot text-sm tracking-[0.16em]">
                  {selectedFocusAreas.join(" + ")}
                </p>
              </div>
            </header>

            <div className="mt-12 border border-white/20 p-5 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-dot text-xs tracking-[0.2em] text-white/40">
                    07 DAY SIGNAL
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    CURRENT TRAJECTORY
                  </p>
                </div>
                <p className="font-dot text-xs text-[#FF0000]">LIVE / TODAY</p>
              </div>

              <div className="mt-8">
                <TrendChart data={trendData} />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
