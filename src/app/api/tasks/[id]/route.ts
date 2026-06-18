import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const task = await pb.collection("tasks").update(id, body);
  return Response.json(task);
}
