import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITIES, STATUSES, type Task, type TaskPriority, type TaskStatus } from "@/lib/task-types";

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  labels: string[];
}

const EMPTY: TaskFormValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "none",
  dueDate: null,
  labels: [],
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSubmit: (values: TaskFormValues) => void;
  pending?: boolean;
}) {
  const [values, setValues] = useState<TaskFormValues>(EMPTY);
  const [labelText, setLabelText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setValues({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        labels: task.labels,
      });
      setLabelText(task.labels.join(", "));
    } else {
      setValues({ ...EMPTY, status: defaultStatus ?? "todo" });
      setLabelText("");
    }
    setError(null);
  }, [open, task, defaultStatus]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      labels: labelText
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
        .slice(0, 10),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of this task." : "Add a task to your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              autoFocus
              value={values.title}
              placeholder="e.g. Write API documentation"
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              value={values.description}
              placeholder="Add more detail…"
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) =>
                  setValues((v) => ({ ...v, status: value as TaskStatus }))
                }
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={values.priority}
                onValueChange={(value) =>
                  setValues((v) => ({ ...v, priority: value as TaskPriority }))
                }
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={values.dueDate ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, dueDate: e.target.value || null }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-labels">Labels</Label>
              <Input
                id="task-labels"
                value={labelText}
                placeholder="Design, Research"
                onChange={(e) => setLabelText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
