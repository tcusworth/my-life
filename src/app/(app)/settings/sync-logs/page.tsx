import { ScrollText } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SettingsNav } from "@/components/settings-nav";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/dates";
import {
  formatSyncLogCount,
  getSyncLogs,
} from "@/lib/sync/observability";
import type { SyncLogStatus } from "@/types/pocketbase";

function statusBadge(status: SyncLogStatus) {
  switch (status) {
    case "success":
      return <Badge variant="default">Success</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "partial":
      return <Badge variant="secondary">Partial</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatOperation(entityType: string) {
  return entityType.replaceAll("_", " ");
}

export default async function SyncLogsSettingsPage() {
  const logs = await getSyncLogs(100);

  return (
    <>
      <AppHeader
        title="Settings"
        description="Sync activity from Mac agents and the sync API"
      />
      <SettingsNav />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Sync logs</h2>
          <p className="text-sm text-muted-foreground">
            Recent inbound sync operations from registered Mac agents. Counts appear
            when the API logged them in metadata.
          </p>
        </div>

        {logs.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="size-5" />}
            title="No sync logs yet"
            description="Run the macOS sync agent or the smoke test script to generate log entries."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Operation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {logs.map((log) => {
                  const count = formatSyncLogCount(log.metadata);
                  return (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.created)}
                      </td>
                      <td className="px-4 py-3">{log.deviceName ?? "—"}</td>
                      <td className="px-4 py-3 capitalize">
                        {formatOperation(log.entityType)}
                      </td>
                      <td className="px-4 py-3">{statusBadge(log.status)}</td>
                      <td className="px-4 py-3 max-w-md text-muted-foreground">
                        {log.message ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{count ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
