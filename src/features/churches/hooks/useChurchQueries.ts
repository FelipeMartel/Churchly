import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getChurchById,
  getChurchesByIds,
  getChurchesInView,
  getChurchesNear,
  getChurchServiceTimes,
  searchChurches,
} from '../api/churches';
import type { Bounds, ChurchFilters } from '../types/church.types';

const MINUTE = 60 * 1000;

/** Redondea el rectángulo para que mover el mapa un pelo no dispare otra consulta. */
function roundBounds(bounds: Bounds): Bounds {
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    minLat: round(bounds.minLat),
    minLon: round(bounds.minLon),
    maxLat: round(bounds.maxLat),
    maxLon: round(bounds.maxLon),
  };
}

/** Puntos del mapa para la zona visible. Mientras llega la zona nueva se ve la anterior. */
export function useChurchesInView(bounds: Bounds | null, filters: ChurchFilters) {
  const rounded = bounds ? roundBounds(bounds) : null;
  return useQuery({
    queryKey: ['churches', 'view', rounded, filters],
    enabled: rounded != null,
    staleTime: 10 * MINUTE,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) => getChurchesInView(rounded!, filters, signal),
  });
}

type Point = { latitude: number; longitude: number };

/** Las más cercanas a un punto. El punto se redondea a ~100 m para aprovechar la caché. */
export function useChurchesNear(point: Point | null, radiusKm: number, filters: ChurchFilters) {
  const latitude = point ? Math.round(point.latitude * 1000) / 1000 : null;
  const longitude = point ? Math.round(point.longitude * 1000) / 1000 : null;
  return useQuery({
    queryKey: ['churches', 'near', latitude, longitude, radiusKm, filters],
    enabled: latitude != null && longitude != null,
    staleTime: 10 * MINUTE,
    placeholderData: keepPreviousData,
    queryFn: () => getChurchesNear(latitude!, longitude!, radiusKm, filters),
  });
}

export function useChurchSearch(query: string, near: Point | null) {
  const text = query.trim();
  return useQuery({
    queryKey: ['churches', 'search', text, near?.latitude ?? null, near?.longitude ?? null],
    enabled: text.length >= 2,
    staleTime: 5 * MINUTE,
    placeholderData: keepPreviousData,
    queryFn: () => searchChurches(text, near),
  });
}

export function useChurch(id: string | undefined) {
  return useQuery({
    queryKey: ['churches', 'detail', id],
    enabled: id != null,
    staleTime: 30 * MINUTE,
    queryFn: () => getChurchById(id!),
  });
}

export function useChurchServiceTimes(churchId: string | undefined) {
  return useQuery({
    queryKey: ['churches', 'service-times', churchId],
    enabled: churchId != null,
    staleTime: 30 * MINUTE,
    queryFn: () => getChurchServiceTimes(churchId!),
  });
}

export function useChurchesByIds(ids: string[]) {
  const sorted = [...ids].sort();
  return useQuery({
    queryKey: ['churches', 'by-ids', sorted],
    enabled: sorted.length > 0,
    staleTime: 10 * MINUTE,
    placeholderData: keepPreviousData,
    queryFn: () => getChurchesByIds(sorted),
  });
}
