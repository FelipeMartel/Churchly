import { useEffect, useState } from "react";
import type { ServiceTime } from "../types/church.types";
import { getChurchServiceTimes } from "../api/getChurchServiceTimes";

type UseChurchServiceTimesResult = {
  serviceTimes: ServiceTime[];
  isLoading: boolean;
  error: Error | null;
};

export function useChurchServiceTimes(
  churchId?: string
): UseChurchServiceTimesResult {
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!churchId) return;

      try {
        setIsLoading(true);
        setError(null);

        const data = await getChurchServiceTimes(churchId);

        if (!cancelled) {
          setServiceTimes(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [churchId]);

  return {
    serviceTimes,
    isLoading,
    error,
  };
}