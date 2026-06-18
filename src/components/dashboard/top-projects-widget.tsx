import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Small } from "@/components/ui/typography";
import type { Project } from "@/types/pocketbase";

interface TopProjectsWidgetProps {
  projects: Project[];
}

export function TopProjectsWidget({ projects }: TopProjectsWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top projects</CardTitle>
        <CardDescription>Active projects by priority</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <Small className="text-muted-foreground">No active projects.</Small>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="type-h3 font-normal">{project.name}</p>
                  {project.expand?.area && (
                    <Small className="text-muted-foreground">
                      {project.expand.area.name}
                    </Small>
                  )}
                </div>
                <Badge variant="outline">{project.status}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/projects"
          className="type-small mt-4 inline-block text-foreground hover:underline"
        >
          View all projects
        </Link>
      </CardContent>
    </Card>
  );
}
