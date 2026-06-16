import Link from "next/link";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import {
  DashboardGrid,
  DashboardGridItem,
} from "@/components/layout/dashboard-grid";
import { ActiveGoalsWidget } from "@/components/dashboard/active-goals-widget";
import { CalendarSummaryWidget } from "@/components/dashboard/calendar-summary-widget";
import { FollowUpsWidget } from "@/components/dashboard/follow-ups-widget";
import { TopProjectsWidget } from "@/components/dashboard/top-projects-widget";
import { UpcomingTasksWidget } from "@/components/dashboard/upcoming-tasks-widget";
import { Button } from "@/components/ui/button";
import { getDashboardWidgets } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const data = await getDashboardWidgets();

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Goals, projects, tasks, follow-ups, and calendar at a glance"
      />

      <PageBody>
        <PageSection
          title="AI inbox processing"
          description="Paste unstructured notes in your inbox to extract tasks, projects, contacts, due dates, and follow-ups automatically."
          action={
            <Button size="sm" nativeButton={false} render={<Link href="/inbox" />}>
              Process inbox
            </Button>
          }
        />

        <PageSection title="Overview">
          <DashboardGrid>
            <DashboardGridItem span={4}>
              <ActiveGoalsWidget goals={data?.activeGoals ?? []} />
            </DashboardGridItem>

            <DashboardGridItem span={4}>
              <TopProjectsWidget projects={data?.topProjects ?? []} />
            </DashboardGridItem>

            <DashboardGridItem span={4}>
              <UpcomingTasksWidget tasks={data?.upcomingTasks ?? []} />
            </DashboardGridItem>

            <DashboardGridItem span={6}>
              <FollowUpsWidget
                tasks={data?.followUpTasks ?? []}
                contacts={data?.followUpContacts ?? []}
                activities={data?.followUpActivities ?? []}
              />
            </DashboardGridItem>

            <DashboardGridItem span={6}>
              <CalendarSummaryWidget
                todayEvents={data?.todayEvents ?? []}
                weekEvents={data?.weekEvents ?? []}
                weekLabel={data?.weekLabel ?? "This week"}
              />
            </DashboardGridItem>
          </DashboardGrid>
        </PageSection>
      </PageBody>
    </PageShell>
  );
}