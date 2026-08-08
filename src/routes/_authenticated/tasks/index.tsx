import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskBoard } from "@/components/task/task-board";
import { TaskRow } from "@/components/task/task-row";
import { TaskFormDialog, type TaskFormValues } from "@/components/task/task-form-dialog";
import {
  FIELD_KEYS,
  STATUSES,
  FIELD_LABELS,
  type FieldKey,
  type Task,
  type TaskStatus,
} from "@/lib/task-types";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks/")({
  head: () => ({
    meta: [
      { title: "Tasks — Taskly workspace" },
      {
        name: "description",
        content: "Track every task by status and priority in a list or board view.",
      },
      { property: "og:title", content: "Tasks — Taskly workspace" },
      {
        property: "og:description",
        content: "Track every task by status and priority in a list or board view.",
      },
    ],
  }),
  component: TasksPage,
});

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  priority: true,
  dueDate: true,
  labels: true,
  status: true,
};

function TasksPage() {
  const { data: tasks, isPending } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [view, setView] = useState<"list" | "board">("list");
  const [query, setQuery] = useState("");
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [formStatus, setFormStatus] = useState<TaskStatus>("todo");
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const visible = useMemo(() => {
    const list = (tasks ?? []).filter((task) => !task.parent_id);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.labels.some((label) => label.toLowerCase().includes(q)),
    );
  }, [tasks, query]);

  function openCreate(status: TaskStatus) {
    setEditing(null);
    setFormStatus(status);
    setFormOpen(true);
  }

  function handleSubmit(values: TaskFormValues) {
    if (editing) {
      updateTask.mutate({ id: editing.id, ...values });
    } else {
      createTask.mutate(values);
    }
    setFormOpen(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
        <h1 className="mr-auto text-base font-semibold">Tasks</h1>

        <div className="relative order-last w-full sm:order-none sm:w-56">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className="h-8 pl-8"
            aria-label="Search tasks"
          />
        </div>

        <div className="flex items-center rounded-md border border-border p-0.5">
          {(
            [
              { key: "list", icon: List, label: "List view" },
              { key: "board", icon: LayoutGrid, label: "Board view" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-label={label}
              aria-pressed={view === key}
              className={cn(
                "grid size-7 place-items-center rounded transition-colors",
                view === key
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <SlidersHorizontal className="size-4" />
              <span className="hidden sm:inline">Display</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Visible fields
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {FIELD_KEYS.map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={fields[key]}
                onCheckedChange={(checked) =>
                  setFields((current) => ({ ...current, [key]: Boolean(checked) }))
                }
              >
                {FIELD_LABELS[key]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="h-8" onClick={() => openCreate("todo")}>
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {isPending ? (
          <div className="space-y-2 p-4 sm:p-6">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Create your first task to start organising your work by status and priority.
            </p>
            <Button size="sm" onClick={() => openCreate("todo")}>
              <Plus className="size-4" />
              New task
            </Button>
          </div>
        ) : view === "board" ? (
          <TaskBoard tasks={visible} onAdd={openCreate} />
        ) : (
          <div className="px-4 py-4 sm:px-6">
            {STATUSES.map((status) => {
              const group = visible.filter((task) => task.status === status.value);
              if (group.length === 0) return null;
              const Icon = status.icon;
              return (
                <section key={status.value} className="mb-6 overflow-hidden rounded-xl border border-border">
                  <header className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
                    <Icon className={cn("size-4", status.className)} />
                    <h2 className="text-sm font-semibold">{status.label}</h2>
                    <span className="text-xs text-muted-foreground">{group.length}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto size-7"
                      aria-label={`Add task to ${status.label}`}
                      onClick={() => openCreate(status.value)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </header>
                  <div className="bg-card">
                    {group.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        fields={fields}
                        onEdit={(value) => {
                          setEditing(value);
                          setFormOpen(true);
                        }}
                        onDelete={setPendingDelete}
                        onStatusChange={(value, nextStatus) =>
                          updateTask.mutate({ id: value.id, status: nextStatus })
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        defaultStatus={formStatus}
        pending={createTask.isPending || updateTask.isPending}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” and its subtasks and comments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteTask.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
