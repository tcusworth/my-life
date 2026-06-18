import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { Task } from "@/types/pocketbase";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const pb = await getAuthenticatedClient();
  let tasks: Task[] = [];

  if (pb) {
    try {
      tasks = (await pb.collection("tasks").getFullList({
        filter: `status != "completed" && status != "cancelled"`,
        sort: "sortOrder,created",
      })) as unknown as Task[];
    } catch {
      // fall through
    }
  }

  return <TasksClient initialTasks={tasks} />;
}
