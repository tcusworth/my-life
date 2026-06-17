import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { deleteOAuthConnection } from "@/lib/sync/oauth-connections";
import { escapeFilterValue } from "@/lib/pocketbase/admin";

export async function POST(request: NextRequest) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = pb.authStore.model?.id as string;
  await deleteOAuthConnection(pb, userId, "google");

  const sources = await pb.collection("calendar_sources").getFullList({
    filter: `user = "${escapeFilterValue(userId)}" && sourceType = "google"`,
  });
  for (const source of sources) await pb.collection("calendar_sources").delete(source.id);

  return NextResponse.redirect(new URL("/settings", request.url));
}
