import type { TypedPocketBase } from "@/types/pocketbase";
import type { Device } from "@/types/pocketbase";

export interface SyncAgentContext {
  pb: TypedPocketBase;
  device: Device;
  userId: string;
}

export interface RegisterSyncAgentInput {
  name: string;
  agentVersion?: string;
}

export interface RegisterSyncAgentResult {
  deviceId: string;
  name: string;
  apiKey: string;
  platform: "macos";
}
