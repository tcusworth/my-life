import { addDays, format, isSameDay } from "date-fns";
import type { CalendarEvent, CalendarSource } from "@/types/pocketbase";

interface WeekGridProps {
  weekStart: Date;
  events: Array<
    CalendarEvent & {
      expand?: {
        calendarSource?: CalendarSource;
      };
    }
  >;
}

export function WeekGrid({ weekStart, events }: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.startsAt), day)
        );

        return (
          <div
            key={day.toISOString()}
            className="min-h-28 rounded-lg border bg-muted/30 p-3"
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{format(day, "d")}</p>
            </div>
            <ul className="mt-2 space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className="truncate rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium"
                  title={event.title}
                >
                  {event.title}
                </li>
              ))}
              {dayEvents.length > 3 ? (
                <li className="text-[10px] text-muted-foreground">
                  +{dayEvents.length - 3} more
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
