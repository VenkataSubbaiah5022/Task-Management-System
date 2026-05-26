import { z } from "zod";

export const WorkspaceRole = z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);
export type WorkspaceRole = z.infer<typeof WorkspaceRole>;

export const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export type TaskPriority = z.infer<typeof TaskPriority>;

export const ActivityType = z.enum([
  "TASK_CREATED",
  "TASK_MOVED",
  "TASK_UPDATED",
  "TASK_DELETED",
  "COMMENT_ADDED",
  "MEMBER_JOINED",
]);
export type ActivityType = z.infer<typeof ActivityType>;

export function canEditTasks(role: WorkspaceRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export function canManageBoard(role: WorkspaceRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}
