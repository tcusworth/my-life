import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Small } from "@/components/ui/typography";
import { formatDate } from "@/lib/dates";
import type { Goal } from "@/types/pocketbase";

interface ActiveGoalsWidgetProps {
  goals: Goal[];
}

export function ActiveGoalsWidget({ goals }: ActiveGoalsWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Active goals</CardTitle>
        <CardDescription>What you are working toward</CardDescription>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <Small className="text-muted-foreground">No active goals yet.</Small>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => (
              <li key={goal.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="type-h3 font-normal">{goal.title}</p>
                  {goal.progress != null && (
                    <Badge variant="outline">{goal.progress}%</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3">
                  {goal.expand?.area && (
                    <Small className="text-muted-foreground">{goal.expand.area.name}</Small>
                  )}
                  {goal.targetDate && (
                    <Small className="text-muted-foreground">
                      Target {formatDate(goal.targetDate)}
                    </Small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
