import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ActiveGoalsWidget } from "@/components/dashboard/active-goals-widget";
import { CalendarSummaryWidget } from "@/components/dashboard/calendar-summary-widget";
import { FollowUpsWidget } from "@/components/dashboard/follow-ups-widget";
import { TopProjectsWidget } from "@/components/dashboard/top-projects-widget";
import { UpcomingTasksWidget } from "@/components/dashboard/upcoming-tasks-widget";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDashboardWidgets } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const data = await getDashboardWidgets();

  return (
    <>
      <AppHeader
        title="Dashboard"
        description="Goals, projects, tasks, follow-ups, and calendar at a glance"
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <section className="rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-semibold">AI Inbox Processing</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste unstructured notes in your inbox to extract tasks, projects,
                contacts, due dates, and follow-ups automatically.
              </p>
            </div>
            <Link
              href="/inbox"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Process inbox
            </Link>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ActiveGoalsWidget goals={data?.activeGoals ?? []} />
          <TopProjectsWidget projects={data?.topProjects ?? []} />
          <UpcomingTasksWidget tasks={data?.upcomingTasks ?? []} />
          <FollowUpsWidget
            tasks={data?.followUpTasks ?? []}
            contacts={data?.followUpContacts ?? []}
            activities={data?.followUpActivities ?? []}
          />
          <CalendarSummaryWidget
            todayEvents={data?.todayEvents ?? []}
            weekEvents={data?.weekEvents ?? []}
            weekLabel={data?.weekLabel ?? "This week"}
          />
        </div>
      </div>
    </>
  );
}
