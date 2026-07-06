"use client";

import { useMemo } from "react";
import PillarFlow, { type PillarQuestion } from "@/components/PillarFlow";
import { useOperatorAge } from "@/hooks/useOperatorProfile";
import { getQuestions } from "@/utils/questionEngine";

const questionTemplates: PillarQuestion[] = [
  { id: "budget", prompt: "DID SPENDING REMAIN WITHIN THE ESTABLISHED BUDGET?", type: "boolean", normalize: (value) => value },
  { id: "unexpected-spend", prompt: "TOTAL UNEXPECTED EXPENDITURE?", type: "number", min: 0, max: 5000, unit: "VALUE", normalize: (value) => Math.max(0, 10 - value / 500) },
  { id: "planning-time", prompt: "MINUTES ALLOCATED TO FINANCIAL PLANNING?", type: "number", min: 0, max: 120, unit: "MIN", normalize: (value) => Math.min(10, value / 6) },
  { id: "savings", prompt: "WAS THE PLANNED SAVINGS TRANSFER COMPLETED?", type: "boolean", normalize: (value) => value },
  { id: "discretionary", prompt: "NUMBER OF DISCRETIONARY PURCHASES?", type: "number", min: 0, max: 20, unit: "ITEMS", normalize: (value) => Math.max(0, 10 - value / 2) },
  { id: "transactions", prompt: "WERE ALL RECENT TRANSACTIONS REVIEWED?", type: "boolean", normalize: (value) => value },
  { id: "income-work", prompt: "MINUTES INVESTED IN INCOME-GENERATING WORK?", type: "number", min: 0, max: 300, unit: "MIN", normalize: (value) => Math.min(10, value / 18) },
  { id: "debt-plan", prompt: "WAS THE CURRENT DEBT PAYMENT PLAN FOLLOWED?", type: "boolean", normalize: (value) => value },
  { id: "financial-stress", prompt: "CURRENT FINANCIAL STRESS LOAD?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => 11 - value },
  { id: "cashflow", prompt: "CLARITY OF CURRENT NET CASH FLOW?", type: "number", min: 1, max: 10, unit: "/ 10", normalize: (value) => value },
];

const focusAreas = [
  "ZERO SPEND DAY",
  "REVIEW PORTFOLIO",
  "CANCEL SUBSCRIPTIONS",
  "SIDE HUSTLE PREP",
  "BUDGET RECONCILIATION",
  "AUTOMATE SAVINGS",
  "DEBT REDUCTION",
  "EXPENSE AUDIT",
];

export default function MoneyPage() {
  const age = useOperatorAge();
  const questions = useMemo(() => {
    const prompts = getQuestions("money", age);
    return questionTemplates.map((question, index) => ({
      ...question,
      prompt: prompts[index] ?? question.prompt,
    }));
  }, [age]);

  return <PillarFlow pillar="money" title="MONEY" questions={questions} focusAreas={focusAreas} />;
}
