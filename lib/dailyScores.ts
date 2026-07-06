import { supabase } from "@/lib/supabase/client";

export type PillarScores = {
  health: number;
  studies: number;
  future: number;
  relationship: number;
  money: number;
};

export type DailyScore = PillarScores & {
  id: string;
  profileId: string;
  createdAt: string;
  healthFocus1: string | null;
  healthFocus2: string | null;
  healthFocus1Done: boolean;
  healthFocus2Done: boolean;
  studiesFocus1: string | null;
  studiesFocus2: string | null;
  studiesFocus1Done: boolean;
  studiesFocus2Done: boolean;
  futureFocus1: string | null;
  futureFocus2: string | null;
  futureFocus1Done: boolean;
  futureFocus2Done: boolean;
  relationshipFocus1: string | null;
  relationshipFocus2: string | null;
  relationshipFocus1Done: boolean;
  relationshipFocus2Done: boolean;
  moneyFocus1: string | null;
  moneyFocus2: string | null;
  moneyFocus1Done: boolean;
  moneyFocus2Done: boolean;
};

const clampScore = (value: unknown): number => {
  const score = Number(value);

  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
};

export async function getLatestDailyScore(
  profileId: string,
): Promise<DailyScore | null> {
  const { data, error } = await supabase
    .from("daily_scores")
    .select(
      "id, profile_id, created_at, health, studies, future, relationship, money, health_focus_1, health_focus_2, health_focus_1_done, health_focus_2_done, studies_focus_1, studies_focus_2, studies_focus_1_done, studies_focus_2_done, future_focus_1, future_focus_2, future_focus_1_done, future_focus_2_done, relationship_focus_1, relationship_focus_2, relationship_focus_1_done, relationship_focus_2_done, money_focus_1, money_focus_2, money_focus_1_done, money_focus_2_done",
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;

  return {
    id: String(row.id),
    profileId: String(row.profile_id),
    createdAt: String(row.created_at),
    health: clampScore(row.health),
    studies: clampScore(row.studies),
    future: clampScore(row.future),
    relationship: clampScore(row.relationship),
    money: clampScore(row.money),
    healthFocus1:
      typeof row.health_focus_1 === "string" ? row.health_focus_1 : null,
    healthFocus2:
      typeof row.health_focus_2 === "string" ? row.health_focus_2 : null,
    healthFocus1Done: row.health_focus_1_done === true,
    healthFocus2Done: row.health_focus_2_done === true,
    studiesFocus1:
      typeof row.studies_focus_1 === "string" ? row.studies_focus_1 : null,
    studiesFocus2:
      typeof row.studies_focus_2 === "string" ? row.studies_focus_2 : null,
    studiesFocus1Done: row.studies_focus_1_done === true,
    studiesFocus2Done: row.studies_focus_2_done === true,
    futureFocus1:
      typeof row.future_focus_1 === "string" ? row.future_focus_1 : null,
    futureFocus2:
      typeof row.future_focus_2 === "string" ? row.future_focus_2 : null,
    futureFocus1Done: row.future_focus_1_done === true,
    futureFocus2Done: row.future_focus_2_done === true,
    relationshipFocus1:
      typeof row.relationship_focus_1 === "string"
        ? row.relationship_focus_1
        : null,
    relationshipFocus2:
      typeof row.relationship_focus_2 === "string"
        ? row.relationship_focus_2
        : null,
    relationshipFocus1Done: row.relationship_focus_1_done === true,
    relationshipFocus2Done: row.relationship_focus_2_done === true,
    moneyFocus1:
      typeof row.money_focus_1 === "string" ? row.money_focus_1 : null,
    moneyFocus2:
      typeof row.money_focus_2 === "string" ? row.money_focus_2 : null,
    moneyFocus1Done: row.money_focus_1_done === true,
    moneyFocus2Done: row.money_focus_2_done === true,
  };
}
