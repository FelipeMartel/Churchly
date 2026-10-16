import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Chip, PressableScale } from '@/src/components/ui';
import {
  countActiveFilters,
  NO_FILTERS,
  setFilters,
  useFilters,
} from '@/src/features/churches/store';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { DENOMINATIONS, SERVICE_LANGUAGES } from '@/src/i18n/translations';
import { glassColor, radius, space, useTheme } from '@/src/theme';

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Los filtros se editan en un borrador y solo se aplican al mapa al confirmar. */
export default function FiltersScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const applied = useFilters();
  const [draft, setDraft] = useState(applied);

  const change = (next: typeof draft) => {
    Haptics.selectionAsync();
    setDraft(next);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.bar, { paddingTop: insets.top + space.s, borderBottomColor: colors.border }]}>
        <AppText variant="title" accessibilityRole="header" style={styles.flexible}>
          {t.filtersTitle}
        </AppText>
        <PressableScale
          accessibilityLabel={t.close}
          hitSlop={8}
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={22} color={colors.text} />
        </PressableScale>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.flexible}>
            <AppText variant="bodyStrong">{t.filterVerified}</AppText>
            <AppText variant="detail" color="textMuted">
              {t.filterVerifiedHelp}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t.filterVerified}
            value={draft.onlyVerified}
            onValueChange={(onlyVerified) => change({ ...draft, onlyVerified })}
            trackColor={{ true: colors.gold, false: colors.border }}
          />
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {t.filterDenomination}
          </AppText>
          <View style={styles.chips}>
            {DENOMINATIONS.map((denomination) => (
              <Chip
                key={denomination}
                label={denomination}
                dot={glassColor(denomination)}
                selected={draft.denominations.includes(denomination)}
                onPress={() =>
                  change({ ...draft, denominations: toggle(draft.denominations, denomination) })
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="heading" accessibilityRole="header">
            {t.filterLanguage}
          </AppText>
          <View style={styles.chips}>
            {SERVICE_LANGUAGES.map((language) => (
              <Chip
                key={language}
                label={language}
                selected={draft.languages.includes(language)}
                onPress={() => change({ ...draft, languages: toggle(draft.languages, language) })}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + space.s,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}>
        <View style={styles.flexible}>
          <Button
            title={t.clearFilters}
            variant="secondary"
            disabled={countActiveFilters(draft) === 0}
            onPress={() => change(NO_FILTERS)}
          />
        </View>
        <View style={styles.flexible}>
          <Button
            title={t.showResults}
            onPress={() => {
              setFilters(draft);
              router.back();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexible: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.l,
    paddingBottom: space.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: space.l, gap: space.l },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    padding: space.m,
    borderRadius: radius.l,
    borderWidth: StyleSheet.hairlineWidth,
  },
  section: { gap: space.s },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  footer: {
    flexDirection: 'row',
    gap: space.s,
    paddingHorizontal: space.l,
    paddingTop: space.s,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
