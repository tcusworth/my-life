import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsNav } from "@/components/settings-nav";
import { Card, CardContent } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
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
    <PageShell width="narrow">
      <PageHeader
        title="Settings"
        description="Initial workspace setup and defaults"
      />
      <PageBody>
        <SettingsNav />

        <PageSection
          title="Workspace setup"
          description="Run once after deploying PocketBase and signing in. Areas group projects across your life domains."
        >
          {missingDefaults.length > 0 && (
            <Small className="block text-muted-foreground">
              Missing default areas: {missingDefaults.join(", ")}
            </Small>
          )}

          <SeedAreasForm />

          {areas.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <H3>Your areas ({areas.length})</H3>
                <ul className="mt-3 space-y-1">
                  {areas.map((area) => (
                    <li key={area.id}>
                      <Small className="text-muted-foreground">{area.name}</Small>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </PageSection>
      </PageBody>
    </PageShell>
  );
}
