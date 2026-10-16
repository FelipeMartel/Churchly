import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChurchCard, CARD_WIDTH } from '@/src/components/ChurchItems';
import { ChurchMap, type ChurchMapHandle, type MapRegion } from '@/src/components/ChurchMap';
import { AppText, GlassPanel, PressableScale } from '@/src/components/ui';
import { useChurchesInView, useChurchesNear } from '@/src/features/churches/hooks/useChurchQueries';
import {
  countActiveFilters,
  useFilters,
  useMapTarget,
} from '@/src/features/churches/store';
import type { ChurchListItem, MapPoint } from '@/src/features/churches/types/church.types';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { radius, shadow, space, useTheme } from '@/src/theme';

/** Canarias entera: lo que se ve mientras no se sabe dónde está la persona. */
const INITIAL_REGION: MapRegion = {
  latitude: 28.3,
  longitude: -15.8,
  latitudeDelta: 3.6,
  longitudeDelta: 5.2,
};

/** Alto aproximado de la barra de pestañas nativa, que flota sobre el contenido. */
const TAB_BAR = Platform.select({ ios: 50, android: 80 }) ?? 0;
const CAROUSEL_HEIGHT = 96;
const CARD_GAP = space.s;
/** Por encima de este zoom el carrusel no aporta: hay demasiadas iglesias en pantalla. */
const MAX_SPAN_FOR_LIST = 0.9;

function distanceKm(a: { latitude: number; longitude: number }, b: typeof a) {
  const dLat = (a.latitude - b.latitude) * 111;
  const dLon = (a.longitude - b.longitude) * 111 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export default function MapScreen() {
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const filters = useFilters();
  const target = useMapTarget();
  const { coords, status } = useUserLocation();

  const map = useRef<ChurchMapHandle>(null);
  const carousel = useRef<FlatList<ChurchListItem>>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const centredOnUser = useRef(false);
  const handledTarget = useRef(0);

  const bounds = region
    ? {
        minLat: region.latitude - region.latitudeDelta / 2,
        maxLat: region.latitude + region.latitudeDelta / 2,
        minLon: region.longitude - region.longitudeDelta / 2,
        maxLon: region.longitude + region.longitudeDelta / 2,
      }
    : null;
  const points = useChurchesInView(bounds, filters);

  // El carrusel enseña las iglesias alrededor del centro del mapa, hasta el borde visible.
  const zoomedIn = region != null && region.latitudeDelta <= MAX_SPAN_FOR_LIST;
  const centre = zoomedIn ? { latitude: region.latitude, longitude: region.longitude } : null;
  const radiusKm = region ? Math.max(1, Math.round((region.latitudeDelta * 111) / 2)) : 5;
  const nearby = useChurchesNear(centre, radiusKm, filters);
  const cards = zoomedIn ? (nearby.data ?? []) : [];
  const aroundUser = coords != null && centre != null && distanceKm(coords, centre) < 1.5;

  // La primera vez que se conoce la ubicación, el mapa va hasta ella.
  useEffect(() => {
    if (!coords || centredOnUser.current || target) return;
    centredOnUser.current = true;
    map.current?.animateTo({ ...coords, latitudeDelta: 0.06, longitudeDelta: 0.06 }, 700);
  }, [coords, target]);

  // Otra pantalla (búsqueda, lista, ficha) ha pedido enseñar una iglesia en el mapa.
  useEffect(() => {
    if (!target || handledTarget.current === target.nonce) return;
    handledTarget.current = target.nonce;
    centredOnUser.current = true;
    map.current?.animateTo(
      {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
    setSelectedId(target.id);
  }, [target]);

  const select = (point: { id: string }) => {
    Haptics.selectionAsync();
    setSelectedId(point.id);
    const index = cards.findIndex((card) => card.id === point.id);
    if (index >= 0) carousel.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  };

  const zoomInto = (point: MapPoint) => {
    if (!region) return;
    Haptics.selectionAsync();
    map.current?.animateTo({
      latitude: point.latitude,
      longitude: point.longitude,
      latitudeDelta: region.latitudeDelta / 2.6,
      longitudeDelta: region.longitudeDelta / 2.6,
    });
  };

  const goToUser = () => {
    if (!coords) return;
    Haptics.selectionAsync();
    map.current?.animateTo({ ...coords, latitudeDelta: 0.06, longitudeDelta: 0.06 });
  };

  const activeFilters = countActiveFilters(filters);
  const total = (points.data ?? []).reduce((sum, point) => sum + point.point_count, 0);
  const bottom = insets.bottom + TAB_BAR;

  let notice: string | null = null;
  if (points.isError) notice = t.mapError;
  else if (points.isSuccess && total === 0) notice = t.noChurchesHere;
  else if (!zoomedIn && total > 0) notice = t.zoomToSeeChurches;
  else if (status === 'denied' && !region) notice = t.locationDenied;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ChurchMap
        ref={map}
        initialRegion={INITIAL_REGION}
        points={points.data ?? []}
        selectedId={selectedId}
        showsUserLocation={status === 'granted'}
        bottomInset={bottom + (cards.length > 0 ? CAROUSEL_HEIGHT + space.xl : 0)}
        onRegionChange={setRegion}
        onSelect={select}
        onCluster={zoomInto}
        onPressMap={() => setSelectedId(null)}
      />

      {/* Barra superior: búsqueda y filtros. */}
      <View style={[styles.top, { top: insets.top + space.xs }]} pointerEvents="box-none">
        <GlassPanel style={[styles.search, shadow(isDark)]}>
          <PressableScale
            accessibilityLabel={t.searchPlaceholder}
            onPress={() => router.push('/search')}
            style={styles.searchButton}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <AppText color="textMuted" numberOfLines={1} style={styles.flexible}>
              {t.searchPlaceholder}
            </AppText>
          </PressableScale>
        </GlassPanel>
        <GlassPanel style={[styles.round, shadow(isDark)]}>
          <PressableScale
            accessibilityLabel={activeFilters > 0 ? t.filtersActive(activeFilters) : t.filters}
            onPress={() => router.push('/filters')}
            style={styles.roundButton}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
            {activeFilters > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                <AppText variant="label" color="onGold" allowFontScaling={false}>
                  {activeFilters}
                </AppText>
              </View>
            ) : null}
          </PressableScale>
        </GlassPanel>
      </View>

      {/* Parte inferior: aviso o carrusel, y los botones de ubicación y lista. */}
      <View style={[styles.bottom, { bottom: bottom + space.s }]} pointerEvents="box-none">
        <View style={styles.actions} pointerEvents="box-none">
          {cards.length > 0 ? (
            <GlassPanel style={[styles.pill, shadow(isDark)]}>
              <PressableScale
                accessibilityLabel={t.seeList}
                onPress={() =>
                  router.push({
                    pathname: '/list',
                    params: {
                      lat: String(region!.latitude),
                      lon: String(region!.longitude),
                      radius: String(radiusKm),
                      mine: aroundUser ? '1' : '0',
                    },
                  })
                }
                style={styles.pillButton}>
                <Ionicons name="list" size={18} color={colors.text} />
                <AppText variant="label">
                  {aroundUser ? t.nearYou : t.inThisArea} · {t.churchesCount(cards.length)}
                </AppText>
              </PressableScale>
            </GlassPanel>
          ) : (
            <View />
          )}
          {coords ? (
            <GlassPanel style={[styles.round, shadow(isDark)]}>
              <PressableScale
                accessibilityLabel={t.myLocation}
                onPress={goToUser}
                style={styles.roundButton}>
                <Ionicons name="locate" size={22} color={colors.text} />
              </PressableScale>
            </GlassPanel>
          ) : null}
        </View>

        {notice ? (
          <GlassPanel style={[styles.notice, shadow(isDark)]}>
            <AppText variant="detail" style={styles.centred} accessibilityLiveRegion="polite">
              {notice}
            </AppText>
            {points.isError ? (
              <PressableScale onPress={() => points.refetch()} style={styles.retry}>
                <AppText variant="label" color="gold">
                  {t.retry}
                </AppText>
              </PressableScale>
            ) : null}
          </GlassPanel>
        ) : null}

        {cards.length > 0 ? (
          <FlatList
            ref={carousel}
            data={cards}
            horizontal
            keyExtractor={(church) => church.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.carousel}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH + CARD_GAP,
              offset: (CARD_WIDTH + CARD_GAP) * index,
              index,
            })}
            renderItem={({ item }) => (
              <ChurchCard
                church={item}
                selected={item.id === selectedId}
                onPress={() => router.push({ pathname: '/church/[id]', params: { id: item.id } })}
              />
            )}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexible: { flex: 1 },
  centred: { textAlign: 'center' },
  top: {
    position: 'absolute',
    left: space.m,
    right: space.m,
    flexDirection: 'row',
    gap: space.xs,
  },
  search: { flex: 1, borderRadius: radius.full },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 52,
    paddingHorizontal: space.m,
  },
  round: { width: 52, height: 52, borderRadius: 26 },
  roundButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 0, right: 0, gap: space.s },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: space.m,
  },
  pill: { borderRadius: radius.full },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
    paddingHorizontal: space.m,
  },
  notice: {
    alignSelf: 'center',
    maxWidth: 340,
    marginHorizontal: space.m,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
    borderRadius: radius.l,
    gap: space.xxs,
  },
  retry: { alignSelf: 'center', minHeight: 36, justifyContent: 'center' },
  carousel: { paddingHorizontal: space.m, gap: CARD_GAP },
});
