"use client";

import { useMemo } from "react";
import PillarFlow, { type PillarQuestion } from "@/components/PillarFlow";
import { useOperatorAge } from "@/hooks/useOperatorProfile";
import { getQuestions } from "@/utils/questionEngine";

const questionTemplates: PillarQuestion[] = [
  { id: "conversation-quality", prompt: "QUALITY OF MEANINGFUL CONVERSATIONS TODAY?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "connection-time", prompt: "MINUTES DEDICATED TO UNDISTRACTED SOCIAL CONNECTION?", type: "number", min: 0, max: 180, unit: "MIN", normalize: (value) => Math.min(10, value / 12) },
  { id: "listening", prompt: "ACTIVE LISTENING CONSISTENCY?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "resolution", prompt: "CONFLICT RESOLUTION EFFECTIVENESS?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "initiated-contact", prompt: "WAS MEANINGFUL CONTACT INITIATED?", type: "boolean", normalize: (value) => value },
  { id: "appreciation", prompt: "WAS SPECIFIC APPRECIATION EXPRESSED?", type: "boolean", normalize: (value) => value },
  { id: "presence", prompt: "QUALITY OF ATTENTION DURING INTERACTIONS?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
  { id: "boundaries", prompt: "WERE PERSONAL AND SHARED BOUNDARIES RESPECTED?", type: "boolean", normalize: (value) => value },
  { id: "tension", prompt: "LEVEL OF UNRESOLVED INTERPERSONAL TENSION?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => 11 - value },
  { id: "commitments", prompt: "FOLLOW-THROUGH ON RELATIONAL COMMITMENTS?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
];

const focusAreas = [
  "DEEP CONVERSATION",
  "ACTIVE LISTENING",
  "APPRECIATION NOTE",
  "DEVICE-FREE TIME",
  "CONFLICT REPAIR",
  "FAMILY CHECK-IN",
  "BOUNDARY REVIEW",
  "SHARED ACTIVITY",
];

export default function RelationshipPage() {
  const age = useOperatorAge();
  const questions = useMemo(() => {
    const prompts = getQuestions("relationship", age);
    return questionTemplates.map((question, index) => ({
      ...question,
      prompt: prompts[index] ?? question.prompt,
    }));
  }, [age]);

  return <PillarFlow pillar="relationship" title="RELATIONSHIP" questions={questions} focusAreas={focusAreas} />;
}
