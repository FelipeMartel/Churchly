import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/src/i18n/LanguageContext';
import type { Language } from '@/src/i18n/translations';

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();

  const options: { value: Language; label: string }[] = [
    { value: 'es', label: t.languageNameSpanish },
    { value: 'en', label: t.languageNameEnglish },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {t.settingsTitle}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label} accessibilityRole="header">
            {t.settingsLanguageLabel}
          </Text>
          <Text style={styles.helper}>{t.settingsLanguageHelper}</Text>

          <View style={styles.options} accessibilityRole="radiogroup">
            {options.map((option) => {
              const active = option.value === language;
              return (
                <Pressable
                  key={option.value}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => setLanguage(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active, checked: active }}
                  accessibilityLabel={option.label}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={18} color="#8FB8FF" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#121821',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1E2632',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helper: {
    fontSize: 14,
    color: '#9FB0C3',
  },
  options: {
    gap: 10,
    marginTop: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#182232',
    borderWidth: 1,
    borderColor: '#1E2632',
  },
  optionActive: {
    borderColor: '#8FB8FF',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F7FA',
  },
  optionTextActive: {
    color: '#8FB8FF',
  },
});
