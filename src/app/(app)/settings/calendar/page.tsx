import { Calendar } from "lucide-react";
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
import { getCalendarSourcesWithStats } from "@/lib/sync/observability";

function sourceTypeLabel(sourceType: string) {
  if (sourceType === "eventkit") return "EventKit";
  if (sourceType === "internal") return "Internal";
  return sourceType;
}

export default async function CalendarSettingsPage() {
  const sources = await getCalendarSourcesWithStats();

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Calendar sources synced from your Mac"
      />
      <PageBody>
        <SettingsNav />

        <PageSection
          title="Calendar sources"
          description="Calendars synced via EventKit. Enabled sources are included when selected in the macOS agent."
        >
          {sources.length === 0 ? (
            <EmptyState
              icon={<Calendar className="size-5" />}
              title="No calendar sources"
              description="Run the macOS EventKit sync agent on a registered device to import Apple Calendar sources."
            />
          ) : (
            <DataTable className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Calendar</DataTableHead>
                    <DataTableHead>Type</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead>Last synced</DataTableHead>
                    <DataTableHead>Events</DataTableHead>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {sources.map(({ source, eventCount, lastSyncedAt }) => (
                    <DataTableRow key={source.id}>
                      <DataTableCell>
                        <div className="flex items-center gap-3">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: source.color ?? "var(--foreground)",
                            }}
                          />
                          <div>
                            <H3 className="font-normal">{source.name}</H3>
                            {source.externalId ? (
                              <Small className="text-muted-foreground">
                                {source.externalId}
                              </Small>
                            ) : null}
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {sourceTypeLabel(source.sourceType)}
                      </DataTableCell>
                      <DataTableCell>
                        <Badge variant={source.isEnabled !== false ? "success" : "secondary"}>
                          {source.isEnabled !== false ? "Enabled" : "Disabled"}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell className="text-muted-foreground">
                        {formatDateTime(lastSyncedAt)}
                      </DataTableCell>
                      <DataTableCell className="tabular-nums">{eventCount}</DataTableCell>
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
