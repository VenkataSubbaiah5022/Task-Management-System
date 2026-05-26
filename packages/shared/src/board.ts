import { z } from "zod";
import { TaskPriority, type TaskPriority as TaskPriorityType } from "./roles";

export const createBoardSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  columnId: z.string().cuid(),
  description: z.string().max(5000).optional(),
  priority: TaskPriority.default("MEDIUM"),
  assigneeId: z.string().cuid().optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().cuid(),
  targetColumnId: z.string().cuid(),
  targetOrder: z.number().int().min(0),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export type KanbanColumn = {
  id: string;
  title: string;
  order: number;
  tasks: KanbanTask[];
};

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriorityType;
  order: number;
  assignee: { id: string; name: string; imageUrl: string | null } | null;
};

export type ActivityItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor: { name: string; imageUrl: string | null };
};
