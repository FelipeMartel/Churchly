import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '../i18n/LanguageContext';

type Props = {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  selectedLanguages: string[];
  selectedDenominations: string[];
  selectedCountries: string[];
  countryOptions: string[];
  onToggleLanguage: (value: string) => void;
  onToggleDenomination: (value: string) => void;
  onToggleCountry: (value: string) => void;
  onClearLanguages: () => void;
  onClearDenominations: () => void;
  onClearCountries: () => void;
  onClearFilters: () => void;
};

// Church-reported service languages: shown in their own endonym regardless
// of app language, matching how the values are stored in Supabase.
const LANGUAGES = [
  { value: 'Español', label: 'Español' },
  { value: 'English', label: 'English' },
  { value: 'Deutsch', label: 'Deutsch' },
  { value: 'Svenska', label: 'Svenska' },   // Sueco
  { value: 'Norsk', label: 'Norsk' },       // Noruego
  { value: 'Dansk', label: 'Dansk' },       // Danés
  { value: 'Suomi', label: 'Suomi' },       // Finlandés
  { value: 'Français', label: 'Français' }, // Francés
  { value: 'Italiano', label: 'Italiano' }, // Italiano
  { value: 'Nederlands', label: 'Nederlands' }, // Holandés
];

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function FloatingFilters({
  searchQuery,
  onChangeSearchQuery,
  selectedLanguages,
  selectedDenominations,
  selectedCountries,
  countryOptions,
  onToggleLanguage,
  onToggleDenomination,
  onToggleCountry,
  onClearLanguages,
  onClearDenominations,
  onClearCountries,
  onClearFilters,
}: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const animation = useSharedValue(0);

  const activeCount =
    selectedLanguages.length + selectedDenominations.length + selectedCountries.length;

  useEffect(() => {
    animation.value = withSpring(open ? 1 : 0, {
      damping: 14,
      stiffness: 140,
    });
  }, [open, animation]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [
      { translateY: interpolate(animation.value, [0, 1], [-12, 0]) },
      { scale: interpolate(animation.value, [0, 1], [0.96, 1]) },
    ],
  }));

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          placeholder={t.searchPlaceholder}
          placeholderTextColor="#888"
          accessibilityLabel={t.searchPlaceholder}
          returnKeyType="search"
        />
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={t.filtersButton(activeCount)}
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.fabText}>{t.filtersButton(activeCount)}</Text>
      </Pressable>

      {open ? (
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[styles.panel, panelStyle]}
          accessibilityViewIsModal
          accessibilityLabel={t.filtersPanelLabel}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t.filterSectionLanguage}
            </Text>
            <View style={styles.chipsRow}>
              <FilterChip
                label={t.filterAllLanguages}
                active={selectedLanguages.length === 0}
                onPress={onClearLanguages}
              />
              {LANGUAGES.map((item) => (
                <FilterChip
                  key={item.value}
                  label={item.label}
                  active={selectedLanguages.includes(item.value)}
                  onPress={() => onToggleLanguage(item.value)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t.filterSectionDenomination}
            </Text>
            <View style={styles.chipsRow}>
              <FilterChip
                label={t.filterAllDenominations}
                active={selectedDenominations.length === 0}
                onPress={onClearDenominations}
              />
              {t.denominations.map((item) => (
                <FilterChip
                  key={item.value}
                  label={item.label}
                  active={selectedDenominations.includes(item.value)}
                  onPress={() => onToggleDenomination(item.value)}
                />
              ))}
            </View>
          </View>

          {countryOptions.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t.filterSectionCountry}
              </Text>
              <View style={styles.chipsRow}>
                <FilterChip
                  label={t.filterAllCountries}
                  active={selectedCountries.length === 0}
                  onPress={onClearCountries}
                />
                {countryOptions.map((country) => (
                  <FilterChip
                    key={country}
                    label={country}
                    active={selectedCountries.includes(country)}
                    onPress={() => onToggleCountry(country)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Pressable
              onPress={onClearFilters}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel={t.clearFilters}
            >
              <Text style={styles.clearButtonText}>{t.clearFilters}</Text>
            </Pressable>

            <Pressable
              onPress={() => setOpen(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t.close}
            >
              <Text style={styles.closeButtonText}>{t.close}</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

export { toggleValue };

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    alignItems: 'flex-end',
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    height: '100%',
  },
  fab: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
  },
  chipTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  closeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
