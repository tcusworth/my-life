import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");

  const userName = (pb.authStore.model?.name as string) || "";

  const [allTasks, followUpContacts] = await Promise.all([
    pb.collection("tasks").getFullList({
      filter: 'status != "completed" && status != "cancelled"',
      sort: "dueAt,priority",
      expand: "project",
    }),
    pb.collection("contacts").getFullList({
      filter: 'followUpAt != ""',
      sort: "followUpAt",
    }),
  ]);

  return (
    <DashboardClient
      userName={userName}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allTasks={allTasks as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      followUpContacts={followUpContacts as any[]}
    />
  );
}
