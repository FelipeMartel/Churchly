import { supabase } from '@/src/lib/supabase';
import type {
  Bounds,
  Church,
  ChurchFilters,
  ChurchListItem,
  MapPoint,
  ServiceTime,
} from '../types/church.types';

const CHURCH_COLUMNS =
  'id, name, description, denomination, category, address, city, island, region, country, latitude, longitude, languages, website, instagram, phone, verified, source';

const LIST_COLUMNS =
  'id, name, denomination, category, verified, address, city, island, region, latitude, longitude';

/** Los filtros vacíos viajan como `null`: así el servidor no filtra por ellos. */
function filterArgs(filters: ChurchFilters) {
  return {
    denominations: filters.denominations.length > 0 ? filters.denominations : null,
    languages: filters.languages.length > 0 ? filters.languages : null,
    only_verified: filters.onlyVerified,
  };
}

/** Iglesias del rectángulo visible, ya agrupadas por el servidor si son demasiadas. */
export async function getChurchesInView(
  bounds: Bounds,
  filters: ChurchFilters,
  signal?: AbortSignal,
): Promise<MapPoint[]> {
  let request = supabase.rpc('churches_in_view', {
    min_lat: bounds.minLat,
    min_lon: bounds.minLon,
    max_lat: bounds.maxLat,
    max_lon: bounds.maxLon,
    ...filterArgs(filters),
  });
  if (signal) request = request.abortSignal(signal);
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as MapPoint[];
}

/** Las más cercanas a un punto, de menor a mayor distancia. */
export async function getChurchesNear(
  latitude: number,
  longitude: number,
  radiusKm: number,
  filters: ChurchFilters,
  maxResults = 40,
): Promise<ChurchListItem[]> {
  const { data, error } = await supabase.rpc('churches_near', {
    lat: latitude,
    lon: longitude,
    radius_km: radiusKm,
    ...filterArgs(filters),
    max_results: maxResults,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ChurchListItem[];
}

export async function searchChurches(
  query: string,
  near?: { latitude: number; longitude: number } | null,
): Promise<ChurchListItem[]> {
  const { data, error } = await supabase.rpc('churches_search', {
    query,
    near_lat: near?.latitude ?? null,
    near_lon: near?.longitude ?? null,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ChurchListItem[];
}

export async function getChurchById(id: string): Promise<Church | null> {
  const { data, error } = await supabase
    .from('churches')
    .select(CHURCH_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Church | null;
}

/** Varias iglesias por id, para la lista de guardadas. */
export async function getChurchesByIds(ids: string[]): Promise<ChurchListItem[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('churches').select(LIST_COLUMNS).in('id', ids);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChurchListItem[];
}

export async function getChurchServiceTimes(churchId: string): Promise<ServiceTime[]> {
  const { data, error } = await supabase
    .from('service_times')
    .select('id, church_id, day_of_week, start_time, language, notes')
    .eq('church_id', churchId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceTime[];
}
