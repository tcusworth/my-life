import type { Command } from "@/lib/os/command-bus";
import { PocketBaseAdapter } from "@/lib/os/adapters/pocketbase-adapter";

export async function POST(request: Request) {
  try {
    const command = (await request.json()) as Command;

    const adapter = new PocketBaseAdapter();
    const result = await adapter.execute(command);

    return Response.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("[OS COMMAND ERROR]", error);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}