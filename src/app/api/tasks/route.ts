import { getAuthenticatedClient } from "@/lib/pocketbase/server";

export async function POST(request: Request) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = pb.authStore.model?.id as string;
  const body = await request.json();

  const data: Record<string, unknown> = {
    user: userId,
    title: body.title,
    status: body.status ?? "inbox",
  };
  if (body.priority) data.priority = body.priority;
  if (body.dueAt) data.dueAt = body.dueAt;
  if (body.recurrenceRule) data.recurrenceRule = body.recurrenceRule;
  if (body.parentTask) data.parentTask = body.parentTask;

  const task = await pb.collection("tasks").create(data);
  return Response.json(task);
}
