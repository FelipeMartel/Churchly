import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchHero, ArchThumb } from '@/src/components/Arch';
import { ChurchRow, placeOf, useDistanceLabel } from '@/src/components/ChurchItems';
import { AppText, Button, Chip, PressableScale, Skeleton } from '@/src/components/ui';
import { useChurchesNear } from '@/src/features/churches/hooks/useChurchQueries';
import { countActiveFilters, useFilters } from '@/src/features/churches/store';
import type { ChurchListItem } from '@/src/features/churches/types/church.types';
import { retryLocation, useUserLocation } from '@/src/hooks/useUserLocation';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { fonts, glassColor, night, radius, shadow, space, useTheme } from '@/src/theme';

const TAB_BAR = Platform.select({ ios: 50, android: 80 }) ?? 0;
/** Distancias entre las que se puede elegir, en km. */
const RADII = [2, 5, 10, 25];

/** La iglesia más cercana, destacada con su vidriera. */
function Nearest({ church }: { church: ChurchListItem }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const distance = useDistanceLabel()(church.distance_km);
  const place = placeOf(church);
  const kind = church.category !== 'iglesia' ? `${t.categories[church.category]} · ` : '';

  return (
    <PressableScale
      accessibilityLabel={[t.nearestChurch, church.name, church.denomination, distance]
        .filter(Boolean)
        .join('. ')}
      onPress={() => router.push({ pathname: '/church/[id]', params: { id: church.id } })}
      style={[styles.nearest, shadow(isDark)]}>
      <ArchHero denomination={church.denomination} category={church.category} />
      <LinearGradient
        colors={['rgba(10,23,48,0)', 'rgba(10,23,48,0.9)']}
        locations={[0.2, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.nearestTop}>
        <View style={styles.nearestBadge}>
          <Text style={styles.nearestBadgeText}>{t.nearestChurch}</Text>
        </View>
        {distance ? <Text style={styles.nearestDistance}>{distance}</Text> : null}
      </View>
      <View style={styles.nearestText}>
        <View style={[styles.tradition, { backgroundColor: glassColor(church.denomination) }]}>
          <Text style={styles.traditionText}>
            {kind}
            {church.denomination}
          </Text>
        </View>
        <Text style={styles.nearestName} numberOfLines={2}>
          {church.name}
        </Text>
        <View style={styles.nearestMeta}>
          {church.verified ? (
            <>
              <Ionicons name="checkmark-circle" size={16} color={night.gold} />
              <Text style={[styles.nearestPlace, { color: night.gold }]}>{t.verified}</Text>
            </>
          ) : null}
          {place ? <Text style={styles.nearestPlace}>{place}</Text> : null}
        </View>
      </View>
    </PressableScale>
  );
}

export default function HomeScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const filters = useFilters();
  const { coords, status } = useUserLocation();
  const [radiusKm, setRadiusKm] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

  const churches = useChurchesNear(coords, radiusKm, filters);
  const list = coords ? (churches.data ?? []) : [];
  const [nearest, ...rest] = list;
  const activeFilters = countActiveFilters(filters);

  const refresh = async () => {
    setRefreshing(true);
    retryLocation();
    await churches.refetch();
    setRefreshing(false);
  };

  // Lo que se ve cuando no hay lista: sin ubicación, cargando, error o sin resultados.
  let body = null;
  if (status === 'loading' || (coords && churches.isPending)) {
    body = (
      <View style={styles.block} accessibilityLabel={t.homeLocating}>
        <Skeleton height={220} rounded={radius.xl} />
        <Skeleton height={84} />
        <Skeleton height={84} />
      </View>
    );
  } else if (!coords) {
    body = (
      <View style={[styles.message, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ArchThumb denomination={null} size={72} />
        <AppText variant="title" accessibilityRole="header" style={styles.centred}>
          {t.homeNoLocationTitle}
        </AppText>
        <AppText color="textMuted" style={styles.centred}>
          {status === 'denied' ? t.homeNoLocationDenied : t.homeNoLocationUnavailable}
        </AppText>
        {status === 'denied' ? (
          <Button title={t.openSettings} onPress={() => Linking.openSettings().catch(() => {})} />
        ) : (
          <Button title={t.retry} onPress={retryLocation} />
        )}
        <Button title={t.openMap} variant="secondary" onPress={() => router.navigate('/map')}>
          <Ionicons name="map-outline" size={18} color={colors.text} />
        </Button>
      </View>
    );
  } else if (churches.isError) {
    body = (
      <View style={[styles.message, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText color="textMuted" style={styles.centred}>
          {t.mapError}
        </AppText>
        <Button title={t.retry} onPress={() => churches.refetch()} />
      </View>
    );
  } else if (list.length === 0) {
    const wider = RADII.find((option) => option > radiusKm);
    body = (
      <View style={[styles.message, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="title" accessibilityRole="header" style={styles.centred}>
          {t.homeEmptyTitle(radiusKm)}
        </AppText>
        <AppText color="textMuted" style={styles.centred}>
          {activeFilters > 0 ? t.homeEmptyFilters : t.homeEmptyBody}
        </AppText>
        {wider ? (
          <Button title={t.homeWiden(wider)} onPress={() => setRadiusKm(wider)} />
        ) : null}
        <Button title={t.openMap} variant="secondary" onPress={() => router.navigate('/map')}>
          <Ionicons name="map-outline" size={18} color={colors.text} />
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={body ? [] : rest}
        keyExtractor={(church) => church.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR + space.l }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={night.gold}
            colors={[colors.gold]}
            progressViewOffset={insets.top}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <LinearGradient colors={[night.top, night.bottom]} style={StyleSheet.absoluteFill} />
              <View style={[styles.headerContent, { paddingTop: insets.top + space.m }]}>
                <Text style={styles.title} accessibilityRole="header">
                  {t.homeTitle}
                </Text>
                <Text style={styles.subtitle}>
                  {coords && list.length > 0
                    ? t.homeSubtitle(list.length, radiusKm)
                    : t.homeSubtitleDefault}
                </Text>

                {/* Buscar y filtrar, a mano desde la portada. */}
                <View style={styles.tools}>
                  <PressableScale
                    accessibilityLabel={t.searchPlaceholder}
                    onPress={() => router.push('/search')}
                    style={styles.search}>
                    <Ionicons name="search" size={20} color={night.textMuted} />
                    <Text style={styles.searchText} numberOfLines={1}>
                      {t.searchPlaceholder}
                    </Text>
                  </PressableScale>
                  <PressableScale
                    accessibilityLabel={
                      activeFilters > 0 ? t.filtersActive(activeFilters) : t.filters
                    }
                    onPress={() => router.push('/filters')}
                    style={styles.round}>
                    <Ionicons name="options-outline" size={22} color={night.text} />
                    {activeFilters > 0 ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText} allowFontScaling={false}>
                          {activeFilters}
                        </Text>
                      </View>
                    ) : null}
                  </PressableScale>
                </View>
              </View>
            </View>

            {coords ? (
              <View
                style={styles.radii}
                accessibilityRole="radiogroup"
                accessibilityLabel={t.homeRadiusLabel}>
                {RADII.map((option) => (
                  <Chip
                    key={option}
                    label={`${option} km`}
                    selected={option === radiusKm}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRadiusKm(option);
                    }}
                  />
                ))}
              </View>
            ) : null}

            {body}

            {!body && nearest ? (
              <View style={styles.block}>
                <Nearest church={nearest} />
                {rest.length > 0 ? (
                  <View style={styles.listHeading}>
                    <AppText variant="heading" accessibilityRole="header" style={styles.flexible}>
                      {t.homeMore}
                    </AppText>
                    <PressableScale
                      accessibilityRole="link"
                      onPress={() => router.navigate('/map')}
                      style={styles.mapLink}>
                      <Ionicons name="map-outline" size={16} color={colors.gold} />
                      <AppText variant="label" color="gold">
                        {t.openMap}
                      </AppText>
                    </PressableScale>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ChurchRow
              church={item}
              onPress={() => router.push({ pathname: '/church/[id]', params: { id: item.id } })}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexible: { flex: 1 },
  centred: { textAlign: 'center' },
  header: { overflow: 'hidden' },
  headerContent: { paddingHorizontal: space.l, paddingBottom: space.l, gap: space.xxs },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.6,
    color: night.text,
  },
  subtitle: { fontFamily: fonts.textMedium, fontSize: 15, lineHeight: 21, color: night.textMuted },
  tools: { flexDirection: 'row', gap: space.xs, marginTop: space.m },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 52,
    paddingHorizontal: space.m,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  searchText: { flex: 1, fontFamily: fonts.text, fontSize: 16, color: night.textMuted },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
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
    backgroundColor: night.gold,
  },
  badgeText: { fontFamily: fonts.textBold, fontSize: 12, color: '#16110A' },
  radii: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.m, paddingTop: space.m },
  block: { paddingHorizontal: space.m, paddingTop: space.m, gap: space.s },
  message: {
    alignItems: 'stretch',
    gap: space.s,
    margin: space.m,
    padding: space.l,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nearest: { height: 230, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'space-between' },
  nearestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.m,
  },
  nearestBadge: {
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
    borderRadius: radius.full,
    backgroundColor: night.gold,
  },
  nearestBadgeText: { fontFamily: fonts.textBold, fontSize: 13, color: '#16110A' },
  nearestDistance: { fontFamily: fonts.displayBold, fontSize: 22, color: night.text },
  nearestText: { padding: space.m, gap: space.xxs },
  tradition: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.s,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  traditionText: { fontFamily: fonts.textSemi, fontSize: 12, color: '#FFFFFF' },
  nearestName: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.4,
    color: night.text,
  },
  nearestMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  nearestPlace: { fontFamily: fonts.textMedium, fontSize: 14, color: night.textMuted },
  listHeading: { flexDirection: 'row', alignItems: 'center', marginTop: space.s },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: space.xxs, minHeight: 44 },
  row: { paddingHorizontal: space.m, marginTop: space.xs },
});
