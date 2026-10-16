import { useImperativeHandle, useRef, type Ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { ArchPin } from '@/src/components/Arch';
import type { MapPoint } from '@/src/features/churches/types/church.types';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { fonts, night, useTheme } from '@/src/theme';

export type MapRegion = Region;

export type ChurchMapHandle = {
  animateTo: (region: MapRegion, duration?: number) => void;
};

type Props = {
  ref?: Ref<ChurchMapHandle>;
  initialRegion: MapRegion;
  points: MapPoint[];
  selectedId: string | null;
  showsUserLocation: boolean;
  /** Margen inferior que tapa el carrusel, para que el mapa centre por encima de él. */
  bottomInset: number;
  onRegionChange: (region: MapRegion) => void;
  onSelect: (point: MapPoint) => void;
  onCluster: (point: MapPoint) => void;
  onPressMap: () => void;
};

/** Estilo nocturno del mapa en Android; en iOS lo pone `userInterfaceStyle`. */
const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f1c2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9caec4' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1c2e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070f1b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c2f4a' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
const LIGHT_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

/** Tamaño del globo de un grupo según cuántas iglesias reúne. */
function clusterSize(count: number) {
  if (count >= 1000) return 62;
  if (count >= 100) return 54;
  if (count >= 10) return 46;
  return 40;
}

/** El mapa con sus marcadores. Lo que flota encima lo pone la pantalla. */
export function ChurchMap({
  ref,
  initialRegion,
  points,
  selectedId,
  showsUserLocation,
  bottomInset,
  onRegionChange,
  onSelect,
  onCluster,
  onPressMap,
}: Props) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const map = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateTo: (region, duration = 450) => map.current?.animateToRegion(region, duration),
  }));

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      customMapStyle={isDark ? DARK_STYLE : LIGHT_STYLE}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      mapPadding={{ top: 0, right: 0, left: 0, bottom: bottomInset }}
      onRegionChangeComplete={onRegionChange}
      onPress={onPressMap}
      accessibilityLabel={t.mapAccessibilityLabel}>
      {points.map((point) =>
        point.point_count > 1 ? (
          <Marker
            key={`grupo-${point.id}`}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            accessibilityLabel={t.clusterLabel(point.point_count)}
            onPress={(event) => {
              event.stopPropagation();
              onCluster(point);
            }}>
            <View
              style={[
                styles.cluster,
                {
                  width: clusterSize(point.point_count),
                  height: clusterSize(point.point_count),
                  borderRadius: clusterSize(point.point_count) / 2,
                },
              ]}>
              <Text style={styles.clusterText} allowFontScaling={false}>
                {point.point_count >= 1000
                  ? `${Math.round(point.point_count / 100) / 10}k`
                  : point.point_count}
              </Text>
            </View>
          </Marker>
        ) : (
          <Marker
            // La clave cambia con la selección para que el marcador se vuelva a dibujar.
            key={`${point.id}-${point.id === selectedId ? 'on' : 'off'}`}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
            zIndex={point.id === selectedId ? 3 : point.verified ? 2 : 1}
            accessibilityLabel={`${point.name}. ${point.denomination}`}
            onPress={(event) => {
              event.stopPropagation();
              onSelect(point);
            }}>
            <ArchPin
              denomination={point.denomination}
              verified={point.verified}
              selected={point.id === selectedId}
            />
          </Marker>
        ),
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: night.bottom,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  clusterText: { fontFamily: fonts.textBold, fontSize: 14, color: '#FFFFFF' },
});
