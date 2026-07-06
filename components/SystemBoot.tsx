"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrambleText from "@/components/ScrambleText";
import {
  activateOperator,
  saveOperatorDob,
  useStoredActiveOperator,
  type OperatorId,
} from "@/hooks/useOperatorProfile";
import { calculateAgeFromDob } from "@/utils/questionEngine";

const operators: Array<{ id: OperatorId; label: string; telemetryId: string }> = [
  { id: "operator_1", label: "[ OPERATOR_01 ]", telemetryId: "0x88A.1" },
  { id: "operator_2", label: "[ OPERATOR_02 ]", telemetryId: "0x99B.2" },
];

const normalizeDob = (value: string) => {
  const match = value.match(/^\s*(\d{4})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*$/);
  if (!match) return null;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export default function SystemBoot() {
  const activeOperator = useStoredActiveOperator();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOperator, setSelectedOperator] =
    useState<OperatorId | null>(null);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectOperator = (operator: OperatorId) => {
    setSelectedOperator(operator);
    setStep(2);
    setError(null);

    const storedDob = localStorage.getItem(`${operator}_dob`);
    const storedName = localStorage.getItem(`${operator}_name`);

    setDob(storedDob ? storedDob.replaceAll("-", " / ") : "");
    setName(storedName ?? "");

    if (storedDob && storedName) {
      localStorage.setItem("active_operator_name", storedName);
      activateOperator(operator);
    }
  };

  const authorizeOperator = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOperator) return;

    const normalizedName = name.trim();
    const normalizedDob = normalizeDob(dob);
    const age = normalizedDob ? calculateAgeFromDob(normalizedDob) : null;

    if (!normalizedName) {
      setError("IDENTITY REJECTED / OPERATOR NAME REQUIRED");
      return;
    }

    if (!normalizedDob || age === null) {
      setError("DATE REJECTED / EXPECTED FORMAT YYYY / MM / DD");
      return;
    }

    setError(null);
    localStorage.setItem(`${selectedOperator}_name`, normalizedName);
    localStorage.setItem("active_operator_name", normalizedName);
    saveOperatorDob(selectedOperator, normalizedDob);
  };

  return (
    <AnimatePresence mode="wait">
      {!activeOperator && (
        <motion.div
          key="system-lock"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black px-5 text-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="system-boot-title"
        >
          <div className="w-full max-w-4xl border border-white p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-white/20 pb-5">
              <p className="font-dot text-[10px] tracking-[0.22em] text-[#FF0000]">
                SECURITY CLEARANCE / STEP 0{step}
              </p>
              <span className="h-2 w-2 rounded-full bg-[#FF0000]" />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.section
                  key="operator-select"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1
                    id="system-boot-title"
                    className="mt-10 font-dot text-2xl leading-relaxed tracking-[0.12em] sm:text-4xl"
                  >
                    <ScrambleText>
                      SYSTEM LOCKED. SELECT OPERATOR.
                    </ScrambleText>
                  </h1>

                  <div className="mt-12 grid gap-4 sm:grid-cols-2">
                    {operators.map((operator) => (
                      <button
                        key={operator.id}
                        type="button"
                        data-magnetic="true"
                        onClick={() => selectOperator(operator.id)}
                        className="group relative flex h-64 flex-col justify-between overflow-hidden border border-white bg-black p-6 text-left transition-colors duration-300 hover:border-[#FF0000]"
                      >
                        <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                          <span>ID: {operator.telemetryId}</span>
                          <span>STATUS: ENCRYPTED</span>
                          <span>DATA: ARCHIVED</span>
                        </div>

                        <div className="flex w-full items-center justify-center">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 80 80"
                            className="h-24 w-24 fill-transparent stroke-white/20 transition-colors duration-300 group-hover:stroke-[#FF0000]/50"
                            strokeWidth="1"
                          >
                            <circle cx="40" cy="40" r="28" />
                            <circle cx="40" cy="40" r="18" />
                            <circle cx="40" cy="40" r="4" />
                            <path d="M40 4v20M40 56v20M4 40h20M56 40h20" />
                            <circle cx="27" cy="27" r="2" />
                            <circle cx="53" cy="27" r="2" />
                            <circle cx="27" cy="53" r="2" />
                            <circle cx="53" cy="53" r="2" />
                          </svg>
                        </div>

                        <motion.div
                          aria-hidden="true"
                          animate={{ y: [0, 255] }}
                          transition={{
                            repeat: Infinity,
                            repeatType: "mirror",
                            duration: 1.5,
                            ease: "linear",
                          }}
                          className="absolute left-0 top-0 h-[1px] w-full bg-[#FF0000] opacity-0 shadow-[0_0_10px_#FF0000] transition-opacity group-hover:opacity-100"
                        />

                        <span className="z-10 font-dot text-lg tracking-[0.14em] text-white transition-colors duration-300 group-hover:text-[#FF0000] sm:text-2xl">
                          {operator.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.section>
              ) : (
                <motion.form
                  key="operator-dob"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={authorizeOperator}
                >
                  <button
                    type="button"
                    data-magnetic="true"
                    onClick={() => setStep(1)}
                    className="mt-8 font-dot text-[10px] tracking-[0.18em] text-white/50 hover:text-white"
                  >
                    ← CHANGE OPERATOR
                  </button>

                  <h1
                    id="system-boot-title"
                    className="mt-8 font-dot text-2xl leading-relaxed tracking-[0.12em] sm:text-4xl"
                  >
                    <ScrambleText>IDENTIFY OPERATOR.</ScrambleText>
                  </h1>

                  <label className="mt-12 block">
                    <span className="text-[10px] tracking-[0.2em] text-white/40">
                      OPERATOR NAME
                    </span>
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      placeholder="ENTER NAME"
                      onChange={(event) => setName(event.target.value)}
                      className="mt-4 w-full border-0 border-b border-white bg-black px-0 py-4 font-dot text-4xl uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/15 focus:border-[#FF0000] sm:text-6xl"
                    />
                  </label>

                  <label className="mt-10 block">
                    <span className="text-[10px] tracking-[0.2em] text-white/40">
                      {selectedOperator?.toUpperCase()} / YYYY / MM / DD
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={dob}
                      placeholder="YYYY / MM / DD"
                      onChange={(event) => setDob(event.target.value)}
                      className="mt-4 w-full border-0 border-b border-white bg-black px-0 py-4 font-dot text-xl tracking-[0.16em] text-white outline-none placeholder:text-white/20 focus:border-[#FF0000] sm:text-3xl"
                    />
                  </label>

                  {error && (
                    <p className="mt-4 font-dot text-[10px] tracking-[0.16em] text-[#FF0000]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    data-magnetic="true"
                    disabled={!name.trim() || !dob.trim()}
                    className="mt-8 w-full border border-white bg-white px-6 py-4 font-dot text-xs tracking-[0.2em] text-black hover:bg-black hover:text-white disabled:border-white/20 disabled:bg-black disabled:text-white/20"
                  >
                    AUTHORIZE OPERATOR
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
