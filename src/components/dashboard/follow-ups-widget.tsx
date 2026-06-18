import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Small } from "@/components/ui/typography";
import { formatDateTime } from "@/lib/dates";
import type { Activity, Contact, Task } from "@/types/pocketbase";

interface FollowUpsWidgetProps {
  tasks: Task[];
  contacts: Contact[];
  activities: Activity[];
}

export function FollowUpsWidget({ tasks, contacts, activities }: FollowUpsWidgetProps) {
  const items = [
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: task.expand?.contact?.name ?? task.expand?.project?.name,
      when: task.followUpAt,
    })),
    ...contacts.map((contact) => ({
      id: `contact-${contact.id}`,
      title: `Follow up with ${contact.name}`,
      subtitle: contact.company,
      when: contact.followUpAt,
    })),
    ...activities.map((activity) => ({
      id: `activity-${activity.id}`,
      title: activity.title,
      subtitle: activity.expand?.contact?.name,
      when: activity.followUpAt,
    })),
  ]
    .filter((item) => item.when)
    .sort(
      (a, b) => new Date(a.when!).getTime() - new Date(b.when!).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Follow ups</CardTitle>
        <CardDescription>People and reminders to reconnect with</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Small className="text-muted-foreground">No follow-ups scheduled.</Small>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="space-y-1">
                <p className="type-h3 font-normal">{item.title}</p>
                <Small className="text-muted-foreground">
                  {formatDateTime(item.when)}
                  {item.subtitle ? ` · ${item.subtitle}` : ""}
                </Small>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
