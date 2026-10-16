import { router } from 'expo-router';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchThumb } from '@/src/components/Arch';
import { ChurchRow } from '@/src/components/ChurchItems';
import { NightHeader } from '@/src/components/NightHeader';
import { AppText, Button, Skeleton } from '@/src/components/ui';
import { useChurchesByIds } from '@/src/features/churches/hooks/useChurchQueries';
import { useSavedChurches } from '@/src/features/churches/store';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { space, useTheme } from '@/src/theme';

const TAB_BAR = Platform.select({ ios: 50, android: 80 }) ?? 0;

export default function SavedScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { saved, ready } = useSavedChurches();
  const churches = useChurchesByIds(saved);

  // Se respeta el orden en que se guardaron: la más reciente arriba.
  const byId = new Map((churches.data ?? []).map((church) => [church.id, church]));
  const list = saved.flatMap((id) => byId.get(id) ?? []);

  let empty;
  if (!ready || (saved.length > 0 && churches.isPending)) {
    empty = (
      <View style={styles.skeletons}>
        <Skeleton height={84} />
        <Skeleton height={84} />
      </View>
    );
  } else if (churches.isError) {
    empty = (
      <View style={styles.empty}>
        <AppText color="textMuted" style={styles.centred}>
          {t.mapError}
        </AppText>
        <Button title={t.retry} onPress={() => churches.refetch()} />
      </View>
    );
  } else {
    empty = (
      <View style={styles.empty}>
        <ArchThumb denomination={null} size={84} />
        <AppText variant="title" accessibilityRole="header" style={styles.centred}>
          {t.savedEmptyTitle}
        </AppText>
        <AppText color="textMuted" style={styles.centred}>
          {t.savedEmptyBody}
        </AppText>
        <Button title={t.exploreMap} onPress={() => router.navigate('/map')} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={list}
        keyExtractor={(church) => church.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR + space.l }}
        ListHeaderComponent={
          <View style={styles.header}>
            <NightHeader title={t.savedTitle} subtitle={t.savedSubtitle} />
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
  empty: { alignItems: 'center', gap: space.s, padding: space.xl },
  centred: { textAlign: 'center' },
});
