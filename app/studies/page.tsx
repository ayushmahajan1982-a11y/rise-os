"use client";

import { useMemo } from "react";
import PillarFlow, { type PillarQuestion } from "@/components/PillarFlow";
import { useOperatorAge } from "@/hooks/useOperatorProfile";
import { getQuestions } from "@/utils/questionEngine";

const questionTemplates: PillarQuestion[] = [
  { id: "focused-hours", prompt: "HOURS ENGAGED IN FOCUSED STUDY?", type: "number", min: 0, max: 12, unit: "HRS", normalize: (value) => Math.min(10, value / 0.6) },
  { id: "retained-concepts", prompt: "CONCEPTS SUCCESSFULLY RETAINED?", type: "number", min: 0, max: 20, unit: "ITEMS", normalize: (value) => Math.min(10, value / 2) },
  { id: "distractions", prompt: "DISTRACTION FREQUENCY DURING STUDY?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => 11 - value },
  { id: "recall", prompt: "UNAIDED RECALL ACCURACY?", type: "number", min: 0, max: 100, unit: "%", normalize: (value) => value / 10 },
  { id: "practice", prompt: "PRACTICE PROBLEMS COMPLETED?", type: "number", min: 0, max: 50, unit: "ITEMS", normalize: (value) => Math.min(10, value / 5) },
  { id: "spaced-repetition", prompt: "WAS SPACED REPETITION COMPLETED?", type: "boolean", normalize: (value) => value },
  { id: "breaks", prompt: "WERE PLANNED RECOVERY BREAKS OBSERVED?", type: "boolean", normalize: (value) => value },
  { id: "deep-reading", prompt: "PAGES PROCESSED WITH ACTIVE NOTES?", type: "number", min: 0, max: 100, unit: "PAGES", normalize: (value) => Math.min(10, value / 10) },
  { id: "cognitive-energy", prompt: "COGNITIVE ENERGY DURING THE FINAL SESSION?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "next-session", prompt: "IS THE NEXT STUDY SESSION DEFINED?", type: "boolean", normalize: (value) => value },
];

const focusAreas = [
  "FEYNMAN TECHNIQUE",
  "FLASHCARD REVIEW",
  "DEEP READING",
  "ZERO-DEVICE SESSION",
  "PRACTICE SET",
  "ACTIVE RECALL",
  "CONCEPT MAPPING",
  "TIMED REVISION",
];

export default function StudiesPage() {
  const age = useOperatorAge();
  const questions = useMemo(() => {
    const prompts = getQuestions("studies", age);
    return questionTemplates.map((question, index) => ({
      ...question,
      prompt: prompts[index] ?? question.prompt,
    }));
  }, [age]);

  return <PillarFlow pillar="studies" title="STUDIES" questions={questions} focusAreas={focusAreas} />;
}
