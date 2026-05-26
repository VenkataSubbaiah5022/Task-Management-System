import { KanbanBoard } from "@/components/kanban/kanban-board";
import { getSessionUser } from "@/lib/auth";
import {
  getBoardForUser,
  toActivityItems,
  toKanbanColumns,
} from "@/lib/board-data";
import { canEditTasks } from "@tms/shared";
import type { WorkspaceRole } from "@tms/shared";
import { notFound, redirect } from "next/navigation";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { boardId } = await params;
  const board = await getBoardForUser(boardId, user.id);
  if (!board) notFound();

  const role = (board.workspace.members[0]?.role ?? "VIEWER") as WorkspaceRole;
  const columns = toKanbanColumns(board.columns);
  const activities = toActivityItems(board.activities);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="mb-4 shrink-0">
        <p className="text-xs text-zinc-500">{board.workspace.name}</p>
        <h1 className="text-xl font-semibold text-zinc-50">{board.name}</h1>
        {board.description ? (
          <p className="mt-1 text-sm text-zinc-400">{board.description}</p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">
        <KanbanBoard
          boardId={board.id}
          boardName={board.name}
          initialColumns={columns}
          initialActivities={activities}
          canEdit={canEditTasks(role)}
        />
      </div>
    </div>
  );
}
