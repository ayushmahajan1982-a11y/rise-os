import SpotlightCard from "@/components/SpotlightCard";
import type { DailyScore } from "@/lib/dailyScores";

type PillarCardsProps = {
  data: DailyScore;
};

const formatScore = (score: number) =>
  Number.isInteger(score) ? String(score).padStart(2, "0") : score.toFixed(1);

export default function PillarCards({ data }: PillarCardsProps) {
  const pillars = [
    {
      title: "HEALTH",
      value: formatScore(data.health),
      label: "/ 100",
      href: "/health",
      focusAreas: [data.healthFocus1, data.healthFocus2] as const,
      focusDone: [data.healthFocus1Done, data.healthFocus2Done] as const,
    },
    {
      title: "STUDIES",
      value: formatScore(data.studies),
      label: "/ 100",
      href: "/studies",
      focusAreas: [data.studiesFocus1, data.studiesFocus2] as const,
      focusDone: [data.studiesFocus1Done, data.studiesFocus2Done] as const,
    },
    {
      title: "FUTURE",
      value: formatScore(data.future),
      label: "/ 100",
      href: "/future",
      focusAreas: [data.futureFocus1, data.futureFocus2] as const,
      focusDone: [data.futureFocus1Done, data.futureFocus2Done] as const,
    },
    {
      title: "RELATIONSHIP",
      value: formatScore(data.relationship),
      label: "/ 100",
      href: "/relationship",
      focusAreas: [
        data.relationshipFocus1,
        data.relationshipFocus2,
      ] as const,
      focusDone: [
        data.relationshipFocus1Done,
        data.relationshipFocus2Done,
      ] as const,
    },
    {
      title: "MONEY",
      value: formatScore(data.money),
      label: "/ 100",
      href: "/money",
      focusAreas: [data.moneyFocus1, data.moneyFocus2] as const,
      focusDone: [data.moneyFocus1Done, data.moneyFocus2Done] as const,
    },
  ];

  return (
    <nav
      aria-label="Life pillars"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
    >
      {pillars.map((pillar) => (
        <SpotlightCard
          key={pillar.href}
          {...pillar}
          tableName="daily_scores"
          rowId={data.id}
          profileId={data.profileId}
        />
      ))}
    </nav>
  );
}
