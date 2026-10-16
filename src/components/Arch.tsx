import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { ChurchCategory } from '@/src/features/churches/types/church.types';
import { glassColor, night } from '@/src/theme';

/**
 * El arco de vidriera: la forma que identifica a Churchly. Es el marcador del mapa, la
 * miniatura de las listas y la cabecera de la ficha, siempre teñido del color de la
 * tradición de la iglesia.
 */

/** Arco apuntado sobre una caja de 24 x 30. */
const ARCH = 'M2 30 V13 C2 6 7 2 12 0 C17 2 22 6 22 13 V30 Z';

type ArchPinProps = {
  denomination: string | null;
  verified: boolean;
  selected?: boolean;
};

/** Marcador de una iglesia. Las verificadas llevan el cerco dorado. */
export function ArchPin({ denomination, verified, selected = false }: ArchPinProps) {
  const size = selected ? 1.25 : 1;
  return (
    <Svg width={30 * size} height={38 * size} viewBox="-3 -3 30 38">
      <Path
        d={ARCH}
        fill={glassColor(denomination)}
        stroke={verified ? night.gold : '#FFFFFF'}
        strokeWidth={verified ? 3 : 2}
        strokeLinejoin="round"
      />
      {/* Parteluz y travesaño: lo justo para que se lea como una ventana. */}
      <Path d="M12 6 V30 M4.5 17 H19.5" stroke="rgba(255,255,255,0.75)" strokeWidth={1.4} />
    </Svg>
  );
}

type ArchThumbProps = {
  denomination: string | null;
  size?: number;
};

/** Miniatura cuadrada para listas y tarjetas: el arco sobre su propio vidrio atenuado. */
export function ArchThumb({ denomination, size = 56 }: ArchThumbProps) {
  const color = glassColor(denomination);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.thumb, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.16 }]} />
      <Svg width={size * 0.44} height={size * 0.55} viewBox="0 0 24 30">
        <Path d={ARCH} fill={color} />
        <Path d="M12 6 V30 M4.5 17 H19.5" stroke="rgba(255,255,255,0.8)" strokeWidth={1.6} />
      </Svg>
    </View>
  );
}

type ArchHeroProps = {
  denomination: string | null;
  category: ChurchCategory;
};

/**
 * Cabecera de la ficha: una vidriera sobre el azul noche, con la luz del color de la
 * tradición. Las catedrales y los monasterios llevan tres vanos; el resto, uno.
 */
export function ArchHero({ denomination, category }: ArchHeroProps) {
  const id = useId().replace(/:/g, '');
  const color = glassColor(denomination);
  const grand = category === 'catedral' || category === 'monasterio';

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 120 100"
      preserveAspectRatio="xMidYMid slice"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id={`cielo-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={night.top} />
          <Stop offset="1" stopColor={night.bottom} />
        </LinearGradient>
        <LinearGradient id={`vidrio-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.95} />
          <Stop offset="1" stopColor={color} stopOpacity={0.35} />
        </LinearGradient>
      </Defs>
      <Rect width={120} height={100} fill={`url(#cielo-${id})`} />
      {/* Resplandor de la luz que entra por la vidriera. */}
      <Circle cx={84} cy={46} r={44} fill={color} opacity={0.14} />
      <Circle cx={84} cy={46} r={26} fill={color} opacity={0.14} />

      {grand ? (
        <>
          <Path d="M52 100 V52 C52 40 58 33 63 30 C68 33 74 40 74 52 V100 Z" fill={`url(#vidrio-${id})`} />
          <Path d="M100 100 V52 C100 40 106 33 111 30 C116 33 122 40 122 52 V100 Z" fill={`url(#vidrio-${id})`} />
        </>
      ) : null}
      <Path d="M70 100 V44 C70 28 78 18 87 13 C96 18 104 28 104 44 V100 Z" fill={`url(#vidrio-${id})`} />
      <Path
        d="M87 22 V100 M73 48 H101 M73 72 H101"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
        fill="none"
      />
      <Circle cx={87} cy={35} r={6} fill="none" stroke={night.gold} strokeWidth={1.2} opacity={0.9} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  thumb: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
