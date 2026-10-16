import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Linking, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArchHero } from '@/src/components/Arch';
import { placeOf } from '@/src/components/ChurchItems';
import { AppText, Button, PressableScale, Skeleton } from '@/src/components/ui';
import { useChurch, useChurchServiceTimes } from '@/src/features/churches/hooks/useChurchQueries';
import { showOnMap, toggleSaved, useSavedChurches } from '@/src/features/churches/store';
import type { Church } from '@/src/features/churches/types/church.types';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { CONTACT_EMAIL } from '@/src/lib/config';
import { fonts, glassColor, night, radius, shadow, space, useTheme } from '@/src/theme';
import { formatTime, getNextService, groupServiceTimesByDay } from '@/src/utils/serviceTimes';

type IconName = ComponentProps<typeof Ionicons>['name'];

function openDirections(church: Church) {
  const point = `${church.latitude},${church.longitude}`;
  const label = encodeURIComponent(church.name);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${point}&q=${label}`
      : `https://www.google.com/maps/dir/?api=1&destination=${point}`;
  Linking.openURL(url).catch(() => {});
}

function instagramUrl(handle: string) {
  return handle.startsWith('http') ? handle : `https://instagram.com/${handle.replace(/^@/, '')}`;
}

type ActionProps = { icon: IconName; label: string; onPress: () => void; active?: boolean };

/** Acción redonda bajo la cabecera: llegar, llamar, guardar… */
function Action({ icon, label, onPress, active = false }: ActionProps) {
  const { colors } = useTheme();
  return (
    <PressableScale accessibilityLabel={label} onPress={onPress} style={styles.action}>
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor: active ? colors.gold : colors.sunken,
            borderColor: active ? colors.gold : colors.border,
          },
        ]}>
        <Ionicons name={icon} size={22} color={active ? colors.onGold : colors.text} />
      </View>
      <AppText variant="label" color={active ? 'gold' : 'text'} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export default function ChurchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const church = useChurch(id);
  const serviceTimes = useChurchServiceTimes(id);
  const { saved } = useSavedChurches();
  // El instante se fija al abrir la ficha: el «próximo culto» no cambia mientras se lee.
  const [now] = useState(() => new Date());

  const card = [
    styles.card,
    shadow(isDark),
    { backgroundColor: colors.surface, borderColor: colors.border },
  ];

  // Va dentro de la cabecera, encima de la ilustración.
  const backButton = (
    <View style={[styles.backAnchor, { top: insets.top + space.xs }]}>
      <PressableScale
        accessibilityLabel={t.back}
        hitSlop={6}
        onPress={() => router.back()}
        style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={night.text} />
      </PressableScale>
    </View>
  );

  if (church.isPending) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.hero}>
          <LinearGradient colors={[night.top, night.bottom]} style={StyleSheet.absoluteFill} />
          {backButton}
        </View>
        <View style={styles.body} accessibilityLabel={t.churchLoading}>
          <Skeleton height={86} />
          <Skeleton height={120} />
          <Skeleton height={160} />
        </View>
      </View>
    );
  }

  if (church.isError || !church.data) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.hero}>
          <LinearGradient colors={[night.top, night.bottom]} style={StyleSheet.absoluteFill} />
          {backButton}
        </View>
        <View style={styles.body}>
          <AppText variant="title" accessibilityRole="header">
            {church.isError ? t.churchError : t.churchNotFound}
          </AppText>
          {church.isError ? <Button title={t.retry} onPress={() => church.refetch()} /> : null}
        </View>
      </View>
    );
  }

  const data = church.data;
  const place = placeOf(data);
  const isSaved = saved.includes(data.id);
  const hasCoords = data.latitude != null && data.longitude != null;
  const times = serviceTimes.data ?? [];
  const next = getNextService(times, now);
  const days = groupServiceTimesByDay(times, t.dayNames);
  const kind = data.category !== 'iglesia' ? `${t.categories[data.category]} · ` : '';

  const share = () => {
    const where = hasCoords ? `https://maps.google.com/?q=${data.latitude},${data.longitude}` : '';
    Share.share({ message: `${t.shareMessage(data.name, place)} ${where}`.trim() }).catch(() => {});
  };

  const suggestEdit = () => {
    const subject = encodeURIComponent(t.suggestEditSubject(data.name));
    const body = encodeURIComponent(`\n\n—\n${data.name}\nid: ${data.id}`);
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {});
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xl }}>
        <View style={styles.hero}>
          <ArchHero denomination={data.denomination} category={data.category} />
          <LinearGradient
            colors={['rgba(10,23,48,0)', 'rgba(10,23,48,0.86)']}
            locations={[0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroText}>
            <View style={[styles.tradition, { backgroundColor: glassColor(data.denomination) }]}>
              <Text style={styles.traditionText}>
                {kind}
                {data.denomination}
              </Text>
            </View>
            <Text style={styles.name} accessibilityRole="header">
              {data.name}
            </Text>
            {place ? <Text style={styles.place}>{place}</Text> : null}
          </View>
          {backButton}
        </View>

        <View style={styles.body}>
          {/* Verificada o no: se dice siempre, y qué significa. */}
          <View
            style={[
              styles.trust,
              {
                backgroundColor: colors.surface,
                borderColor: data.verified ? colors.gold : colors.border,
              },
            ]}>
            <Ionicons
              name={data.verified ? 'checkmark-circle' : 'information-circle-outline'}
              size={24}
              color={data.verified ? colors.gold : colors.textMuted}
            />
            <View style={styles.flexible}>
              <AppText variant="bodyStrong" color={data.verified ? 'gold' : 'text'}>
                {data.verified ? t.verifiedBadge : t.osmBadge}
              </AppText>
              <AppText variant="detail" color="textMuted">
                {data.verified ? t.verifiedHelp : t.osmHelp}
              </AppText>
            </View>
          </View>

          <View style={styles.actions}>
            {hasCoords ? (
              <Action icon="navigate" label={t.directions} onPress={() => openDirections(data)} />
            ) : null}
            {data.phone ? (
              <Action
                icon="call"
                label={t.call}
                onPress={() => Linking.openURL(`tel:${data.phone}`).catch(() => {})}
              />
            ) : null}
            <Action
              icon={isSaved ? 'bookmark' : 'bookmark-outline'}
              label={isSaved ? t.saved : t.save}
              active={isSaved}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSaved(data.id);
              }}
            />
            <Action icon="share-outline" label={t.share} onPress={share} />
          </View>

          {/* Próximo culto, destacado sobre el azul noche. */}
          {next ? (
            <View style={styles.next}>
              <LinearGradient colors={[night.bottom, night.top]} style={StyleSheet.absoluteFill} />
              <Text style={styles.nextLabel}>{t.nextService}</Text>
              <Text style={styles.nextTime}>
                {next.daysAway === 0
                  ? t.today
                  : next.daysAway === 1
                    ? t.tomorrow
                    : t.dayNames[next.service.day_of_week]}
                {' · '}
                {formatTime(next.service.start_time)}
              </Text>
              {next.service.language || next.service.notes ? (
                <Text style={styles.nextNote}>
                  {[
                    next.service.language ? t.serviceLanguage(next.service.language) : null,
                    next.service.notes,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={card}>
            <AppText variant="heading" accessibilityRole="header">
              {t.scheduleTitle}
            </AppText>
            {serviceTimes.isPending ? (
              <Skeleton height={72} />
            ) : days.length === 0 ? (
              <AppText color="textMuted">
                {data.source === 'osm' ? t.noSchedulesOsm : t.noSchedules}
              </AppText>
            ) : (
              days.map((day) => (
                <View key={day.dayOfWeek} style={[styles.day, { borderTopColor: colors.border }]}>
                  <AppText variant="bodyStrong" style={styles.dayName}>
                    {day.dayLabel}
                  </AppText>
                  <View style={styles.flexible}>
                    {day.items.map((service) => (
                      <AppText key={service.id}>
                        {formatTime(service.start_time)}
                        {service.language ? (
                          <AppText color="textMuted"> {t.serviceLanguage(service.language)}</AppText>
                        ) : null}
                        {service.notes ? (
                          <AppText color="textMuted"> · {service.notes}</AppText>
                        ) : null}
                      </AppText>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>

          {data.description ? (
            <View style={card}>
              <AppText variant="heading" accessibilityRole="header">
                {t.aboutTitle}
              </AppText>
              <AppText>{data.description}</AppText>
            </View>
          ) : null}

          {data.languages.length > 0 ? (
            <View style={card}>
              <AppText variant="heading" accessibilityRole="header">
                {t.languagesTitle}
              </AppText>
              <View style={styles.tags}>
                {data.languages.map((language) => (
                  <View key={language} style={[styles.tag, { backgroundColor: colors.sunken }]}>
                    <AppText variant="label">{language}</AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={card}>
            <AppText variant="heading" accessibilityRole="header">
              {t.whereTitle}
            </AppText>
            <AppText>{data.address ?? t.addressUnknown}</AppText>
            {place ? <AppText color="textMuted">{place}</AppText> : null}
            {hasCoords ? (
              <Button
                title={t.seeOnMap}
                variant="secondary"
                onPress={() => {
                  showOnMap({ id: data.id, latitude: data.latitude!, longitude: data.longitude! });
                  router.dismissTo('/map');
                }}>
                <Ionicons name="map-outline" size={18} color={colors.text} />
              </Button>
            ) : null}
            {data.website ? (
              <Button
                title={t.website}
                variant="secondary"
                onPress={() => Linking.openURL(data.website!).catch(() => {})}>
                <Ionicons name="globe-outline" size={18} color={colors.text} />
              </Button>
            ) : null}
            {data.instagram ? (
              <Button
                title={t.instagram}
                variant="secondary"
                onPress={() => Linking.openURL(instagramUrl(data.instagram!)).catch(() => {})}>
                <Ionicons name="logo-instagram" size={18} color={colors.text} />
              </Button>
            ) : null}
          </View>

          <PressableScale accessibilityRole="link" onPress={suggestEdit} style={styles.suggest}>
            <AppText variant="detail" color="textMuted" style={styles.underlined}>
              {t.suggestEdit}
            </AppText>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexible: { flex: 1 },
  hero: { height: 300, justifyContent: 'flex-end', overflow: 'hidden' },
  heroText: { padding: space.l, gap: space.xs },
  tradition: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
    borderRadius: radius.full,
  },
  traditionText: { fontFamily: fonts.textSemi, fontSize: 13, color: '#FFFFFF' },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.6,
    color: night.text,
  },
  place: { fontFamily: fonts.textMedium, fontSize: 16, color: night.textMuted },
  backAnchor: { position: 'absolute', left: space.m },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,15,27,0.5)',
  },
  body: { padding: space.m, gap: space.m },
  trust: {
    flexDirection: 'row',
    gap: space.s,
    padding: space.m,
    borderRadius: radius.l,
    borderWidth: 1,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', gap: space.xxs, minWidth: 72 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  next: { padding: space.l, gap: 2, borderRadius: radius.l, overflow: 'hidden' },
  nextLabel: { fontFamily: fonts.textSemi, fontSize: 13, color: night.gold },
  nextTime: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    color: night.text,
  },
  nextNote: { fontFamily: fonts.textMedium, fontSize: 14, color: night.textMuted },
  card: {
    padding: space.m,
    gap: space.s,
    borderRadius: radius.l,
    borderWidth: StyleSheet.hairlineWidth,
  },
  day: {
    flexDirection: 'row',
    gap: space.s,
    paddingTop: space.s,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dayName: { width: 104 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  tag: { paddingHorizontal: space.s, paddingVertical: space.xxs + 2, borderRadius: radius.full },
  suggest: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  underlined: { textDecorationLine: 'underline' },
});
