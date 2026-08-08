import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Taskly workspace" },
      {
        name: "description",
        content: "Group tasks into projects. Project workspaces are coming soon in Taskly.",
      },
      { property: "og:title", content: "Projects — Taskly workspace" },
      {
        property: "og:description",
        content: "Group tasks into projects. Project workspaces are coming soon in Taskly.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <FolderKanban className="size-8 text-muted-foreground" />
      <h1 className="text-base font-semibold">Projects</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Project grouping is not part of this assessment scope. Every task lives in your personal
        workspace for now.
      </p>
      <Button asChild size="sm" variant="outline">
        <Link to="/tasks">Back to tasks</Link>
      </Button>
    </div>
  );
}
