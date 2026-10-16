import { useEffect, useState } from 'react';
import { getChurches } from '../api/getChurches';
import type { Church } from '../types/church.types';

export function useChurches() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChurches() {
      try {
        setLoading(true);
        setError(null);

        const data = await getChurches();
        setChurches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    loadChurches();
  }, []);

  return { churches, loading, error };
}