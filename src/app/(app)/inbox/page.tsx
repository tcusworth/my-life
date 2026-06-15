import { Inbox } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { formatDateTime } from "@/lib/dates";
import type { Task } from "@/types/pocketbase";
import { AiInboxProcessor } from "./ai-inbox-processor";

async function getInboxTasks() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("tasks").getFullList<Task>({
    filter: 'status = "inbox"',
    sort: "sortOrder,created",
    expand: "project,contact",
  });
}

export default async function InboxPage() {
  const tasks = await getInboxTasks();

  return (
    <>
      <AppHeader
        title="Inbox"
        description="Capture unstructured input and triage extracted tasks"
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AiInboxProcessor />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Inbox tasks</h2>
          {tasks.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-5" />}
              title="Inbox is clear"
              description="Paste notes above to let AI create tasks, projects, contacts, and follow-ups."
            />
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.priority && (
                        <Badge variant="outline">{task.priority}</Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {task.dueAt && <span>Due {formatDateTime(task.dueAt)}</span>}
                      {task.followUpAt && (
                        <span>Follow up {formatDateTime(task.followUpAt)}</span>
                      )}
                      {task.expand?.project && <span>{task.expand.project.name}</span>}
                      {task.expand?.contact && <span>{task.expand.contact.name}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
