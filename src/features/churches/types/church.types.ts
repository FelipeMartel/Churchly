export type ChurchCategory = 'iglesia' | 'catedral' | 'capilla' | 'ermita' | 'monasterio';

/** Lo mínimo para pintar una iglesia en el mapa o en una lista. */
export type ChurchSummary = {
  id: string;
  name: string;
  denomination: string;
  category: ChurchCategory;
  verified: boolean;
  latitude: number;
  longitude: number;
};

/** Punto del mapa: una iglesia, o un grupo de varias cuando `point_count` es mayor que 1. */
export type MapPoint = ChurchSummary & { point_count: number };

/** Iglesia en una lista, con dónde está y, si se conoce, a qué distancia. */
export type ChurchListItem = ChurchSummary & {
  address?: string | null;
  city: string | null;
  island: string | null;
  region: string | null;
  distance_km?: number;
};

export type Church = {
  id: string;
  name: string;
  description: string | null;
  denomination: string;
  category: ChurchCategory;
  address: string | null;
  city: string | null;
  island: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  languages: string[];
  website: string | null;
  instagram: string | null;
  phone: string | null;
  verified: boolean;
  /** 'manual': dada de alta por su iglesia. 'osm': importada de OpenStreetMap. */
  source: 'manual' | 'osm';
};

export type ServiceTime = {
  id: string;
  church_id: string;
  day_of_week: number;
  start_time: string;
  language: string | null;
  notes: string | null;
};

/** Filtros del mapa y de las listas. Vacío significa «sin filtrar». */
export type ChurchFilters = {
  denominations: string[];
  languages: string[];
  onlyVerified: boolean;
};

export type Bounds = { minLat: number; minLon: number; maxLat: number; maxLon: number };
