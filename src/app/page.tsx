import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export default async function HomePage() {
  try {
    const pb = await getAuthenticatedClient();
    redirect(pb ? "/dashboard" : "/login");
  } catch {
    redirect("/login");
  }
}
