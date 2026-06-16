import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/dates";
import type { CalendarEvent, CalendarSource } from "@/types/pocketbase";

export type CalendarEventWithSource = CalendarEvent & {
  expand?: {
    calendarSource?: CalendarSource;
  };
};

interface CalendarEventListProps {
  events: CalendarEventWithSource[];
  showDeleted: boolean;
}

export function CalendarEventList({ events, showDeleted }: CalendarEventListProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Events</h2>
        {showDeleted ? (
          <Badge variant="secondary">Debug: showing deleted events</Badge>
        ) : null}
      </div>
      <ul className="mt-4 divide-y">
        {events.map((event) => {
          const source = event.expand?.calendarSource;
          const isEventKit = source?.sourceType === "eventkit";
          const isDeleted = Boolean(event.deletedAt);

          return (
            <li
              key={event.id}
              className={`flex flex-col gap-2 py-3 first:pt-0 last:pb-0 ${
                isDeleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                {isEventKit ? (
                  <Badge variant="outline" className="text-[10px]">
                    EventKit
                  </Badge>
                ) : null}
                {isDeleted ? (
                  <Badge variant="destructive" className="text-[10px]">
                    Deleted
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(event.startsAt)}
                {event.location ? ` · ${event.location}` : ""}
                {source?.name ? ` · ${source.name}` : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
