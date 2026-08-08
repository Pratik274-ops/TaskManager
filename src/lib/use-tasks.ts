import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  addComment,
  createTask,
  deleteTask,
  getProfile,
  getTask,
  listTasks,
  updateTask,
} from "@/lib/tasks.functions";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/task-schemas";

export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: string) => ["tasks", id] as const,
  profile: ["profile"] as const,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useProfile() {
  const fetchProfile = useServerFn(getProfile);
  return useQuery({ queryKey: taskKeys.profile, queryFn: () => fetchProfile() });
}

export function useTasks() {
  const fetchTasks = useServerFn(listTasks);
  return useQuery({ queryKey: taskKeys.all, queryFn: () => fetchTasks() });
}

export function useTaskDetail(id: string) {
  const fetchTask = useServerFn(getTask);
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTask({ data: { id } }),
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    if (id) void queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
  };
}

export function useCreateTask() {
  const run = useServerFn(createTask);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => run({ data: input }),
    onSuccess: (_row, input) => {
      invalidate(input.parentId ?? undefined);
      toast.success("Task created");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateTask() {
  const run = useServerFn(updateTask);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => run({ data: input }),
    onSuccess: (_row, input) => invalidate(input.id),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDeleteTask() {
  const run = useServerFn(deleteTask);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => run({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useAddComment(taskId: string) {
  const run = useServerFn(addComment);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: string) => run({ data: { taskId, body } }),
    onSuccess: () => invalidate(taskId),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
