import { Calendar } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SettingsNav } from "@/components/settings-nav";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/dates";
import { getCalendarSourcesWithStats } from "@/lib/sync/observability";

function sourceTypeLabel(sourceType: string) {
  if (sourceType === "eventkit") return "EventKit (Apple Calendar)";
  if (sourceType === "internal") return "Internal";
  return sourceType;
}

export default async function CalendarSettingsPage() {
  const sources = await getCalendarSourcesWithStats();

  return (
    <>
      <AppHeader
        title="Settings"
        description="Manage sync devices and integrations"
      />
      <SettingsNav />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Calendar sources</h2>
          <p className="text-sm text-muted-foreground">
            Calendars synced from your Mac via EventKit. Enabled sources are included
            in agent uploads when selected in the macOS app.
          </p>
        </div>

        {sources.length === 0 ? (
          <EmptyState
            icon={<Calendar className="size-5" />}
            title="No calendar sources"
            description="Install and run the macOS EventKit sync agent on a registered device to import Apple Calendar sources."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Calendar</th>
                  <th className="px-4 py-3 font-medium">Source type</th>
                  <th className="px-4 py-3 font-medium">Selected</th>
                  <th className="px-4 py-3 font-medium">Last synced</th>
                  <th className="px-4 py-3 font-medium">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {sources.map(({ source, eventCount, lastSyncedAt }) => (
                  <tr key={source.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: source.color ?? "var(--primary)",
                          }}
                        />
                        <div>
                          <p className="font-medium">{source.name}</p>
                          {source.externalId ? (
                            <p className="text-xs text-muted-foreground">
                              {source.externalId}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sourceTypeLabel(source.sourceType)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={source.isEnabled !== false ? "default" : "secondary"}>
                        {source.isEnabled !== false ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(lastSyncedAt)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{eventCount}</td>
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
