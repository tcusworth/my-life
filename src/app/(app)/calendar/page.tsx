import { CalendarDays } from "lucide-react";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/empty-state";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getWeekRange, parseWeekStartParam } from "@/lib/dates";
import { isSyncDebugEnabled } from "@/lib/sync/debug";
import type { CalendarEvent, CalendarSource } from "@/types/pocketbase";
import { CalendarEventList } from "./calendar-event-list";
import { CalendarWeekNav } from "./calendar-week-nav";
import { WeekGrid } from "./week-grid";

type CalendarEventWithSource = CalendarEvent & {
  expand?: {
    calendarSource?: CalendarSource;
  };
};

async function getWeekEvents(weekStart: Date, includeDeleted: boolean) {
  const pb = await getAuthenticatedClient();
  if (!pb) return { events: [], weekLabel: "" };

  const { start, end, label } = getWeekRange(weekStart);
  const deletedFilter = includeDeleted
    ? ""
    : ` && (deletedAt = null || deletedAt = '')`;

  const events = await pb
    .collection("calendar_events")
    .getFullList<CalendarEventWithSource>({
      filter: `startsAt >= "${start}" && startsAt <= "${end}"${deletedFilter}`,
      sort: "startsAt",
      expand: "calendarSource",
    });

  return { events, weekLabel: label };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; debug?: string }>;
}) {
  const params = await searchParams;
  const weekStart = parseWeekStartParam(params.week);
  const debugEnabled = isSyncDebugEnabled(params.debug);
  const { events, weekLabel } = await getWeekEvents(weekStart, debugEnabled);

  return (
    <PageShell>
      <PageHeader title="Calendar" description={weekLabel} />
      <PageBody>
        <PageSection title="Week view">
          <CalendarWeekNav weekStart={weekStart} debugEnabled={debugEnabled} />
          <WeekGrid weekStart={weekStart} events={events} />
        </PageSection>

        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" />}
            title="No events this week"
            description="Events sync from your Mac via the EventKit agent."
          />
        ) : (
          <PageSection title="Events">
            <CalendarEventList events={events} showDeleted={debugEnabled} />
          </PageSection>
        )}
      </PageBody>
    </PageShell>
  );
}
