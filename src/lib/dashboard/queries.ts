import { addDays } from "date-fns";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { getCurrentWeekRange, getTodayRange } from "@/lib/dates";
import type {
  Activity,
  CalendarEvent,
  Contact,
  Goal,
  Project,
  Task,
} from "@/types/pocketbase";

export async function getDashboardWidgets() {
  const pb = await getAuthenticatedClient();
  if (!pb) return null;

  const now = new Date().toISOString();
  const followUpCutoff = addDays(new Date(), 14).toISOString();
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: weekStart, end: weekEnd, label: weekLabel } = getCurrentWeekRange();

  try {
    const [
      activeGoals,
      topProjects,
      upcomingTasks,
      followUpTasks,
      followUpContacts,
      followUpActivities,
      todayEvents,
      weekEvents,
    ] = await Promise.all([
      pb.collection("goals").getList<Goal>(1, 5, {
        filter: 'status = "active"',
        sort: "sortOrder,targetDate",
        expand: "area",
      }),
      pb.collection("projects").getList<Project>(1, 5, {
        filter: 'status = "active"',
        sort: "sortOrder,name",
        expand: "area",
      }),
      pb.collection("tasks").getList<Task>(1, 5, {
        filter: `(status = "inbox" || status = "active") && (dueAt >= "${now}" || scheduledFor >= "${now}")`,
        sort: "dueAt,scheduledFor",
        expand: "project,contact",
      }),
      pb.collection("tasks").getList<Task>(1, 5, {
        filter: `followUpAt >= "${now}" && followUpAt <= "${followUpCutoff}" && status != "completed" && status != "cancelled"`,
        sort: "followUpAt",
        expand: "contact,project",
      }),
      pb.collection("contacts").getList<Contact>(1, 5, {
        filter: `followUpAt >= "${now}" && followUpAt <= "${followUpCutoff}"`,
        sort: "followUpAt",
      }),
      pb.collection("activities").getList<Activity>(1, 5, {
        filter: `followUpAt >= "${now}" && followUpAt <= "${followUpCutoff}"`,
        sort: "followUpAt",
        expand: "contact",
      }),
      pb.collection("calendar_events").getFullList<CalendarEvent>({
        filter: `startsAt >= "${todayStart}" && startsAt <= "${todayEnd}" && (deletedAt = null || deletedAt = '')`,
        sort: "startsAt",
      }),
      pb.collection("calendar_events").getFullList<CalendarEvent>({
        filter: `startsAt >= "${weekStart}" && startsAt <= "${weekEnd}" && (deletedAt = null || deletedAt = '')`,
        sort: "startsAt",
      }),
    ]);

    return {
      activeGoals: activeGoals.items,
      topProjects: topProjects.items,
      upcomingTasks: upcomingTasks.items,
      followUpTasks: followUpTasks.items,
      followUpContacts: followUpContacts.items,
      followUpActivities: followUpActivities.items,
      todayEvents,
      weekEvents,
      weekLabel,
    };
  } catch {
    return null;
  }
}
