"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLatestDailyScore,
  type DailyScore,
} from "@/lib/dailyScores";

type DailyScoresState = {
  data: DailyScore | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
};

export function useDailyScores(
  enabled = true,
  profileId = "operator_1",
): DailyScoresState {
  const [data, setData] = useState<DailyScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const refresh = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let isActive = true;

    const loadScores = async () => {
      try {
        const latestScore = await getLatestDailyScore(profileId);

        if (isActive) {
          setData(latestScore);
          setError(null);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load daily scores.",
          );
        }
      } finally {
        if (isActive) {
          setLoadedProfileId(profileId);
          setIsLoading(false);
        }
      }
    };

    void loadScores();

    return () => {
      isActive = false;
    };
  }, [enabled, profileId, requestVersion]);

  const isCurrentProfile = loadedProfileId === profileId;

  return {
    data: isCurrentProfile ? data : null,
    error: isCurrentProfile ? error : null,
    isLoading: isLoading || !isCurrentProfile,
    refresh,
  };
}
