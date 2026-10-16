import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { ServiceTime } from "../features/churches/types/church.types";
import { formatServiceTime, groupServiceTimesByDay } from "../utils/serviceTimes";
import { useLanguage } from "../i18n/LanguageContext";

type Props = {
  serviceTimes: ServiceTime[];
  isLoading: boolean;
  error: string | null;
};

export function ServiceTimesSection({
  serviceTimes,
  isLoading,
  error,
}: Props) {
  const { t } = useLanguage();
  const grouped = groupServiceTimesByDay(serviceTimes, t.dayNames);

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {t.scheduleTitle}
      </Text>

      {isLoading ? (
        <View
          style={styles.center}
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={t.scheduleLoading}
        >
          <ActivityIndicator />
          <Text style={styles.helper}>{t.scheduleLoading}</Text>
        </View>
      ) : error ? (
        <Text style={styles.error} accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : grouped.length === 0 ? (
        <Text style={styles.helper}>{t.noSchedules}</Text>
      ) : (
        grouped.map((group) => (
          <View key={group.dayOfWeek} style={styles.dayBlock}>
            <Text style={styles.dayTitle} accessibilityRole="header">
              {group.dayLabel}
            </Text>

            {group.items.map((item) => {
              const time = formatServiceTime(item) || t.scheduleTBD;
              const parts = [time];
              if (item.language) parts.push(t.serviceLanguageLabel(item.language));
              if (item.notes) parts.push(item.notes);

              return (
                <View
                  key={item.id}
                  style={styles.serviceRow}
                  accessible
                  accessibilityLabel={parts.join('. ')}
                >
                  <Text style={styles.time}>{time}</Text>

                  {item.language ? (
                    <Text style={styles.meta}>{t.serviceLanguageLabel(item.language)}</Text>
                  ) : null}

                  {item.notes ? (
                    <Text style={styles.meta}>{item.notes}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  helper: {
    fontSize: 14,
    color: "#B3B3B3",
  },
  error: {
    fontSize: 14,
    color: "#FF8A80",
  },
  dayBlock: {
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2A2A2A",
    gap: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  serviceRow: {
    gap: 4,
    paddingVertical: 4,
  },
  time: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  meta: {
    fontSize: 13,
    color: "#9E9E9E",
  },
});