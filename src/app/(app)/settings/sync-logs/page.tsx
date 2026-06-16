import { ScrollText } from "lucide-react";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
} from "@/components/layout/data-table";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
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
      return <Badge variant="success">Success</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "partial":
      return <Badge variant="outline">Partial</Badge>;
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
    <PageShell>
      <PageHeader
        title="Settings"
        description="Sync activity from Mac agents and the sync API"
      />
      <PageBody>
        <SettingsNav />

        <PageSection
          title="Sync logs"
          description="Recent inbound sync operations. Counts appear when logged in metadata."
        >
          {logs.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="size-5" />}
              title="No sync logs yet"
              description="Run the macOS sync agent or the smoke test script to generate log entries."
            />
          ) : (
            <DataTable className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Timestamp</DataTableHead>
                    <DataTableHead>Agent</DataTableHead>
                    <DataTableHead>Operation</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead>Message</DataTableHead>
                    <DataTableHead>Count</DataTableHead>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {logs.map((log) => {
                    const count = formatSyncLogCount(log.metadata);
                    return (
                      <DataTableRow key={log.id}>
                        <DataTableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDateTime(log.created)}
                        </DataTableCell>
                        <DataTableCell>{log.deviceName ?? "—"}</DataTableCell>
                        <DataTableCell className="capitalize">
                          {formatOperation(log.entityType)}
                        </DataTableCell>
                        <DataTableCell>{statusBadge(log.status)}</DataTableCell>
                        <DataTableCell className="max-w-md text-muted-foreground">
                          {log.message ?? "—"}
                        </DataTableCell>
                        <DataTableCell className="tabular-nums">{count ?? "—"}</DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </table>
            </DataTable>
          )}
        </PageSection>
      </PageBody>
    </PageShell>
  );
}
