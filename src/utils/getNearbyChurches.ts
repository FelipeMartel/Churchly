import { ChurchWithCoordinates } from './hasValidCoordinates';
import { getDistanceInKm } from './getDistanceInKm';

type GetNearbyChurchesParams = {
  churches: ChurchWithCoordinates[];
  userLatitude: number;
  userLongitude: number;
  maxDistanceKm: number;
};

export type NearbyChurch = ChurchWithCoordinates & {
  distanceKm: number;
};

export function getNearbyChurches({
  churches,
  userLatitude,
  userLongitude,
  maxDistanceKm,
}: GetNearbyChurchesParams): NearbyChurch[] {
  return churches
    .map((church) => {
      const distanceKm = getDistanceInKm(
        userLatitude,
        userLongitude,
        church.latitude,
        church.longitude
      );

      return {
        ...church,
        distanceKm,
      };
    })
    .filter((church) => church.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}