import { Monitor } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SettingsNav } from "@/components/settings-nav";
import { Badge } from "@/components/ui/badge";
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
      return <Badge variant="default">Success</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "partial":
      return <Badge variant="secondary">Partial</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function DevicesSettingsPage() {
  const agents = await getDevicesWithSyncStats();

  return (
    <>
      <AppHeader
        title="Settings"
        description="Mac Sync Agents and calendar integration"
      />
      <SettingsNav />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Mac Sync Agents</h2>
          <p className="text-sm text-muted-foreground">
            Register Macs running the EventKit menu bar agent. Each agent receives a
            unique API key for the sync API documented in{" "}
            <code className="text-xs">MAC_SYNC_AGENT.md</code>. View sync activity in{" "}
            <a href="/settings/sync-logs" className="underline underline-offset-2">
              Sync logs
            </a>
            .
          </p>
        </div>

        <RegisterSyncAgentForm />

        {agents.length === 0 ? (
          <EmptyState
            icon={<Monitor className="size-5" />}
            title="No sync agents registered"
            description="Register your Mac to enable calendar sync through the EventKit agent."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Last seen</th>
                  <th className="px-4 py-3 font-medium">Last sync</th>
                  <th className="px-4 py-3 font-medium">Sync status</th>
                  <th className="px-4 py-3 font-medium">Calendars</th>
                  <th className="px-4 py-3 font-medium">Events</th>
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {agents.map(({ device: agent, stats }) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{agent.name}</p>
                      {stats.lastSyncMessage ? (
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                          {stats.lastSyncMessage}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {agent.agentVersion ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(agent.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(stats.lastSyncAt)}
                    </td>
                    <td className="px-4 py-3">{syncStatusBadge(stats.lastSyncStatus)}</td>
                    <td className="px-4 py-3 tabular-nums">{stats.calendarsSyncedCount}</td>
                    <td className="px-4 py-3 tabular-nums">{stats.eventsSyncedCount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={agent.isActive !== false ? "default" : "secondary"}>
                        {agent.isActive !== false ? "Active" : "Revoked"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <RevokeSyncAgentButton
                        deviceId={agent.id}
                        deviceName={agent.name}
                        isActive={agent.isActive !== false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
