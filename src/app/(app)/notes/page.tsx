import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import NotesClient from "./notes-client";

export default async function NotesPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");

  const [notes, projects] = await Promise.all([
    pb.collection("notes").getFullList({ sort: "-created", expand: "project" }),
    pb.collection("projects").getFullList({ sort: "sortOrder,created" }),
  ]);

  return (
    <NotesClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notes={notes as any[]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projects={projects as any[]}
    />
  );
}
