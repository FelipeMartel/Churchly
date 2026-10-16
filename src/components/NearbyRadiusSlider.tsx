import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { useLanguage } from '../i18n/LanguageContext';

type NearbyRadiusSliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export function NearbyRadiusSlider({
  value,
  min = 1,
  max = 50,
  step = 1,
  onChange,
}: NearbyRadiusSliderProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.valueText}>{value} km</Text>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#111"
          maximumTrackTintColor="#ccc"
          accessibilityLabel={t.radiusSliderLabel}
          accessibilityValue={{ min, max, now: value }}
          accessibilityUnits="km"
        />
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>{max} km</Text>
        <Text style={styles.label}>{min} km</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 12,
    top: 180,
    bottom: 120,
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slider: {
    width: 220,
    height: 40,
    transform: [{ rotate: '-90deg' }],
  },
  labels: {
    marginTop: 12,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: '#444',
  },
});