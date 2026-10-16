import { View, Text, StyleSheet } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { router } from 'expo-router';

import { ChurchWithCoordinates } from '../utils/hasValidCoordinates';
import { useLanguage } from '../i18n/LanguageContext';

type ChurchesMarkersProps = {
  churches: ChurchWithCoordinates[];
};

export function ChurchesMarkers({ churches }: ChurchesMarkersProps) {
  const { t } = useLanguage();

  return (
    <>
      {churches.map((church) => {
        const name = church.name || t.churchNoName;
        const address = church.address || t.addressUnavailable;
        const locationText = [church.city, church.island, church.country]
          .filter(Boolean)
          .join(' · ') || t.unknownLocation;

        return (
        <Marker
          key={String(church.id)}
          coordinate={{
            latitude: church.latitude,
            longitude: church.longitude,
          }}
          title={name}
          description={address}
          accessibilityLabel={`${name}, ${address}`}
        >
          <Callout
            onPress={() => {
              router.push({
                pathname: '/church/[id]' as const,
                params: { id: String(church.id) },
              });
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${address}. ${t.viewDetails}`}
          >
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{name}</Text>

              <Text style={styles.calloutText}>{address}</Text>

              <Text style={styles.calloutText}>{locationText}</Text>

              <Text style={styles.calloutLink}>{t.viewDetails}</Text>
            </View>
          </Callout>
        </Marker>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  callout: {
    width: 220,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  calloutLink: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
});