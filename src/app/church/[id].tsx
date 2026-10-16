import { useEffect, useMemo, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { getChurchById } from "../../features/churches/api/getChurchById";
import type { Church } from "../../features/churches/types/church.types";
import { ServiceTimesSection } from "@/src/components/ServiceTimesSection";
import { useChurchServiceTimes } from "@/src/features/churches/hooks/useChurchServiceTimes";
import { useLanguage } from "@/src/i18n/LanguageContext";

export default function ChurchDetailScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const churchId = typeof id === "string" ? id : undefined;

  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    serviceTimes,
    isLoading: isServiceTimesLoading,
    error: serviceTimesError,
  } = useChurchServiceTimes(churchId);

  useEffect(() => {
    async function loadChurch() {
      if (!churchId) {
        setError(t.errorNoId);
        setLoading(false);
        return;
      }

      try {
        const data = await getChurchById(churchId);
        setChurch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.unknownError);
      } finally {
        setLoading(false);
      }
    }

    loadChurch();
  }, [churchId, t]);

  const locationText = useMemo(() => {
    const parts = [church?.city, church?.island, church?.country].filter(
      (part): part is string => !!part
    );
    return parts.length > 0 ? parts.join(' · ') : t.unknownLocation;
  }, [church, t]);

  const hasCoordinates =
    church?.latitude != null && church?.longitude != null;

  function openInMaps() {
    if (!hasCoordinates) return;

    const url = `https://maps.google.com/?q=${church.latitude},${church.longitude}`;
    Linking.openURL(url);
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.screen}>
          <View
            style={styles.centered}
            accessible
            accessibilityLiveRegion="polite"
            accessibilityLabel={t.churchLoading}
          >
            <ActivityIndicator size="small" />
            <Text style={styles.message}>{t.churchLoading}</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error || !church) {
    return (
          <>
        <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.screen}>
        <View
          style={styles.centered}
          accessible
          accessibilityLiveRegion="assertive"
          accessibilityLabel={`${t.churchErrorTitle}. ${error ?? t.churchNotFound}`}
        >
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={28} color="#FF8A80" />
          </View>
          <Text style={styles.errorTitle} accessibilityRole="header">
            {t.churchErrorTitle}
          </Text>
          <Text style={styles.message}>{error ?? t.churchNotFound}</Text>
        </View>
      </SafeAreaView>
      </>
    );
  }

  return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="location-outline" size={14} color="#AFC7FF" />
            <Text style={styles.heroBadgeText}>{locationText}</Text>
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {church.name}
          </Text>

          <Text style={styles.subtitle}>
            {church.denomination ?? t.denominationNotSpecified}
          </Text>

          {church.verified ? (
            <View style={styles.verifiedRow} accessible accessibilityLabel={t.verifiedChurch}>
              <Ionicons name="checkmark-circle" size={16} color="#7EE787" />
              <Text style={styles.verifiedText}>{t.verifiedChurch}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color="#C9D1D9" />
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t.sectionLocation}
            </Text>
          </View>

          <Text style={styles.primaryValue}>
            {church.address ?? t.addressNotAvailable}
          </Text>

          <Text style={styles.secondaryValue}>{locationText}</Text>

          {hasCoordinates ? (
            <Pressable
              style={styles.primaryButton}
              onPress={openInMaps}
              accessibilityRole="button"
              accessibilityLabel={t.openInMaps}
            >
              <Ionicons name="navigate-outline" size={16} color="#081120" />
              <Text style={styles.primaryButtonText}>{t.openInMaps}</Text>
            </Pressable>
          ) : null}
        </View>

        <ServiceTimesSection
          serviceTimes={serviceTimes}
          isLoading={isServiceTimesLoading}
          error={serviceTimesError ? serviceTimesError.message : null}
        />

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#C9D1D9" />
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t.sectionInfo}
            </Text>
          </View>

          <InfoRow
            icon="business-outline"
            label={t.labelDenomination}
            value={church.denomination ?? t.notSpecified}
          />

          <InfoRow
            icon="compass-outline"
            label={t.labelAddress}
            value={`${church.latitude}, ${church.longitude}`}
          />

          <InfoRow
            icon="globe-outline"
            label={t.labelWebsite}
            value={church.website ?? t.notAvailable}
          />

          <InfoRow
            icon="call-outline"
            label={t.labelPhone}
            value={church.phone ?? t.notAvailable}
          />

          <InfoRow
            icon="logo-instagram"
            label={t.labelInstagram}
            value={church.instagram ?? t.notAvailable}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color="#B7C6E0" />
      </View>

      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0B0F14",
  },
  hero: {
    backgroundColor: "#121821",
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1E2632",
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#182232",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    color: "#AFC7FF",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 15,
    color: "#B6C2CF",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  verifiedText: {
    color: "#7EE787",
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#121821",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1E2632",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  primaryValue: {
    fontSize: 16,
    lineHeight: 22,
    color: "#F5F7FA",
    fontWeight: "600",
  },
  secondaryValue: {
    fontSize: 14,
    color: "#9FB0C3",
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#8FB8FF",
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#081120",
    fontSize: 14,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#182232",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#8FA1B5",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 21,
    color: "#F5F7FA",
  },
  errorIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#1B1416",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  message: {
    marginTop: 8,
    fontSize: 15,
    color: "#B6C2CF",
    textAlign: "center",
  },
});