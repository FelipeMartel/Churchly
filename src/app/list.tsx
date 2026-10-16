import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChurchRow } from '@/src/components/ChurchItems';
import { NightHeader } from '@/src/components/NightHeader';
import { AppText, Button, Skeleton } from '@/src/components/ui';
import { useChurchesNear } from '@/src/features/churches/hooks/useChurchQueries';
import { useFilters } from '@/src/features/churches/store';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { space, useTheme } from '@/src/theme';

/** Las iglesias de la zona que enseñaba el mapa, en lista y ordenadas por distancia. */
export default function ListScreen() {
  const params = useLocalSearchParams<{ lat: string; lon: string; radius: string; mine: string }>();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const filters = useFilters();
  const radiusKm = Number(params.radius) || 5;
  const churches = useChurchesNear(
    { latitude: Number(params.lat), longitude: Number(params.lon) },
    radiusKm,
    filters,
  );

  let empty;
  if (churches.isPending) {
    empty = (
      <View style={styles.skeletons}>
        <Skeleton height={84} />
        <Skeleton height={84} />
        <Skeleton height={84} />
        <Skeleton height={84} />
      </View>
    );
  } else if (churches.isError) {
    empty = (
      <View style={styles.message}>
        <AppText color="textMuted">{t.mapError}</AppText>
        <Button title={t.retry} onPress={() => churches.refetch()} />
      </View>
    );
  } else {
    empty = (
      <View style={styles.message}>
        <AppText color="textMuted">{t.listEmpty}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={churches.data ?? []}
        keyExtractor={(church) => church.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}
        ListHeaderComponent={
          <View style={styles.header}>
            <NightHeader
              back
              title={params.mine === '1' ? t.listTitle : t.inThisArea}
              subtitle={
                params.mine === '1'
                  ? t.listSubtitleNear(radiusKm)
                  : t.churchesCount(churches.data?.length ?? 0)
              }
            />
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
        ListEmptyComponent={empty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { marginBottom: space.m },
  row: { paddingHorizontal: space.m, marginBottom: space.xs },
  skeletons: { paddingHorizontal: space.m, gap: space.xs },
  message: { paddingHorizontal: space.l, gap: space.m },
});
