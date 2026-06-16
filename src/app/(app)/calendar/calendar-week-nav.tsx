"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getAdjacentWeekStart } from "@/lib/dates";

interface CalendarWeekNavProps {
  weekStart: Date;
  debugEnabled: boolean;
}

export function CalendarWeekNav({ weekStart, debugEnabled }: CalendarWeekNavProps) {
  const weekParam = format(weekStart, "yyyy-MM-dd");
  const prevWeek = getAdjacentWeekStart(weekStart, -1);
  const nextWeek = getAdjacentWeekStart(weekStart, 1);
  const debugQuery = debugEnabled ? "&debug=1" : "";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" render={<Link href={`/calendar?week=${prevWeek}${debugQuery}`} aria-label="Previous week" />}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" render={<Link href={`/calendar?week=${nextWeek}${debugQuery}`} aria-label="Next week" />}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" render={<Link href={`/calendar${debugEnabled ? "?debug=1" : ""}`} />}>
          Today
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Week starting {weekParam}</p>
    </div>
  );
}
