import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChurchRow } from '@/src/components/ChurchItems';
import { AppText, PressableScale, Skeleton } from '@/src/components/ui';
import { useChurchSearch } from '@/src/features/churches/hooks/useChurchQueries';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { fonts, radius, space, useTheme } from '@/src/theme';

/** Espera a que se deje de teclear antes de consultar. */
function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { coords } = useUserLocation();
  const [text, setText] = useState('');
  const query = useDebounced(text, 280);
  const results = useChurchSearch(query, coords);
  const searching = query.trim().length >= 2;

  let empty = <AppText color="textMuted">{t.searchHint}</AppText>;
  if (searching && results.isPending) {
    empty = (
      <View style={styles.skeletons}>
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </View>
    );
  } else if (searching && results.isError) {
    empty = <AppText color="danger">{t.searchError}</AppText>;
  } else if (searching) {
    empty = <AppText color="textMuted">{t.searchEmpty(query.trim())}</AppText>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.bar, { paddingTop: insets.top + space.xs }]}>
        <View
          style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            autoFocus
            accessibilityLabel={t.searchPlaceholder}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.gold}
            value={text}
            onChangeText={setText}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.input, { color: colors.text }]}
          />
          {text.length > 0 ? (
            <PressableScale
              accessibilityLabel={t.clearFilters}
              hitSlop={10}
              onPress={() => setText('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </PressableScale>
          ) : null}
        </View>
        <PressableScale
          accessibilityLabel={t.close}
          onPress={() => router.back()}
          style={styles.close}>
          <AppText variant="bodyStrong">{t.close}</AppText>
        </PressableScale>
      </View>

      <FlatList
        data={searching ? (results.data ?? []) : []}
        keyExtractor={(church) => church.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.xl }]}
        renderItem={({ item }) => (
          <ChurchRow
            church={item}
            onPress={() => router.push({ pathname: '/church/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={<View style={styles.empty}>{empty}</View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.m,
    paddingBottom: space.s,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 52,
    paddingHorizontal: space.m,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: fonts.text, fontSize: 16, paddingVertical: space.s },
  close: { minHeight: 48, paddingHorizontal: space.xs, justifyContent: 'center' },
  list: { paddingHorizontal: space.m, gap: space.xs },
  empty: { paddingVertical: space.l, paddingHorizontal: space.xs },
  skeletons: { gap: space.xs },
});
