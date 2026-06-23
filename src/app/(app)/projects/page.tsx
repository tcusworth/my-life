import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import ProjectsClient from "./projects-client";

export default async function ProjectsPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");

  const [projects, tasks, notes] = await Promise.all([
    pb.collection("projects").getFullList({ sort: "sortOrder,created", expand: "area" }),
    pb.collection("tasks").getFullList({ sort: "status,priority,created" }),
    pb.collection("notes").getFullList({ sort: "-created" }),
  ]);

  return (
    <ProjectsClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projects={projects as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tasks={tasks as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notes={notes as any[]}
    />
  );
}
