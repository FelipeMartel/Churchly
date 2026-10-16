import { Church } from '../features/churches/types/church.types';

export type ChurchWithCoordinates = Church & {
  latitude: number;
  longitude: number;
};

export function hasValidCoordinates(
  church: Church
): church is ChurchWithCoordinates {
  return church.latitude !== null && church.longitude !== null;
}