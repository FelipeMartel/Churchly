import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Coords = { latitude: number; longitude: number };

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable';

// La ubicación se pide una vez y la comparten todas las pantallas: el mapa, la búsqueda
// y las listas ordenan por cercanía con el mismo punto.
let cached: { coords: Coords | null; status: LocationStatus } = { coords: null, status: 'loading' };
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

async function locate() {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      cached = { coords: null, status: 'denied' };
      return;
    }
    // Primero la última conocida, que es inmediata; la precisa llega después.
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      cached = {
        coords: { latitude: last.coords.latitude, longitude: last.coords.longitude },
        status: 'granted',
      };
      listeners.forEach((listener) => listener());
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    cached = {
      coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      status: 'granted',
    };
  } catch {
    if (!cached.coords) cached = { coords: null, status: 'unavailable' };
  } finally {
    listeners.forEach((listener) => listener());
  }
}

/** Vuelve a pedir la ubicación: al refrescar, o tras conceder el permiso en Ajustes. */
export function retryLocation() {
  request = locate();
}

/** Posición del usuario, o por qué no se tiene. No bloquea: la app funciona sin ella. */
export function useUserLocation() {
  const [state, setState] = useState(cached);

  useEffect(() => {
    const listener = () => setState(cached);
    listeners.add(listener);
    request ??= locate();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}
