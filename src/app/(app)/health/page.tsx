import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import HealthClient from "./health-client";

export default async function HealthPage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");
  return <HealthClient />;
}
