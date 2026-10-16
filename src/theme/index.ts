import { useColorScheme } from 'react-native';

/**
 * «Vidriera»: azul noche y piedra caliza como base, dorado de vela para lo importante
 * y un color de vidrio por tradición cristiana, que es el que lleva cada marcador.
 */
export type Palette = {
  background: string;
  surface: string;
  /** Superficie hundida: campos, chips sin seleccionar. */
  sunken: string;
  text: string;
  textMuted: string;
  border: string;
  /** Azul noche: la marca, botones principales. */
  primary: string;
  onPrimary: string;
  /** Dorado de vela: verificadas, guardadas, lo destacado. */
  gold: string;
  onGold: string;
  danger: string;
  /** Tinte de los paneles de cristal sobre el mapa. */
  glass: string;
  glassBorder: string;
  skeleton: string;
};

export const palettes: { light: Palette; dark: Palette } = {
  light: {
    background: '#EEF1F4',
    surface: '#FFFFFF',
    sunken: '#E3E8ED',
    text: '#0C1B2E',
    textMuted: '#52637A',
    border: '#D4DBE3',
    primary: '#12284A',
    onPrimary: '#FFFFFF',
    gold: '#B9811C',
    onGold: '#FFFFFF',
    danger: '#B3392F',
    glass: 'rgba(255,255,255,0.78)',
    glassBorder: 'rgba(255,255,255,0.9)',
    skeleton: '#DCE2E9',
  },
  dark: {
    background: '#070F1B',
    surface: '#0F1C2E',
    sunken: '#162740',
    text: '#EEF2F7',
    textMuted: '#9CAEC4',
    border: '#22344D',
    primary: '#E9B949',
    onPrimary: '#16110A',
    gold: '#E9B949',
    onGold: '#16110A',
    danger: '#F08A7E',
    glass: 'rgba(12,24,41,0.72)',
    glassBorder: 'rgba(255,255,255,0.12)',
    skeleton: '#1A2B44',
  },
};

/** Colores fijos, para lo que va sobre el azul noche de las cabeceras en ambos temas. */
export const night = {
  top: '#0A1730',
  bottom: '#1B3766',
  text: '#FFFFFF',
  textMuted: '#C4D2E6',
  gold: '#F1C563',
};

/** Vidrios: un color por tradición. Lo que no está aquí usa el gris pizarra. */
const GLASS: Record<string, string> = {
  catolica: '#B4324A',
  evangelica: '#17877F',
  anglicana: '#6A4BA3',
  ortodoxa: '#2A5FA8',
  bautista: '#2F8A52',
  pentecostal: '#D4691E',
  'asambleas de dios': '#C0468F',
  adventista: '#6E7F1F',
  luterana: '#8A5A2B',
  metodista: '#B8323B',
  reformada: '#3A7CA5',
  'testigos de jehova': '#5B6B7C',
  'santos de los ultimos dias': '#4F5D8C',
};
const GLASS_DEFAULT = '#5B6B7C';

export function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/_/g, ' ');
}

/** Color de vidrio de una denominación. */
export function glassColor(denomination: string | null | undefined): string {
  return GLASS[normalize(denomination)] ?? GLASS_DEFAULT;
}

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  text: 'Manrope_400Regular',
  textMedium: 'Manrope_500Medium',
  textSemi: 'Manrope_600SemiBold',
  textBold: 'Manrope_700Bold',
} as const;

/** Ritmo de 4 pt. */
export const space = { xxs: 4, xs: 8, s: 12, m: 16, l: 24, xl: 32, xxl: 48 } as const;

export const radius = { s: 10, m: 16, l: 22, xl: 28, full: 999 } as const;

/** Alto mínimo de cualquier elemento táctil. */
export const TOUCH = 48;

/** Sombra de las superficies elevadas, teñida de azul noche. En oscuro la marca el borde. */
export function shadow(isDark: boolean) {
  return isDark ? null : { boxShadow: '0 10px 28px rgba(12, 27, 46, 0.12)' };
}

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? palettes.dark : palettes.light, isDark };
}
