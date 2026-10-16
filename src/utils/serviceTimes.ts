import type { ServiceTime } from "../features/churches/types/church.types";

export function getDayName(dayOfWeek: number, dayNames: string[]): string {
  return dayNames[dayOfWeek] ?? dayNames[0];
}

export function formatTime(time: string | null): string {
  if (!time) return "";

  const [hours = "00", minutes = "00"] = time.split(":");
  return `${hours}:${minutes}`;
}

export function formatServiceTime(service: ServiceTime): string {
  return formatTime(service.start_time);
}

export function groupServiceTimesByDay(serviceTimes: ServiceTime[], dayNames: string[]) {
  const map = new Map<number, ServiceTime[]>();

  for (const service of serviceTimes) {
    const existing = map.get(service.day_of_week) ?? [];
    existing.push(service);
    map.set(service.day_of_week, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayOfWeek, items]) => ({
      dayOfWeek,
      dayLabel: getDayName(dayOfWeek, dayNames),
      items: items.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));
}