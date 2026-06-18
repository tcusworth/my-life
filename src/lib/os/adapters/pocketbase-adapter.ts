import { getAuthenticatedClient, getCurrentUser } from "@/lib/pocketbase/server";
import type { Command } from "../command-bus";

export class PocketBaseAdapter {
  async execute(command: Command): Promise<any> {
    const pb = await getAuthenticatedClient();
    if (!pb) throw new Error("No authenticated PocketBase client");

    const user = await getCurrentUser();
    if (!user) throw new Error("No authenticated user");

    switch (command.type) {
      case "TASK_CREATE":
        return pb.collection("tasks").create({
          ...command.payload,
          user: user.id,
        });

      case "TASK_UPDATE":
        return pb.collection("tasks").update(command.payload.id, command.payload);

      case "PROJECT_CREATE":
        return pb.collection("projects").create({
          ...command.payload,
          user: user.id,
        });

      case "CONTACT_CREATE":
        return pb.collection("contacts").create({
          ...command.payload,
          user: user.id,
        });

      case "DEVICE_REGISTER":
        return pb.collection("devices").create({
          ...command.payload,
          user: user.id,
        });

      case "SYNC_RUN":
        return pb.collection("sync_logs").create({
          ...command.payload,
          user: user.id,
        });

      case "INBOX_PROCESS": {
        const { tasks = [], projects = [], contacts = [] } = command.payload || {};

        const results: any[] = [];

        for (const t of tasks) {
          results.push(
            await pb.collection("tasks").create({
              ...t,
              user: user.id,
            })
          );
        }

        for (const p of projects) {
          results.push(
            await pb.collection("projects").create({
              ...p,
              user: user.id,
            })
          );
        }

        for (const c of contacts) {
          results.push(
            await pb.collection("contacts").create({
              ...c,
              user: user.id,
            })
          );
        }

        return results;
      }

      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }
}