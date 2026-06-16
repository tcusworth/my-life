import { escapeFilterValue } from "@/lib/pocketbase/admin";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type {
  CalendarSource,
  Device,
  SyncLog,
  SyncLogStatus,
} from "@/types/pocketbase";

export interface DeviceSyncStats {
  lastSyncAt?: string;
  lastSyncStatus?: SyncLogStatus;
  lastSyncMessage?: string;
  calendarsSyncedCount: number;
  eventsSyncedCount: number;
}

export interface CalendarSourceStats {
  source: CalendarSource;
  eventCount: number;
  lastSyncedAt?: string;
}

export interface SyncLogRow extends SyncLog {
  deviceName?: string;
}

const SYNC_ENTITY_TYPES = [
  "calendar_sources",
  "calendar_events",
  "calendar_events_deleted",
  "pending_calendar_writes",
  "pending_calendar_write_complete",
  "pending_calendar_write_fail",
];

function deletedFilter(alias = ""): string {
  const prefix = alias ? `${alias}.` : "";
  return `(${prefix}deletedAt = null || ${prefix}deletedAt = '')`;
}

export async function getDeviceSyncStats(
  deviceId: string
): Promise<DeviceSyncStats> {
  const pb = await getAuthenticatedClient();
  if (!pb) {
    return {
      calendarsSyncedCount: 0,
      eventsSyncedCount: 0,
    };
  }

  const entityFilter = SYNC_ENTITY_TYPES.map(
    (entityType) => `entityType = "${entityType}"`
  ).join(" || ");

  const [latestLog, calendarSources] = await Promise.all([
    pb.collection("sync_logs").getList<SyncLog>(1, 1, {
      filter: `device = "${escapeFilterValue(deviceId)}" && (${entityFilter})`,
      sort: "-created",
    }),
    pb.collection("calendar_sources").getFullList<CalendarSource>({
      filter: `device = "${escapeFilterValue(deviceId)}"`,
      fields: "id",
    }),
  ]);

  let eventsSyncedCount = 0;
  if (calendarSources.length > 0) {
    const sourceFilter = calendarSources
      .map((source) => `calendarSource = "${escapeFilterValue(source.id)}"`)
      .join(" || ");

    const eventsResult = await pb.collection("calendar_events").getList(1, 1, {
      filter: `(${sourceFilter}) && ${deletedFilter()}`,
    });
    eventsSyncedCount = eventsResult.totalItems;
  }

  const log = latestLog.items[0];

  return {
    lastSyncAt: log?.created,
    lastSyncStatus: log?.status,
    lastSyncMessage: log?.message,
    calendarsSyncedCount: calendarSources.length,
    eventsSyncedCount,
  };
}

export async function getDevicesWithSyncStats(): Promise<
  Array<{ device: Device; stats: DeviceSyncStats }>
> {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  const devices = await pb.collection("devices").getFullList<Device>({
    sort: "-created",
  });

  return Promise.all(
    devices.map(async (device) => ({
      device,
      stats: await getDeviceSyncStats(device.id),
    }))
  );
}

export async function getCalendarSourcesWithStats(): Promise<CalendarSourceStats[]> {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  const sources = await pb.collection("calendar_sources").getFullList<CalendarSource>({
    sort: "name",
  });

  return Promise.all(
    sources.map(async (source) => {
      const [countResult, latestResult] = await Promise.all([
        pb.collection("calendar_events").getList(1, 1, {
          filter: `calendarSource = "${escapeFilterValue(source.id)}" && ${deletedFilter()}`,
        }),
        pb.collection("calendar_events").getList(1, 1, {
          filter: `calendarSource = "${escapeFilterValue(source.id)}"`,
          sort: "-lastSyncedAt",
        }),
      ]);

      return {
        source,
        eventCount: countResult.totalItems,
        lastSyncedAt: latestResult.items[0]?.lastSyncedAt,
      };
    })
  );
}

export async function getSyncLogs(limit = 100): Promise<SyncLogRow[]> {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  const devices = await pb.collection("devices").getFullList<Device>({
    fields: "id,name",
  });

  const logsResult = await pb.collection("sync_logs").getList<SyncLog>(1, limit, {
    sort: "-created",
  });

  const deviceNames = new Map(devices.map((device) => [device.id, device.name]));
  return logsResult.items.map((log) => ({
    ...log,
    deviceName: log.device ? deviceNames.get(log.device) : undefined,
  }));
}

export function formatSyncLogCount(metadata?: Record<string, unknown>): string | null {
  if (!metadata) return null;
  if (typeof metadata.count === "number") {
    return String(metadata.count);
  }
  return null;
}
