import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { PressableScale } from '@/src/components/ui';
import { useLanguage } from '@/src/i18n/LanguageContext';
import { fonts, night, space } from '@/src/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Muestra la flecha de volver; para pantallas apiladas. */
  back?: boolean;
  children?: ReactNode;
};

/**
 * Cabecera de las pantallas que no son el mapa: azul noche con una arcada de vidriera al
 * fondo, igual en claro y en oscuro.
 */
export function NightHeader({ title, subtitle, back = false, children }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <View style={styles.header}>
      <LinearGradient colors={[night.top, night.bottom]} style={StyleSheet.absoluteFill} />
      <Svg
        style={styles.arcade}
        width={220}
        height={150}
        viewBox="0 0 220 150"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {[0, 1, 2, 3].map((index) => (
          <Path
            key={index}
            d={`M${20 + index * 52} 150 V70 C${20 + index * 52} 44 ${32 + index * 52} 28 ${42 + index * 52} 20 C${52 + index * 52} 28 ${64 + index * 52} 44 ${64 + index * 52} 70 V150 Z`}
            fill="#FFFFFF"
            opacity={0.05 + index * 0.02}
          />
        ))}
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top + space.s }]}>
        {back ? (
          <PressableScale
            accessibilityLabel={t.back}
            hitSlop={6}
            onPress={() => router.back()}
            style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={night.text} />
          </PressableScale>
        ) : null}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { overflow: 'hidden' },
  arcade: { position: 'absolute', right: -24, bottom: 0 },
  content: { paddingHorizontal: space.l, paddingBottom: space.l, gap: space.xxs },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: space.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.6,
    color: night.text,
  },
  subtitle: { fontFamily: fonts.textMedium, fontSize: 15, lineHeight: 21, color: night.textMuted },
});
