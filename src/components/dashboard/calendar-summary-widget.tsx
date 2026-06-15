import Link from "next/link";
import { CalendarDays } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/dates";
import type { CalendarEvent } from "@/types/pocketbase";

interface CalendarSummaryWidgetProps {
  todayEvents: CalendarEvent[];
  weekEvents: CalendarEvent[];
  weekLabel: string;
}

export function CalendarSummaryWidget({
  todayEvents,
  weekEvents,
  weekLabel,
}: CalendarSummaryWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary" />
          Calendar Summary
        </CardTitle>
        <CardDescription>{weekLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{todayEvents.length}</p>
            <p className="text-muted-foreground">Today</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{weekEvents.length}</p>
            <p className="text-muted-foreground">This week</p>
          </div>
        </div>

        {todayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events today. Calendar syncs via the macOS EventKit agent.
          </p>
        ) : (
          <ul className="space-y-2">
            {todayEvents.slice(0, 3).map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.startsAt)}
                  </p>
                </div>
                {event.isAllDay && <Badge variant="secondary">All day</Badge>}
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/calendar"
          className="inline-block text-xs font-medium text-primary hover:underline"
        >
          Open calendar
        </Link>
      </CardContent>
    </Card>
  );
}
