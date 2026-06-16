import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { deleteOAuthConnection } from "@/lib/sync/oauth-connections";
import { escapeFilterValue } from "@/lib/pocketbase/admin";

export async function POST() {
  const pb = await getAuthenticatedClient();
  if (!pb) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = pb.authStore.model?.id as string;

  await deleteOAuthConnection(pb, userId, "google");

  const filter = [
    `user = "${escapeFilterValue(userId)}"`,
    `sourceType = "google"`,
  ].join(" && ");

  const sources = await pb
    .collection("calendar_sources")
    .getFullList({ filter });

  for (const source of sources) {
    await pb.collection("calendar_sources").delete(source.id);
  }

  redirect("/settings");
}
