import { Sun } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getTodayRange, formatDateTime } from "@/lib/dates";
import type { Task, TimeBlock } from "@/types/pocketbase";

async function getTodayData() {
  const pb = await getAuthenticatedClient();
  if (!pb) return { tasks: [], timeBlocks: [], label: "" };

  const { start, end, label } = getTodayRange();

  const [tasks, timeBlocks] = await Promise.all([
    pb.collection("tasks").getFullList<Task>({
      filter: `scheduledFor >= "${start}" && scheduledFor <= "${end}"`,
      sort: "sortOrder,scheduledFor",
    }),
    pb.collection("time_blocks").getFullList<TimeBlock>({
      filter: `startsAt >= "${start}" && startsAt <= "${end}"`,
      sort: "startsAt",
    }),
  ]);

  return { tasks, timeBlocks, label };
}

export default async function TodayPage() {
  const { tasks, timeBlocks, label } = await getTodayData();
  const isEmpty = tasks.length === 0 && timeBlocks.length === 0;

  return (
    <>
      <AppHeader title="Today" description={label} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {isEmpty ? (
          <EmptyState
            icon={<Sun className="size-5" />}
            title="Nothing scheduled for today"
            description="Schedule tasks for today or add time blocks to plan your focus time."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold">Tasks</h2>
              {tasks.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No tasks scheduled.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <li key={task.id} className="text-sm">
                      <p className="font-medium">{task.title}</p>
                      {task.scheduledFor && (
                        <p className="text-muted-foreground">
                          {formatDateTime(task.scheduledFor)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold">Schedule</h2>
              {timeBlocks.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No time blocks.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {timeBlocks.map((block) => (
                    <li key={block.id} className="text-sm">
                      <p className="font-medium">{block.title}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(block.startsAt)} – {formatDateTime(block.endsAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
