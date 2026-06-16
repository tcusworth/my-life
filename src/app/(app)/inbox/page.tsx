import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { formatDateTime } from "@/lib/dates";
import type { Task } from "@/types/pocketbase";
import { Inbox } from "lucide-react";
import { AiInboxProcessor } from "./ai-inbox-processor";
import { checkInboxReadiness } from "./actions";

async function getInboxTasks() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("tasks").getFullList<Task>({
    filter: 'status = "inbox"',
    sort: "-created",
  });
}

export default async function InboxPage() {
  const [tasks, readiness] = await Promise.all([
    getInboxTasks(),
    checkInboxReadiness(),
  ]);

  return (
    <>
      <AppHeader
        title="Inbox"
        description="Capture unstructured input and triage extracted tasks"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <AiInboxProcessor readiness={readiness} />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Inbox tasks</h2>

          {tasks.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-5" />}
              title="Inbox is clear"
              description="All tasks are synced from PocketBase."
            />
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{task.title}</p>

                      {task.priority && (
                        <Badge variant="outline">{task.priority}</Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {task.createdAt
                        ? `Created ${formatDateTime(task.createdAt)}`
                        : null}
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