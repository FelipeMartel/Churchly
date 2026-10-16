import { useEffect, useState } from 'react';
import type { Region } from 'react-native-maps';
import * as Location from 'expo-location';

const CANARIAS_REGION: Region = {
  latitude: 28.2916,
  longitude: -16.6291,
  latitudeDelta: 2.8,
  longitudeDelta: 2.8,
};

type UserCoords = {
  latitude: number;
  longitude: number;
};

export type LocationErrorType = 'denied' | 'unavailable';

export function useUserLocation() {
  const [initialRegion, setInitialRegion] = useState<Region>(CANARIAS_REGION);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<LocationErrorType | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);

  useEffect(() => {
    async function loadUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocationError('denied');
          return;
        }

        const position = await Location.getCurrentPositionAsync({});

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserCoords(coords);

        setInitialRegion({
          ...coords,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        });
      } catch {
        setLocationError('unavailable');
      } finally {
        setLoadingLocation(false);
      }
    }

    loadUserLocation();
  }, []);

  return {
    initialRegion,
    loadingLocation,
    locationError,
    userCoords,
  };
}