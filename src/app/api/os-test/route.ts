import { commandBus } from "@/lib/os/command-bus";

export async function GET() {
  const id = commandBus.dispatch({
    type: "TASK_CREATE",
    payload: {
      title: "OS test task",
      status: "inbox",
      priority: "low",
    },
    meta: {
      source: "system",
    },
  });

  return Response.json({
    ok: true,
    commandId: id,
  });
}