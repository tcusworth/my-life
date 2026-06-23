import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const pb = await getAuthenticatedClient();
  if (!pb) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const record = await pb.collection("contacts").update(id, body);
  return NextResponse.json(record);
}
