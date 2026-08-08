import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelChip } from "@/components/task/task-tags";
import { TaskFormDialog, type TaskFormValues } from "@/components/task/task-form-dialog";
import {
  PRIORITIES,
  STATUSES,
  formatDueDate,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/task-types";
import {
  useAddComment,
  useCreateTask,
  useDeleteTask,
  useTaskDetail,
  useUpdateTask,
} from "@/lib/use-tasks";

export const Route = createFileRoute("/_authenticated/tasks/$taskId")({
  head: () => ({
    meta: [
      { title: "Task details — Taskly" },
      {
        name: "description",
        content: "Review a task's status, priority, due date, subtasks and comments.",
      },
      { property: "og:title", content: "Task details — Taskly" },
      {
        property: "og:description",
        content: "Review a task's status, priority, due date, subtasks and comments.",
      },
    ],
  }),
  component: TaskDetailPage,
});

function Property({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const { data, isPending, isError } = useTaskDetail(taskId);
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment(taskId);

  const [editOpen, setEditOpen] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [comment, setComment] = useState("");

  if (isPending) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm font-medium">This task could not be found.</p>
        <Button asChild size="sm" variant="outline">
          <Link to="/tasks">Back to tasks</Link>
        </Button>
      </div>
    );
  }

  const task = data.task as Task;

  function handleEdit(values: TaskFormValues) {
    updateTask.mutate({ id: taskId, ...values });
    setEditOpen(false);
  }

  function addSubtask(event: React.FormEvent) {
    event.preventDefault();
    const title = subtaskTitle.trim();
    if (!title) return;
    createTask.mutate({
      title,
      description: "",
      status: "todo",
      priority: "none",
      dueDate: null,
      labels: [],
      parentId: taskId,
    });
    setSubtaskTitle("");
  }

  function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const body = comment.trim();
    if (!body) return;
    addComment.mutate(body);
    setComment("");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/tasks">
            <ArrowLeft className="size-4" />
            Tasks
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete task"
            onClick={() => {
              deleteTask.mutate(taskId);
              navigate({ to: "/tasks" });
            }}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          <div>
            <h1 className="text-xl font-semibold leading-snug">{task.title}</h1>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {task.description || "No description provided."}
            </p>
          </div>

          <section className="rounded-xl border border-border">
            <header className="flex items-center gap-2 border-b border-border px-3 py-2">
              <h2 className="text-sm font-semibold">Subtasks</h2>
              <span className="text-xs text-muted-foreground">
                {data.subtasks.filter((s) => s.status === "completed").length}/
                {data.subtasks.length}
              </span>
            </header>
            <ul className="divide-y divide-border">
              {data.subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center gap-2.5 px-3 py-2">
                  <Checkbox
                    checked={subtask.status === "completed"}
                    aria-label={`Mark ${subtask.title} complete`}
                    onCheckedChange={(checked) =>
                      updateTask.mutate({
                        id: subtask.id,
                        status: checked ? "completed" : "todo",
                      })
                    }
                  />
                  <span
                    className={
                      subtask.status === "completed"
                        ? "text-sm text-muted-foreground line-through"
                        : "text-sm"
                    }
                  >
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={addSubtask} className="flex items-center gap-2 px-3 py-2">
              <Plus className="size-4 text-muted-foreground" />
              <Input
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add subtask"
                className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </form>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Updates</h2>
            <ul className="space-y-3">
              {data.comments.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-border bg-surface p-3">
                  <p className="whitespace-pre-wrap text-sm">{entry.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString("en-GB")}
                  </p>
                </li>
              ))}
              {data.comments.length === 0 ? (
                <li className="text-sm text-muted-foreground">No updates yet.</li>
              ) : null}
            </ul>
            <form onSubmit={submitComment} className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Write an update…"
              />
              <Button type="submit" size="sm" disabled={addComment.isPending}>
                <Send className="size-4" />
                Post update
              </Button>
            </form>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Properties
          </h2>

          <Property label="Status">
            <Select
              value={task.status}
              onValueChange={(value) =>
                updateTask.mutate({ id: taskId, status: value as TaskStatus })
              }
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Property>

          <Property label="Priority">
            <Select
              value={task.priority}
              onValueChange={(value) =>
                updateTask.mutate({ id: taskId, priority: value as TaskPriority })
              }
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Property>

          <Property label="Due date">
            <span className="text-sm">{formatDueDate(task.due_date)}</span>
          </Property>

          <Property label="Labels">
            <span className="flex flex-wrap gap-1">
              {task.labels.length > 0 ? (
                task.labels.map((label) => <LabelChip key={label}>{label}</LabelChip>)
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </span>
          </Property>

          <Property label="Created">
            <span className="text-sm text-muted-foreground">
              {new Date(task.created_at).toLocaleDateString("en-GB")}
            </span>
          </Property>
        </aside>
      </div>

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        pending={updateTask.isPending}
        onSubmit={handleEdit}
      />
    </div>
  );
}
