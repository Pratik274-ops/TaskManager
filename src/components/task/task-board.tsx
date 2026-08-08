import { Link } from "@tanstack/react-router";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LabelChip, PriorityTag } from "@/components/task/task-tags";
import { STATUSES, formatDueDate, type Task, type TaskStatus } from "@/lib/task-types";
import { cn } from "@/lib/utils";

export function TaskBoard({
  tasks,
  onAdd,
}: {
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-6 pt-4 sm:px-6">
      {STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status.value);
        const Icon = status.icon;
        return (
          <section
            key={status.value}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-surface"
          >
            <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <Icon className={cn("size-4", status.className)} />
              <h3 className="text-sm font-semibold">{status.label}</h3>
              <span className="ml-auto text-xs text-muted-foreground">{columnTasks.length}</span>
            </header>

            <div className="flex flex-1 flex-col gap-2 p-2">
              {columnTasks.map((task) => (
                <Link
                  key={task.id}
                  to="/tasks/$taskId"
                  params={{ taskId: task.id }}
                  className="rounded-lg border border-border bg-card p-3 shadow-panel transition-colors hover:border-primary/40"
                >
                  <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
                  {task.labels.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <LabelChip key={label}>{label}</LabelChip>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between">
                    <PriorityTag priority={task.priority} />
                    {task.due_date ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="size-3" />
                        {formatDueDate(task.due_date)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground"
                onClick={() => onAdd(status.value)}
              >
                <Plus className="size-4" />
                Add Task
              </Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
