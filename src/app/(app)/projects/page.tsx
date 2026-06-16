import { FolderKanban } from "lucide-react";
import { PageBody } from "@/components/layout/page-body";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { Small } from "@/components/ui/typography";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import type { Project } from "@/types/pocketbase";

async function getProjects() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("projects").getFullList<Project>({
    sort: "sortOrder,name",
    expand: "area",
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PageShell>
      <PageHeader
        title="Projects"
        description="Organize work into focused areas"
      />
      <PageBody>
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-5" />}
            title="No projects yet"
            description="Create projects to group related tasks and notes. Project creation UI coming soon."
          />
        ) : (
          <PageSection title="All projects">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="border-l-[3px]"
                  style={
                    project.color
                      ? { borderLeftColor: project.color }
                      : undefined
                  }
                >
                  <CardContent className="pt-[var(--spacing-card)]">
                    <div className="flex items-start justify-between gap-2">
                      <H3>{project.name}</H3>
                      <Badge
                        variant={project.status === "active" ? "default" : "secondary"}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    {project.expand?.area && (
                      <Small className="mt-2 block text-muted-foreground">
                        {project.expand.area.name}
                      </Small>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageSection>
        )}
      </PageBody>
    </PageShell>
  );
}
