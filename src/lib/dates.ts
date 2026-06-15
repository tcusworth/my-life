import {
  endOfDay,
  endOfWeek,
  format,
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

export function getCurrentWeekRange() {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }).toISOString(),
    end: endOfWeek(now, { weekStartsOn: 0 }).toISOString(),
    label: `Week of ${format(startOfWeek(now, { weekStartsOn: 0 }), "MMM d")}`,
  };
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "MMM d, yyyy h:mm a");
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "MMM d, yyyy");
}
