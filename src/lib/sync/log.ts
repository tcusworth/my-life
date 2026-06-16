import type {
  SyncDirection,
  SyncLogStatus,
  TypedPocketBase,
} from "@/types/pocketbase";
import type { SyncAgentContext } from "@/lib/sync/types";

interface LogSyncEventInput {
  ctx: SyncAgentContext;
  direction: SyncDirection;
  entityType: string;
  status: SyncLogStatus;
  message?: string;
  metadata?: Record<string, unknown>;
}

export async function logSyncEvent({
  ctx,
  direction,
  entityType,
  status,
  message,
  metadata,
}: LogSyncEventInput) {
  await ctx.pb.collection("sync_logs").create({
    user: ctx.userId,
    device: ctx.device.id,
    direction,
    entityType,
    status,
    message,
    metadata,
  });
}

export async function logSyncSuccess(
  ctx: SyncAgentContext,
  entityType: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  await logSyncEvent({
    ctx,
    direction: "inbound",
    entityType,
    status: "success",
    message,
    metadata,
  });
}

export async function logSyncError(
  ctx: SyncAgentContext,
  entityType: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  await logSyncEvent({
    ctx,
    direction: "inbound",
    entityType,
    status: "error",
    message,
    metadata,
  });
}
