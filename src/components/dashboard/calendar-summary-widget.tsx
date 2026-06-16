import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { H2 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>{weekLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-8">
          <div>
            <H2 className="tabular-nums">{todayEvents.length}</H2>
            <Small className="text-muted-foreground">Today</Small>
          </div>
          <div>
            <H2 className="tabular-nums">{weekEvents.length}</H2>
            <Small className="text-muted-foreground">This week</Small>
          </div>
        </div>

        {todayEvents.length === 0 ? (
          <Small className="text-muted-foreground">
            No events today. Calendar syncs via the macOS EventKit agent.
          </Small>
        ) : (
          <ul className="space-y-3">
            {todayEvents.slice(0, 3).map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="type-h3 font-normal">{event.title}</p>
                  <Small className="text-muted-foreground">
                    {formatDateTime(event.startsAt)}
                  </Small>
                </div>
                {event.isAllDay && <Badge variant="outline">All day</Badge>}
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/calendar"
          className="type-small inline-block text-foreground hover:underline"
        >
          Open calendar
        </Link>
      </CardContent>
    </Card>
  );
}
