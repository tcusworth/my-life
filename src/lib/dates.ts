import {
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";

export function getTodayRange(timezone?: string) {
  const now = new Date();
  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
    label: format(now, "EEEE, MMMM d"),
    timezone,
  };
}

export function getWeekRange(referenceDate: Date = new Date()) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 });
  return {
    start: weekStart.toISOString(),
    end: endOfWeek(referenceDate, { weekStartsOn: 0 }).toISOString(),
    label: `Week of ${format(weekStart, "MMM d, yyyy")}`,
    weekStart,
  };
}

export function getCurrentWeekRange() {
  return getWeekRange(new Date());
}

export function parseWeekStartParam(weekParam?: string): Date {
  if (!weekParam) {
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  }

  try {
    const parsed = parseISO(weekParam);
    if (Number.isNaN(parsed.getTime())) {
      return startOfWeek(new Date(), { weekStartsOn: 0 });
    }
    return startOfWeek(parsed, { weekStartsOn: 0 });
  } catch {
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  }
}

export function getAdjacentWeekStart(weekStart: Date, direction: -1 | 1): string {
  return format(addWeeks(weekStart, direction), "yyyy-MM-dd");
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "MMM d, yyyy");
}
