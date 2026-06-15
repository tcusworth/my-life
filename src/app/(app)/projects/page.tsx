import { FolderKanban } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
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
    <>
      <AppHeader
        title="Projects"
        description="Organize work into focused areas"
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="size-5" />}
            title="No projects yet"
            description="Create projects to group related tasks and notes. Project creation UI coming soon."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border bg-card p-5"
                style={
                  project.color
                    ? { borderLeftColor: project.color, borderLeftWidth: 4 }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{project.name}</h2>
                  <Badge variant={project.status === "active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                {project.expand?.area && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.expand.area.name}
                  </p>
                )}
                {project.icon && (
                  <p className="mt-1 text-sm text-muted-foreground">{project.icon}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
