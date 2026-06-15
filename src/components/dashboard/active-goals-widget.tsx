import Link from "next/link";
import { Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/dates";
import type { Goal } from "@/types/pocketbase";

interface ActiveGoalsWidgetProps {
  goals: Goal[];
}

export function ActiveGoalsWidget({ goals }: ActiveGoalsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-primary" />
          Active Goals
        </CardTitle>
        <CardDescription>What you are working toward</CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active goals yet.</p>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => (
              <li key={goal.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{goal.title}</p>
                  {goal.progress != null && (
                    <Badge variant="secondary">{goal.progress}%</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {goal.expand?.area && <span>{goal.expand.area.name}</span>}
                  {goal.targetDate && <span>Target {formatDate(goal.targetDate)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
