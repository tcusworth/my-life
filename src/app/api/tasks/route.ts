import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function POST(request: Request) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = pb.authStore.model?.id as string;
  const body = await request.json();

  const task = await pb.collection("tasks").create({
    user: userId,
    title: body.title,
    status: body.status ?? "inbox",
    priority: body.priority,
    dueAt: body.dueAt,
  });

  return Response.json(task);
}
