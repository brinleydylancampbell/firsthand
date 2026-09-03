/** Fills the last N days so a chart has one bar per day, zeros included. */
export function dailySeries(rows: Array<{ day: string; count: number }>, days = 14): Array<{ day: string; count: number }> {
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(now - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return { day, count: byDay.get(day) ?? 0 };
  });
}

export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}
