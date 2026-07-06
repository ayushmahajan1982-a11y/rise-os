"use client";

import { useSyncExternalStore } from "react";
import { calculateAgeFromDob } from "@/utils/questionEngine";

export type OperatorId = "operator_1" | "operator_2";

const SESSION_EVENT = "operator-session-updated";

const isOperatorId = (value: string | null): value is OperatorId =>
  value === "operator_1" || value === "operator_2";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
};

const getSnapshot = () => {
  const storedOperator = localStorage.getItem("active_operator");
  const operator = isOperatorId(storedOperator) ? storedOperator : "";
  const dob = operator ? localStorage.getItem(`${operator}_dob`) ?? "" : "";
  return `${operator}|${dob}`;
};

const getServerSnapshot = () => "|";

const useOperatorSnapshot = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export function useStoredActiveOperator(): OperatorId | null {
  const [operator] = useOperatorSnapshot().split("|");
  return isOperatorId(operator) ? operator : null;
}

export function useActiveOperator(): OperatorId {
  return useStoredActiveOperator() ?? "operator_1";
}

export function useOperatorDob(): string {
  const [, dob = ""] = useOperatorSnapshot().split("|");
  return dob;
}

export function useOperatorAge(): number {
  const dob = useOperatorDob();
  return calculateAgeFromDob(dob) ?? 18;
}

export function activateOperator(operator: OperatorId) {
  localStorage.setItem("active_operator", operator);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveOperatorDob(operator: OperatorId, dob: string) {
  localStorage.setItem(`${operator}_dob`, dob);
  activateOperator(operator);
}
