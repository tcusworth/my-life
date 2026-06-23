import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pb = await getAuthenticatedClient();
  if (!pb) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const record = await pb.collection("notes").create({
    ...body,
    user: pb.authStore.record?.id,
  });
  return NextResponse.json(record);
}
