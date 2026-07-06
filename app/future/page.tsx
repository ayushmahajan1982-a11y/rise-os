"use client";

import { useMemo } from "react";
import PillarFlow, { type PillarQuestion } from "@/components/PillarFlow";
import { useOperatorAge } from "@/hooks/useOperatorProfile";
import { getQuestions } from "@/utils/questionEngine";

const questionTemplates: PillarQuestion[] = [
  { id: "trajectory-time", prompt: "MINUTES INVESTED IN THE FIVE-YEAR TRAJECTORY?", type: "number", min: 0, max: 180, unit: "MIN", normalize: (value) => Math.min(10, value / 18) },
  { id: "skill-time", prompt: "MINUTES ALLOCATED TO NEW SKILL ACQUISITION?", type: "number", min: 0, max: 180, unit: "MIN", normalize: (value) => Math.min(10, value / 12) },
  { id: "networking", prompt: "WAS A PROFESSIONAL NETWORKING ACTION COMPLETED?", type: "boolean", normalize: (value) => value },
  { id: "milestone", prompt: "MEASURABLE PROGRESS TOWARD THE CURRENT MILESTONE?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "portfolio", prompt: "MINUTES SPENT BUILDING A CAREER ASSET?", type: "number", min: 0, max: 180, unit: "MIN", normalize: (value) => Math.min(10, value / 12) },
  { id: "opportunities", prompt: "WERE RELEVANT OPPORTUNITIES REVIEWED?", type: "boolean", normalize: (value) => value },
  { id: "decisions", prompt: "STRATEGIC DECISIONS CLOSED TODAY?", type: "number", min: 0, max: 5, unit: "ITEMS", normalize: (value) => value * 2 },
  { id: "drift", prompt: "FREQUENCY OF LOW-VALUE TASK DRIFT?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => 11 - value },
  { id: "alignment", prompt: "ALIGNMENT BETWEEN TODAY'S OUTPUT AND LONG-TERM DIRECTION?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "scheduled", prompt: "IS THE NEXT MILESTONE SCHEDULED WITH A DEADLINE?", type: "boolean", normalize: (value) => value },
];

const focusAreas = [
  "SKILL SPRINT",
  "PORTFOLIO BUILD",
  "NETWORK OUTREACH",
  "OPPORTUNITY SCAN",
  "FIVE-YEAR REVIEW",
  "MILESTONE DESIGN",
  "CAREER RESEARCH",
  "SYSTEMS PLANNING",
];

export default function FuturePage() {
  const age = useOperatorAge();
  const questions = useMemo(() => {
    const prompts = getQuestions("future", age);
    return questionTemplates.map((question, index) => ({
      ...question,
      prompt: prompts[index] ?? question.prompt,
    }));
  }, [age]);

  return <PillarFlow pillar="future" title="FUTURE" questions={questions} focusAreas={focusAreas} />;
}
