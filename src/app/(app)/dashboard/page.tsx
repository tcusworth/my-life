import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Command,
  Inbox,
  ListTodo,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { FollowUpsWidget } from "@/components/dashboard/follow-ups-widget";
import { TopProjectsWidget } from "@/components/dashboard/top-projects-widget";
import { UpcomingTasksWidget } from "@/components/dashboard/upcoming-tasks-widget";
import { Button } from "@/components/ui/button";
import { getDashboardWidgets } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const data = await getDashboardWidgets();

  const inboxCount =
    data?.upcomingTasks?.filter((task) => task.status === "inbox").length ?? 0;

  const taskCount = data?.upcomingTasks?.length ?? 0;
  const followUpCount = data?.followUpTasks?.length ?? 0;
  const calendarCount = data?.todayEvents?.length ?? 0;

  return (
    <PageShell width="full" className="px-6 py-6">
      <style>
        {`
          @keyframes float-slow {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(18px, -18px, 0) scale(1.08); }
          }

          @keyframes rise-in {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .ml-rise {
            animation: rise-in 520ms ease-out both;
          }

          .ml-float {
            animation: float-slow 8s ease-in-out infinite;
          }
        `}
      </style>

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <section className="ml-rise relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#050816] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.38),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />
          <div className="ml-float absolute right-16 top-10 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Sparkles className="size-3.5 text-indigo-300" />
                My Life OS
              </div>

              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                My Life
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Your operating system for work and life.
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Tasks, projects, relationships, calendar, notes, and AI —
                organized around outcomes instead of apps.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Command layer
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    Press Cmd + K to create, capture, and move work.
                  </p>
                </div>
                <Command className="size-6 text-indigo-300" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button nativeButton={false} render={<Link href="/inbox" />}>
                  Process inbox
                </Button>

                <Button
                  variant="secondary"
                  nativeButton={false}
                  render={<Link href="/today" />}
                >
                  View today
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Inbox"
            value={inboxCount}
            helper="Items waiting"
            icon={Inbox}
            gradient="from-indigo-500 to-blue-500"
            delay="0ms"
          />

          <MetricCard
            label="Tasks"
            value={taskCount}
            helper="Open items"
            icon={ListTodo}
            gradient="from-emerald-500 to-teal-500"
            delay="70ms"
          />

          <MetricCard
            label="Follow-ups"
            value={followUpCount}
            helper="Due soon"
            icon={Users}
            gradient="from-violet-500 to-fuchsia-500"
            delay="140ms"
          />

          <MetricCard
            label="Calendar"
            value={calendarCount}
            helper="Events today"
            icon={CalendarDays}
            gradient="from-cyan-500 to-sky-500"
            delay="210ms"
          />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-12">
          <div className="ml-rise xl:col-span-8" style={{ animationDelay: "260ms" }}>
            <UpcomingTasksWidget tasks={data?.upcomingTasks ?? []} />
          </div>

          <div
            className="ml-rise flex flex-col gap-6 xl:col-span-4"
            style={{ animationDelay: "320ms" }}
          >
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    AI suggested next step
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Review inbox items and convert loose notes into tasks.
                  </p>
                </div>
                <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-500/20">
                  <Zap className="size-5" />
                </div>
              </div>

              <Link
                href="/inbox"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
              >
                Open inbox
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Calendar
                  </p>
                  <p className="mt-1 text-sm text-slate-500">This week</p>
                </div>
                <div className="rounded-2xl bg-cyan-500 p-3 text-white shadow-lg shadow-cyan-500/20">
                  <CalendarDays className="size-5" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-slate-950">
                    {calendarCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Today</p>
                </div>

                <div>
                  <p className="text-4xl font-semibold tracking-tight text-slate-950">
                    {data?.weekEvents?.length ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">This week</p>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                No events today. Calendar syncs via the macOS EventKit agent.
              </p>

              <Link
                href="/calendar"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700"
              >
                Open calendar
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-12">
          <div className="ml-rise xl:col-span-6" style={{ animationDelay: "380ms" }}>
            <TopProjectsWidget projects={data?.topProjects ?? []} />
          </div>

          <div className="ml-rise xl:col-span-6" style={{ animationDelay: "440ms" }}>
            <FollowUpsWidget
              tasks={data?.followUpTasks ?? []}
              contacts={data?.followUpContacts ?? []}
              activities={data?.followUpActivities ?? []}
            />
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  gradient,
  delay,
}: {
  label: string;
  value: number;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay: string;
}) {
  return (
    <div
      className="ml-rise group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
      style={{ animationDelay: delay }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-2 text-white`}>
          <Icon className="size-4" />
        </div>
      </div>

      <p className="mt-4 text-5xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}