import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Small } from "@/components/ui/typography";
import { formatDate, formatDateTime } from "@/lib/dates";
import type { Task } from "@/types/pocketbase";

interface UpcomingTasksWidgetProps {
  tasks: Task[];
}

export function UpcomingTasksWidget({ tasks }: UpcomingTasksWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming tasks</CardTitle>
        <CardDescription>Due or scheduled soon</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <Small className="text-muted-foreground">No upcoming tasks.</Small>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="type-h3 font-normal">{task.title}</p>
                  <Badge variant="secondary">{task.status}</Badge>
                </div>
                <Small className="text-muted-foreground">
                  {task.dueAt
                    ? `Due ${formatDateTime(task.dueAt)}`
                    : task.scheduledFor
                      ? `Scheduled ${formatDate(task.scheduledFor)}`
                      : "No date"}
                  {task.expand?.project ? ` · ${task.expand.project.name}` : ""}
                </Small>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/inbox"
          className="type-small mt-4 inline-block text-foreground hover:underline"
        >
          Open inbox
        </Link>
      </CardContent>
    </Card>
  );
}
