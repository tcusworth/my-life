import { Sun } from "lucide-react";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
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
    <PageShell>
      <PageHeader title="Today" description={label} />
      <PageBody>
        {isEmpty ? (
          <EmptyState
            icon={<Sun className="size-5" />}
            title="Nothing scheduled for today"
            description="Schedule tasks for today or add time blocks to plan your focus time."
          />
        ) : (
          <PageSection title="Schedule">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent className="pt-[var(--spacing-card)]">
                  <H3>Tasks</H3>
                  {tasks.length === 0 ? (
                    <Small className="mt-3 block text-muted-foreground">
                      No tasks scheduled.
                    </Small>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {tasks.map((task) => (
                        <li key={task.id}>
                          <p className="type-h3 font-normal">{task.title}</p>
                          {task.scheduledFor && (
                            <Small className="text-muted-foreground">
                              {formatDateTime(task.scheduledFor)}
                            </Small>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-[var(--spacing-card)]">
                  <H3>Time blocks</H3>
                  {timeBlocks.length === 0 ? (
                    <Small className="mt-3 block text-muted-foreground">
                      No time blocks.
                    </Small>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {timeBlocks.map((block) => (
                        <li key={block.id}>
                          <p className="type-h3 font-normal">{block.title}</p>
                          <Small className="text-muted-foreground">
                            {formatDateTime(block.startsAt)} –{" "}
                            {formatDateTime(block.endsAt)}
                          </Small>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </PageSection>
        )}
      </PageBody>
    </PageShell>
  );
}
