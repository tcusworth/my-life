import { addDays, format, startOfWeek } from "date-fns";
import { CalendarDays } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getCurrentWeekRange, formatDateTime } from "@/lib/dates";
import type { CalendarEvent } from "@/types/pocketbase";

async function getWeekEvents() {
  const pb = await getAuthenticatedClient();
  if (!pb) return { events: [], weekLabel: "" };

  const { start, end, label } = getCurrentWeekRange();

  const events = await pb.collection("calendar_events").getFullList<CalendarEvent>({
    filter: `startsAt >= "${start}" && startsAt <= "${end}" && (deletedAt = null || deletedAt = '')`,
    sort: "startsAt",
  });

  return { events, weekLabel: label };
}

function WeekGrid() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div
          key={day.toISOString()}
          className="rounded-lg border bg-muted/30 p-3 text-center"
        >
          <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{format(day, "d")}</p>
        </div>
      ))}
    </div>
  );
}

export default async function CalendarPage() {
  const { events, weekLabel } = await getWeekEvents();

  return (
    <>
      <AppHeader title="Calendar" description={weekLabel} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <WeekGrid />

        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title="No events this week"
            description="Calendar events sync from your Mac via the EventKit agent. No CalDAV integration is used."
          />
        ) : (
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold">Events</h2>
            <ul className="mt-4 divide-y">
              {events.map((event) => (
                <li key={event.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.startsAt)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
