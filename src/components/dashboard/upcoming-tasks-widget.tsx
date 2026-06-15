import Link from "next/link";
import { ListTodo } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/dates";
import type { Task } from "@/types/pocketbase";

interface UpcomingTasksWidgetProps {
  tasks: Task[];
}

export function UpcomingTasksWidget({ tasks }: UpcomingTasksWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="size-4 text-primary" />
          Upcoming Tasks
        </CardTitle>
        <CardDescription>Due or scheduled soon</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming tasks.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <Badge variant="secondary">{task.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.dueAt
                    ? `Due ${formatDateTime(task.dueAt)}`
                    : task.scheduledFor
                      ? `Scheduled ${formatDate(task.scheduledFor)}`
                      : "No date"}
                  {task.expand?.project ? ` · ${task.expand.project.name}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/inbox"
          className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
        >
          Open inbox
        </Link>
      </CardContent>
    </Card>
  );
}
