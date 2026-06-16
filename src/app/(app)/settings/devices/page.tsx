import Link from "next/link";
import { Monitor } from "lucide-react";
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
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
import { formatDateTime } from "@/lib/dates";
import { getDevicesWithSyncStats } from "@/lib/sync/observability";
import type { SyncLogStatus } from "@/types/pocketbase";
import { RegisterSyncAgentForm } from "./register-sync-agent-form";
import { RevokeSyncAgentButton } from "./revoke-sync-agent-button";

function syncStatusBadge(status?: SyncLogStatus) {
  if (!status) {
    return <Badge variant="secondary">No sync yet</Badge>;
  }

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

export default async function DevicesSettingsPage() {
  const agents = await getDevicesWithSyncStats();

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Mac sync agents and calendar integration"
      />
      <PageBody>
        <SettingsNav />

        <PageSection
          title="Mac sync agents"
          description={
            <>
              Register Macs running the EventKit menu bar agent. Each agent receives a
              unique API key documented in{" "}
              <code className="rounded bg-muted px-1 py-0.5 type-micro normal-case">
                MAC_SYNC_AGENT.md
              </code>
              . View activity in{" "}
              <Link href="/settings/sync-logs" className="text-foreground underline underline-offset-2">
                Sync logs
              </Link>
              .
            </>
          }
        >
          <RegisterSyncAgentForm />

          {agents.length === 0 ? (
            <EmptyState
              icon={<Monitor className="size-5" />}
              title="No sync agents registered"
              description="Register your Mac to enable calendar sync through the EventKit agent."
            />
          ) : (
            <DataTable className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Name</DataTableHead>
                    <DataTableHead>Version</DataTableHead>
                    <DataTableHead>Last seen</DataTableHead>
                    <DataTableHead>Last sync</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead>Calendars</DataTableHead>
                    <DataTableHead>Events</DataTableHead>
                    <DataTableHead>Agent</DataTableHead>
                    <DataTableHead>Actions</DataTableHead>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {agents.map(({ device: agent, stats }) => (
                    <DataTableRow key={agent.id}>
                      <DataTableCell>
                        <H3 className="font-normal">{agent.name}</H3>
                        {stats.lastSyncMessage ? (
                          <Small className="mt-1 block max-w-xs text-muted-foreground">
                            {stats.lastSyncMessage}
                          </Small>
                        ) : null}
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {agent.agentVersion ?? "—"}
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {formatDateTime(agent.lastSeenAt)}
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {formatDateTime(stats.lastSyncAt)}
                      </DataTableCell>
                      <DataTableCell>{syncStatusBadge(stats.lastSyncStatus)}</DataTableCell>
                      <DataTableCell className="tabular-nums">
                        {stats.calendarsSyncedCount}
                      </DataTableCell>
                      <DataTableCell className="tabular-nums">
                        {stats.eventsSyncedCount}
                      </DataTableCell>
                      <DataTableCell>
                        <Badge variant={agent.isActive !== false ? "success" : "secondary"}>
                          {agent.isActive !== false ? "Active" : "Revoked"}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell>
                        <RevokeSyncAgentButton
                          deviceId={agent.id}
                          deviceName={agent.name}
                          isActive={agent.isActive !== false}
                        />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </table>
            </DataTable>
          )}
        </PageSection>
      </PageBody>
    </PageShell>
  );
}
