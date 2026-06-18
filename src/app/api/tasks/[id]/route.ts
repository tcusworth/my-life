import { getAuthenticatedClient } from "@/lib/pocketbase/server";

function computeNextDueAt(dueAt: string | undefined, rule: string): string {
  const base = dueAt ? new Date(dueAt) : new Date();
  switch (rule) {
    case "daily": base.setDate(base.getDate() + 1); break;
    case "weekly": base.setDate(base.getDate() + 7); break;
    case "biweekly": base.setDate(base.getDate() + 14); break;
    case "monthly": base.setMonth(base.getMonth() + 1); break;
  }
  return base.toISOString();
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  let existing = null;
  if (body.status === "completed") {
    existing = await pb.collection("tasks").getOne(id);
  }

  const task = await pb.collection("tasks").update(id, body);

  let nextTask = null;
  if (existing?.recurrenceRule && existing.recurrenceRule !== "none") {
    nextTask = await pb.collection("tasks").create({
      user: existing.user,
      title: existing.title,
      description: existing.description,
      status: "inbox",
      priority: existing.priority,
      recurrenceRule: existing.recurrenceRule,
      dueAt: computeNextDueAt(existing.dueAt, existing.recurrenceRule),
      parentTask: existing.parentTask,
    });
  }

  return Response.json({ task, nextTask });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const pb = await getAuthenticatedClient();
  if (!pb) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await pb.collection("tasks").delete(id);
  return Response.json({ ok: true });
}

