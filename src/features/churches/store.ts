import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { ChurchFilters } from './types/church.types';

/**
 * Estado que comparten varias pantallas sin pasar por la navegación: los filtros (mapa,
 * lista y su panel) y las iglesias guardadas (ficha, listas y la pestaña Guardadas).
 */

type Listener = () => void;

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

// ---------------------------------------------------------------------------- Filtros

export const NO_FILTERS: ChurchFilters = { denominations: [], languages: [], onlyVerified: false };

const filtersStore = createStore<ChurchFilters>(NO_FILTERS);

export function useFilters() {
  return useSyncExternalStore(filtersStore.subscribe, filtersStore.get, filtersStore.get);
}

export function setFilters(filters: ChurchFilters) {
  filtersStore.set(filters);
}

export function countActiveFilters(filters: ChurchFilters) {
  return filters.denominations.length + filters.languages.length + (filters.onlyVerified ? 1 : 0);
}

// -------------------------------------------------------------------------- Guardadas

const SAVED_KEY = 'churchly.saved';

/** `null` mientras no se han leído del dispositivo. */
const savedStore = createStore<string[] | null>(null);
let loading = false;

function subscribeSaved(listener: Listener) {
  if (savedStore.get() === null && !loading) {
    loading = true;
    AsyncStorage.getItem(SAVED_KEY)
      .then((stored) => savedStore.set(stored ? (JSON.parse(stored) as string[]) : []))
      .catch(() => savedStore.set([]));
  }
  return savedStore.subscribe(listener);
}

/** Ids de las iglesias guardadas, la más reciente primero. */
export function useSavedChurches() {
  const saved = useSyncExternalStore(subscribeSaved, savedStore.get, savedStore.get);
  return { saved: saved ?? [], ready: saved !== null };
}

export function toggleSaved(id: string) {
  const current = savedStore.get() ?? [];
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  savedStore.set(next);
  AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next)).catch(() => {});
  return next.includes(id);
}

// --------------------------------------------------------------- Selección en el mapa

/** Iglesia que otra pantalla (búsqueda, lista) pide enseñar en el mapa. */
export type MapTarget = { id: string; latitude: number; longitude: number; nonce: number };

const targetStore = createStore<MapTarget | null>(null);

export function useMapTarget() {
  return useSyncExternalStore(targetStore.subscribe, targetStore.get, targetStore.get);
}

export function showOnMap(church: { id: string; latitude: number; longitude: number }) {
  targetStore.set({ ...church, nonce: Date.now() });
}
