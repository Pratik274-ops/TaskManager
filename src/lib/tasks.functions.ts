import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  createCommentSchema,
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "./task-schemas";

export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tasks")
      .select("*")
      .eq("user_id", context.userId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTask = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taskIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const [task, subtasks, comments] = await Promise.all([
      context.supabase.from("tasks").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("tasks")
        .select("*")
        .eq("parent_id", data.id)
        .order("created_at", { ascending: true }),
      context.supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (task.error) throw new Error(task.error.message);
    if (!task.data) throw new Error("Task not found");
    return {
      task: task.data,
      subtasks: subtasks.data ?? [],
      comments: comments.data ?? [],
    };
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createTaskSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tasks")
      .insert({
        user_id: context.userId,
        parent_id: data.parentId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        due_date: data.dueDate,
        labels: data.labels,
        position: Date.now(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateTaskSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Database["public"]["Tables"]["tasks"]["Update"] = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.status !== undefined) patch.status = data.status;
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.dueDate !== undefined) patch.due_date = data.dueDate;
    if (data.labels !== undefined) patch.labels = data.labels;


    const { data: row, error } = await context.supabase
      .from("tasks")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taskIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createCommentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("task_comments")
      .insert({ task_id: data.taskId, user_id: context.userId, body: data.body })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, display_name, is_guest")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? { id: context.userId, display_name: "Member", is_guest: false };
  });
