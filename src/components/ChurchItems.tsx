import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ArchThumb } from '@/src/components/Arch';
import { AppText, PressableScale } from '@/src/components/ui';
import type { ChurchListItem } from '@/src/features/churches/types/church.types';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { radius, shadow, space, useTheme } from '@/src/theme';

/** «Las Palmas · Gran Canaria»: lo más concreto que se sepa de dónde está. */
export function placeOf(church: {
  city?: string | null;
  island?: string | null;
  region?: string | null;
}): string {
  const parts = [church.city, church.island ?? church.region].filter(
    (part): part is string => Boolean(part),
  );
  return [...new Set(parts)].join(' · ');
}

export function useDistanceLabel() {
  const { t } = useLanguage();
  return (km: number | undefined) => {
    if (km == null) return null;
    return km < 1 ? t.distanceM(Math.max(50, Math.round((km * 1000) / 50) * 50)) : t.distanceKm(km);
  };
}

/** Línea de datos bajo el nombre: tradición, y si está verificada. */
function Meta({ church }: { church: ChurchListItem }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const kind = church.category !== 'iglesia' ? `${t.categories[church.category]} · ` : '';
  return (
    <View style={styles.meta}>
      <AppText variant="detail" color="textMuted" numberOfLines={1} style={styles.flexible}>
        {kind}
        {church.denomination}
      </AppText>
      {church.verified ? (
        <View style={styles.verified}>
          <Ionicons name="checkmark-circle" size={15} color={colors.gold} />
          <AppText variant="label" color="gold">
            {t.verified}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

type ItemProps = { church: ChurchListItem; onPress: () => void };

/** Fila de una lista vertical. */
export function ChurchRow({ church, onPress }: ItemProps) {
  const { colors } = useTheme();
  const distance = useDistanceLabel()(church.distance_km);
  const place = placeOf(church);

  return (
    <PressableScale
      accessibilityLabel={[church.name, church.denomination, place, distance]
        .filter(Boolean)
        .join('. ')}
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ArchThumb denomination={church.denomination} />
      <View style={styles.texts}>
        <AppText variant="heading" numberOfLines={2}>
          {church.name}
        </AppText>
        <Meta church={church} />
        {place ? (
          <AppText variant="detail" color="textMuted" numberOfLines={1}>
            {place}
          </AppText>
        ) : null}
      </View>
      {distance ? (
        <AppText variant="label" color="text" style={styles.distance}>
          {distance}
        </AppText>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </PressableScale>
  );
}

export const CARD_WIDTH = 276;

/** Tarjeta del carrusel que flota sobre el mapa. */
export function ChurchCard({ church, onPress, selected }: ItemProps & { selected: boolean }) {
  const { colors, isDark } = useTheme();
  const distance = useDistanceLabel()(church.distance_km);
  const place = placeOf(church);

  return (
    <PressableScale
      accessibilityLabel={[church.name, church.denomination, place, distance]
        .filter(Boolean)
        .join('. ')}
      onPress={onPress}
      style={[
        styles.card,
        shadow(isDark),
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.gold : colors.border,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
        },
      ]}>
      <ArchThumb denomination={church.denomination} size={52} />
      <View style={styles.texts}>
        <AppText variant="heading" numberOfLines={1}>
          {church.name}
        </AppText>
        <Meta church={church} />
        <AppText variant="detail" color="textMuted" numberOfLines={1}>
          {[distance, place].filter(Boolean).join(' · ')}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    padding: space.s,
    borderRadius: radius.l,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    padding: space.s,
    borderRadius: radius.l,
  },
  texts: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  flexible: { flexShrink: 1 },
  distance: { alignSelf: 'flex-start', marginTop: 2 },
});
