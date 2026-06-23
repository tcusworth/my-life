import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import HabitsClient from "./habits-client";

export default async function HabitsPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");
  return <HabitsClient />;
}
