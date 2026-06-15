import { Calendar } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SettingsNav } from "@/components/settings-nav";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { CalendarSource } from "@/types/pocketbase";

async function getCalendarSources() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("calendar_sources").getFullList<CalendarSource>({
    sort: "name",
  });
}

export default async function CalendarSettingsPage() {
  const sources = await getCalendarSources();

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
            Calendars synced from your Mac via EventKit appear here. Toggle controls
            will activate once the sync agent is connected.
          </p>
        </div>

        {sources.length === 0 ? (
          <EmptyState
            icon={<Calendar className="size-5" />}
            title="No calendar sources"
            description="Install and run the macOS EventKit sync agent on a registered device to import Apple Calendar sources."
          />
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: source.color ?? "var(--primary)" }}
                  />
                  <div>
                    <p className="text-sm font-medium">{source.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {source.sourceType}
                      {source.externalId ? ` · ${source.externalId}` : ""}
                    </p>
                  </div>
                </div>
                <Badge variant={source.isEnabled !== false ? "default" : "secondary"}>
                  {source.isEnabled !== false ? "Enabled" : "Disabled"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
