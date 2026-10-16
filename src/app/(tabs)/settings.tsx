import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NightHeader } from '@/src/components/NightHeader';
import { AppText, Button } from '@/src/components/ui';
import { useLanguage } from '@/src/i18n/LanguageContext';
import type { Language } from '@/src/i18n/translations';
import { CONTACT_EMAIL, SUBMISSION_URL } from '@/src/lib/config';
import { radius, shadow, space, useTheme } from '@/src/theme';

const TAB_BAR = Platform.select({ ios: 50, android: 80 }) ?? 0;

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      <View
        style={[
          styles.card,
          shadow(isDark),
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const languages: { value: Language; label: string }[] = [
    { value: 'es', label: t.languageNameSpanish },
    { value: 'en', label: t.languageNameEnglish },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR + space.l }}>
      <NightHeader title={t.settingsTitle} subtitle={t.settingsSubtitle} />

      <View style={styles.content}>
        <Section title={t.settingsLanguage}>
          <AppText variant="detail" color="textMuted">
            {t.settingsLanguageHelp}
          </AppText>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {languages.map((option) => {
              const active = option.value === language;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={option.label}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setLanguage(option.value);
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: active ? colors.primary : colors.sunken,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}>
                  <AppText variant="bodyStrong" color={active ? 'onPrimary' : 'text'}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {SUBMISSION_URL ? (
          <Section title={t.settingsChurches}>
            <AppText color="textMuted">{t.addChurchHelp}</AppText>
            <Button
              title={t.addChurch}
              variant="gold"
              onPress={() => Linking.openURL(SUBMISSION_URL!).catch(() => {})}>
              <Ionicons name="add-circle-outline" size={20} color={colors.onGold} />
            </Button>
          </Section>
        ) : null}

        <Section title={t.settingsAbout}>
          <AppText>{t.aboutBody}</AppText>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AppText variant="bodyStrong">{t.dataCredits}</AppText>
          <AppText variant="detail" color="textMuted">
            {t.dataCreditsBody}
          </AppText>
          <Button
            title={t.contact}
            variant="secondary"
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}>
            <Ionicons name="mail-outline" size={18} color={colors.text} />
          </Button>
        </Section>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.m, gap: space.l },
  section: { gap: space.s },
  card: {
    padding: space.m,
    gap: space.s,
    borderRadius: radius.l,
    borderWidth: StyleSheet.hairlineWidth,
  },
  options: { flexDirection: 'row', gap: space.xs },
  option: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.m,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: space.xxs },
});
