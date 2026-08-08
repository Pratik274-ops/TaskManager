import { z } from "zod";

export const statusSchema = z.enum(["backlog", "todo", "doing", "completed"]);
export const prioritySchema = z.enum(["none", "low", "medium", "high", "urgent"]);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format");

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().trim().max(5000).optional().default(""),
  status: statusSchema.optional().default("todo"),
  priority: prioritySchema.optional().default("none"),
  dueDate: isoDate.nullable().optional().default(null),
  labels: z.array(z.string().trim().min(1).max(32)).max(10).optional().default([]),
  parentId: z.string().uuid().nullable().optional().default(null),
});

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  dueDate: isoDate.nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(32)).max(10).optional(),
});

export const taskIdSchema = z.object({ id: z.string().uuid() });

export const createCommentSchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
