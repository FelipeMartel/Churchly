import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useImperativeHandle, type Ref } from 'react';
import { StyleSheet } from 'react-native';

import type { MapPoint } from '@/src/features/churches/types/church.types';
import { night } from '@/src/theme';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type ChurchMapHandle = {
  animateTo: (region: MapRegion, duration?: number) => void;
};

type Props = {
  ref?: Ref<ChurchMapHandle>;
  initialRegion: MapRegion;
  points: MapPoint[];
  selectedId: string | null;
  showsUserLocation: boolean;
  bottomInset: number;
  onRegionChange: (region: MapRegion) => void;
  onSelect: (point: MapPoint) => void;
  onCluster: (point: MapPoint) => void;
  onPressMap: () => void;
};

/**
 * En la web no hay mapa nativo: se pinta un fondo y se informa de la región, para que el
 * resto de la pantalla (búsqueda, filtros, carrusel) funcione igual.
 */
export function ChurchMap({ ref, initialRegion, onRegionChange }: Props) {
  useImperativeHandle(ref, () => ({ animateTo: (region) => onRegionChange(region) }));

  useEffect(() => {
    onRegionChange(initialRegion);
    // Solo al montar: la región inicial no cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LinearGradient colors={[night.bottom, night.top]} style={StyleSheet.absoluteFill} />;
}
