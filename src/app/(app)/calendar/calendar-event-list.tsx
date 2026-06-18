import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
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
    <Card>
      <CardContent className="pt-[var(--spacing-card)]">
        {showDeleted ? (
          <div className="mb-4">
            <Badge variant="outline">Debug: deleted visible</Badge>
          </div>
        ) : null}
        <ul className="divide-y divide-border">
          {events.map((event) => {
            const source = event.expand?.calendarSource;
            const isEventKit = source?.sourceType === "eventkit";
            const isDeleted = Boolean(event.deletedAt);

            return (
              <li
                key={event.id}
                className={`flex flex-col gap-2 py-3 first:pt-0 last:pb-0 ${
                  isDeleted ? "opacity-50" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="type-h3 font-normal">{event.title}</p>
                  {isEventKit ? <Badge variant="outline">EventKit</Badge> : null}
                  {isDeleted ? <Badge variant="destructive">Deleted</Badge> : null}
                </div>
                <Small className="text-muted-foreground">
                  {formatDateTime(event.startsAt)}
                  {event.location ? ` · ${event.location}` : ""}
                  {source?.name ? ` · ${source.name}` : ""}
                </Small>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
