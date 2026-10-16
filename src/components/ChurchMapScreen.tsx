import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

import { useChurches } from '../features/churches/hooks/useChurches';
import type { Church } from '../features/churches/types/church.types';
import { useUserLocation } from '../hooks/useUserLocation';
import { hasValidCoordinates } from '../utils/hasValidCoordinates';
import { getNearbyChurches } from '../utils/getNearbyChurches';
import { ChurchesMarkers } from './ChurchesMarkers';
import { NearbyRadiusSlider } from './NearbyRadiusSlider';
import { FloatingFilters, toggleValue } from './FloatingFilters';
import { useLanguage } from '../i18n/LanguageContext';

function normalizeValue(value: string | null | undefined) {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function churchMatchesFilters(
  church: Church,
  {
    languages,
    denominations,
    countries,
    search,
  }: {
    languages: string[];
    denominations: string[];
    countries: string[];
    search: string;
  }
) {
  const matchesLanguages =
    languages.length === 0 ||
    (church.languages ?? []).some((item) =>
      languages.some((selected) => normalizeValue(item) === normalizeValue(selected))
    );

  const matchesDenomination =
    denominations.length === 0 ||
    denominations.some((selected) => normalizeValue(church.denomination) === normalizeValue(selected));

  const matchesCountry =
    countries.length === 0 ||
    countries.some((selected) => normalizeValue(church.country) === normalizeValue(selected));

  const normalizedSearch = normalizeValue(search);
  const matchesSearch =
    !normalizedSearch ||
    [church.name, church.city, church.country, church.island, church.address].some((field) =>
      normalizeValue(field).includes(normalizedSearch)
    );

  return matchesLanguages && matchesDenomination && matchesCountry && matchesSearch;
}

export default function ChurchMapScreen() {
  const { t } = useLanguage();
  const [radiusKm, setRadiusKm] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedDenominations, setSelectedDenominations] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const {
    churches,
    loading: loadingChurches,
    error: churchesError,
  } = useChurches();

  const {
    initialRegion,
    loadingLocation,
    locationError,
    userCoords,
  } = useUserLocation();

  const churchesWithCoordinates = useMemo(() => {
    return churches.filter(hasValidCoordinates);
  }, [churches]);

  const countryOptions = useMemo(() => {
    const values = new Set<string>();
    for (const church of churches) {
      if (church.country) values.add(church.country);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [churches]);

  const filteredChurches = useMemo(() => {
    return churchesWithCoordinates.filter((church) =>
      churchMatchesFilters(church, {
        languages: selectedLanguages,
        denominations: selectedDenominations,
        countries: selectedCountries,
        search: searchQuery,
      })
    );
  }, [churchesWithCoordinates, selectedLanguages, selectedDenominations, selectedCountries, searchQuery]);

  const nearbyChurches = useMemo(() => {
    if (!userCoords) {
      return filteredChurches;
    }

    return getNearbyChurches({
      churches: filteredChurches,
      userLatitude: userCoords.latitude,
      userLongitude: userCoords.longitude,
      maxDistanceKm: radiusKm,
    });
  }, [filteredChurches, userCoords, radiusKm]);

  if (loadingLocation || loadingChurches) {
    return (
      <View
        style={styles.centered}
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={t.mapLoading}
      >
        <ActivityIndicator size="large" />
        <Text style={styles.message}>{t.mapLoading}</Text>
      </View>
    );
  }

  if (churchesError) {
    return (
      <View
        style={styles.centered}
        accessible
        accessibilityLiveRegion="assertive"
        accessibilityLabel={`${t.mapErrorTitle}. ${churchesError}`}
      >
        <Text style={styles.errorTitle} accessibilityRole="header">
          {t.mapErrorTitle}
        </Text>
        <Text style={styles.message}>{churchesError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        accessibilityLabel={t.mapAccessibilityLabel}
      >
        <ChurchesMarkers churches={nearbyChurches} />
      </MapView>

      <FloatingFilters
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        selectedLanguages={selectedLanguages}
        selectedDenominations={selectedDenominations}
        selectedCountries={selectedCountries}
        countryOptions={countryOptions}
        onToggleLanguage={(value) => setSelectedLanguages((prev) => toggleValue(prev, value))}
        onToggleDenomination={(value) =>
          setSelectedDenominations((prev) => toggleValue(prev, value))
        }
        onToggleCountry={(value) => setSelectedCountries((prev) => toggleValue(prev, value))}
        onClearLanguages={() => setSelectedLanguages([])}
        onClearDenominations={() => setSelectedDenominations([])}
        onClearCountries={() => setSelectedCountries([])}
        onClearFilters={() => {
          setSelectedLanguages([]);
          setSelectedDenominations([]);
          setSelectedCountries([]);
          setSearchQuery('');
        }}
      />

      <NearbyRadiusSlider value={radiusKm} onChange={setRadiusKm} />

      <View
        style={styles.counter}
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={t.counterText(radiusKm, nearbyChurches.length)}
      >
        <Text style={styles.counterText}>
          {t.counterText(radiusKm, nearbyChurches.length)}
        </Text>
      </View>

      {locationError ? (
        <View
          style={styles.banner}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            locationError === 'denied' ? t.locationDenied : t.locationUnavailable
          }
        >
          <Text style={styles.bannerText}>
            {locationError === 'denied' ? t.locationDenied : t.locationUnavailable}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#111',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  banner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 12,
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  counter: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  counterText: {
    textAlign: 'center',
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
});