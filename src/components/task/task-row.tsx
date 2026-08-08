import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LabelChip, PriorityTag } from "@/components/task/task-tags";
import {
  STATUSES,
  formatDueDate,
  statusMeta,
  type FieldKey,
  type Task,
  type TaskStatus,
} from "@/lib/task-types";
import { cn } from "@/lib/utils";

export function TaskRow({
  task,
  fields,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  fields: Record<FieldKey, boolean>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const StatusIcon = statusMeta(task.status).icon;

  return (
    <div className="grid-row-hover grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-b border-border px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_repeat(2,auto)_2rem] sm:gap-x-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <StatusIcon className={cn("size-4 shrink-0", statusMeta(task.status).className)} />
        <Link
          to="/tasks/$taskId"
          params={{ taskId: task.id }}
          className="min-w-0 truncate text-sm font-medium text-foreground hover:underline"
        >
          {task.title}
        </Link>
        {fields.labels && task.labels.length > 0 ? (
          <span className="hidden shrink-0 items-center gap-1 md:flex">
            {task.labels.slice(0, 2).map((label) => (
              <LabelChip key={label}>{label}</LabelChip>
            ))}
          </span>
        ) : null}
      </div>

      <div className="col-span-2 flex items-center gap-4 text-xs sm:col-span-1 sm:justify-end">
        {fields.priority ? <PriorityTag priority={task.priority} /> : null}
      </div>

      {fields.dueDate ? (
        <div className="hidden w-28 shrink-0 text-right text-xs text-muted-foreground sm:block">
          {formatDueDate(task.due_date)}
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      <div className="row-start-1 justify-self-end sm:row-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Task actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Move to
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={task.status}
              onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
            >
              {STATUSES.map((status) => (
                <DropdownMenuRadioItem key={status.value} value={status.value}>
                  {status.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onEdit(task)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => onDelete(task)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
