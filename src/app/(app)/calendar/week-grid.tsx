import { addDays, format, isSameDay } from "date-fns";
import { Micro } from "@/components/ui/typography";
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
            className="surface-panel surface-flush min-h-28 p-3"
          >
            <div className="text-center">
              <Micro className="normal-case tracking-normal text-muted-foreground">
                {format(day, "EEE")}
              </Micro>
              <p className="type-h2 mt-1 tabular-nums">{format(day, "d")}</p>
            </div>
            <ul className="mt-2 space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className="truncate rounded bg-muted/60 px-1.5 py-0.5 type-micro normal-case tracking-normal text-foreground"
                  title={event.title}
                >
                  {event.title}
                </li>
              ))}
              {dayEvents.length > 3 ? (
                <li className="type-micro normal-case tracking-normal text-muted-foreground">
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
