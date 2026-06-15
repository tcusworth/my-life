import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export default async function HomePage() {
  const pb = await getAuthenticatedClient();
  redirect(pb ? "/dashboard" : "/login");
}
