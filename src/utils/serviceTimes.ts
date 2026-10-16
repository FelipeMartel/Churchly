import type { ServiceTime } from '../features/churches/types/church.types';

/** "10:30" a partir de "10:30:00". */
export function formatTime(time: string | null): string {
  if (!time) return '';
  const [hours = '00', minutes = '00'] = time.split(':');
  return `${hours}:${minutes}`;
}

export function groupServiceTimesByDay(serviceTimes: ServiceTime[], dayNames: string[]) {
  const byDay = new Map<number, ServiceTime[]>();
  for (const service of serviceTimes) {
    byDay.set(service.day_of_week, [...(byDay.get(service.day_of_week) ?? []), service]);
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayOfWeek, items]) => ({
      dayOfWeek,
      dayLabel: dayNames[dayOfWeek] ?? '',
      items: [...items].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));
}

export type NextService = {
  service: ServiceTime;
  /** Días que faltan: 0 es hoy, 1 mañana… */
  daysAway: number;
};

/**
 * El próximo culto a partir de `now`. Uno de hoy cuenta mientras no haya pasado más de
 * una hora desde que empezó: quien llega tarde todavía quiere verlo.
 */
export function getNextService(serviceTimes: ServiceTime[], now: Date): NextService | null {
  const today = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let best: (NextService & { minutesAway: number }) | null = null;

  for (const service of serviceTimes) {
    const [hours = '0', minutes = '0'] = service.start_time.split(':');
    const startsAt = Number(hours) * 60 + Number(minutes);
    let daysAway = (service.day_of_week - today + 7) % 7;
    if (daysAway === 0 && startsAt + 60 < minutesNow) daysAway = 7;
    const minutesAway = daysAway * 24 * 60 + startsAt - minutesNow;
    if (!best || minutesAway < best.minutesAway) best = { service, daysAway, minutesAway };
  }
  return best ? { service: best.service, daysAway: best.daysAway } : null;
}
