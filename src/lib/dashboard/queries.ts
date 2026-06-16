import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { Goal, Project, Task } from "@/types/pocketbase";

async function safeQuery<T>(name: string, query: () => Promise<T>) {
  try {
    const result = await query();
    console.log(`[DASHBOARD QUERY OK] ${name}`);
    return result;
  } catch (error) {
    console.error(`[DASHBOARD QUERY FAILED] ${name}`, error);
    throw error;
  }
}

export async function getDashboardWidgets() {
  const pb = await getAuthenticatedClient();
  if (!pb) return null;

  const activeGoals = await safeQuery("goals", () =>
    pb.collection("goals").getList<Goal>(1, 5)
  );

  const topProjects = await safeQuery("projects", () =>
    pb.collection("projects").getList<Project>(1, 5)
  );

  const upcomingTasks = await safeQuery("tasks", () =>
    pb.collection("tasks").getList<Task>(1, 10)
  );

  return {
    activeGoals: activeGoals.items,
    topProjects: topProjects.items,
    upcomingTasks: upcomingTasks.items,
    followUpTasks: [],
    followUpContacts: [],
    followUpActivities: [],
    todayEvents: [],
    weekEvents: [],
    weekLabel: "This week",
  };
}