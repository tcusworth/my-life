import { AppHeader } from "@/components/app-header";
import { SettingsNav } from "@/components/settings-nav";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { DEFAULT_AREAS } from "@/lib/seed/default-areas";
import type { Area } from "@/types/pocketbase";
import { SeedAreasForm } from "./seed-areas-form";

async function getAreas() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("areas").getFullList<Area>({ sort: "sortOrder,name" });
}

export default async function SetupSettingsPage() {
  const areas = await getAreas();
  const existingNames = new Set(areas.map((area) => area.name));
  const missingDefaults = DEFAULT_AREAS.filter((name) => !existingNames.has(name));

  return (
    <>
      <AppHeader
        title="Settings"
        description="Initial workspace setup and defaults"
      />
      <SettingsNav />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Workspace setup</h2>
          <p className="text-sm text-muted-foreground">
            Run once after deploying PocketBase and signing in. Areas group projects
            across CSI, OPAcommunity, Daily AI Productivity, Flatirons Creative Studio,
            and Personal.
          </p>
        </div>

        {missingDefaults.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Missing default areas: {missingDefaults.join(", ")}
          </p>
        )}

        <SeedAreasForm />

        {areas.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-medium">Your areas ({areas.length})</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {areas.map((area) => (
                <li key={area.id}>{area.name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
