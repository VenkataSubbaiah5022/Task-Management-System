import type { WorkspaceRole } from "@tms/shared";
import { canEditTasks } from "@tms/shared";
import { getBoardForUser } from "./board-data";

export async function requireBoardAccess(boardId: string, userId: string) {
  const board = await getBoardForUser(boardId, userId);
  if (!board) return null;

  const membership = board.workspace.members[0];
  const role = (membership?.role ?? "VIEWER") as WorkspaceRole;

  return {
    board,
    role,
    canEdit: canEditTasks(role),
  };
}
