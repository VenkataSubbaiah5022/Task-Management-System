import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { getSessionUser } from "@/lib/auth";
import { countBoardTasks, getBoardsForUser } from "@/lib/board-data";
import { Kanban } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const boards = await getBoardsForUser(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Your boards</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back, {user.name.split(" ")[0]}
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      {boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-16 text-center">
          <p className="text-zinc-400">No boards yet. Create one to get started.</p>
          <div className="mt-4 flex justify-center">
            <CreateBoardDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const taskCount = countBoardTasks(board.columns);
            return (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group rounded-2xl border border-white/8 bg-zinc-950/60 p-5 transition hover:border-emerald-400/30 hover:bg-zinc-900/80"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition group-hover:scale-105">
                  <Kanban className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-zinc-100">{board.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {board.description ?? board.workspace.name}
                </p>
                <p className="mt-4 text-xs text-zinc-500">
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
