import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useLanguage } from '@/src/i18n/LanguageContext';
import { useTheme } from '@/src/theme';

export default function TabLayout() {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <NativeTabs
      tintColor={colors.gold}
      backgroundColor={colors.surface}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'location', selected: 'location.fill' }}
          md="near_me"
        />
        <NativeTabs.Trigger.Label>{t.tabNear}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
        <NativeTabs.Trigger.Label>{t.tabMap}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
          md="bookmark"
        />
        <NativeTabs.Trigger.Label>{t.tabSaved}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>{t.tabSettings}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
