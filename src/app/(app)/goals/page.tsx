import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import GoalsClient from "./goals-client";

export default async function GoalsPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");

  const goals = await pb.collection("goals").getFullList({
    sort: "sortOrder,created",
    expand: "area",
  });

  return <GoalsClient goals={goals as any[]} />;
}
