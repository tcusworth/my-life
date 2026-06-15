import Link from "next/link";
import { FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/pocketbase";

interface TopProjectsWidgetProps {
  projects: Project[];
}

export function TopProjectsWidget({ projects }: TopProjectsWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderKanban className="size-4 text-primary" />
          Top Projects
        </CardTitle>
        <CardDescription>Active projects by priority</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  {project.expand?.area && (
                    <p className="text-xs text-muted-foreground">
                      {project.expand.area.name}
                    </p>
                  )}
                </div>
                <Badge variant="outline">{project.status}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/projects"
          className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
        >
          View all projects
        </Link>
      </CardContent>
    </Card>
  );
}
