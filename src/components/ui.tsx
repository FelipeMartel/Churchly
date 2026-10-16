import { BlurView } from 'expo-blur';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { fonts, radius, space, TOUCH, useTheme, type Palette } from '@/src/theme';

const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

// ------------------------------------------------------------------------------ Texto

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'detail' | 'label';

type AppTextProps = TextProps & { variant?: Variant; color?: keyof Palette };

/** Texto con la escala tipográfica de la app: serif para nombres y títulos, sans para datos. */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return <Text style={[typography[variant], { color: colors[color] }, style]} {...rest} />;
}

export const typography = StyleSheet.create({
  display: { fontFamily: fonts.displayBold, fontSize: 32, lineHeight: 37, letterSpacing: -0.6 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fonts.text, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.textSemi, fontSize: 16, lineHeight: 24 },
  detail: { fontFamily: fonts.textMedium, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.textSemi, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
});

// ------------------------------------------------------------------------- Pulsables

type PressableScaleProps = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

/** Pressable que encoge un 3 % al apoyar el dedo. Transición CSS: corre en el hilo de UI. */
export function PressableScale({
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      pressRetentionOffset={12}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      {...rest}>
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: pressed ? 0.97 : 1 }],
            transitionProperty: 'transform',
            transitionDuration: 130,
            transitionTimingFunction: EASE_OUT,
          },
        ]}>
        {children as ReactNode}
      </Animated.View>
    </Pressable>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** 'primary': relleno. 'secondary': contorno. 'gold': acción destacada. */
  variant?: 'primary' | 'secondary' | 'gold';
  loading?: boolean;
  disabled?: boolean;
  /** Icono a la izquierda del texto. */
  children?: ReactNode;
  accessibilityHint?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = loading || disabled;
  const background =
    variant === 'primary' ? colors.primary : variant === 'gold' ? colors.gold : 'transparent';
  const ink: keyof Palette =
    variant === 'primary' ? 'onPrimary' : variant === 'gold' ? 'onGold' : 'text';

  return (
    <PressableScale
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? colors.border : background,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      {loading ? <ActivityIndicator color={colors[ink]} /> : children}
      <AppText variant="bodyStrong" color={ink}>
        {title}
      </AppText>
    </PressableScale>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Color del punto que acompaña al texto; para las tradiciones. */
  dot?: string;
};

export function Chip({ label, selected, onPress, dot }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.sunken,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

// --------------------------------------------------------------------------- Paneles

type GlassPanelProps = { children: ReactNode; style?: StyleProp<ViewStyle> };

/** Panel de cristal que flota sobre el mapa: desenfoque real más un tinte del tema. */
export function GlassPanel({ children, style }: GlassPanelProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.glass, { borderColor: colors.glassBorder }, style]}>
      <BlurView
        intensity={40}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
      {children}
    </View>
  );
}

type SkeletonProps = { height: number; width?: number | `${number}%`; rounded?: number };

/** Hueco que late mientras llega el contenido. */
export function Skeleton({ height, width = '100%', rounded = radius.m }: SkeletonProps) {
  const { colors } = useTheme();
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { height, width, borderRadius: rounded, backgroundColor: colors.skeleton },
        {
          animationName: { from: { opacity: 1 }, to: { opacity: 0.45 } },
          animationDuration: '900ms',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationTimingFunction: 'ease-in-out',
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: space.xs,
    minHeight: TOUCH + 4,
    paddingHorizontal: space.l,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
    paddingHorizontal: space.m,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  glass: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
