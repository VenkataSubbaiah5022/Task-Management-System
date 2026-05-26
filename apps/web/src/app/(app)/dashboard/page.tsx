import { Button } from "@/components/ui/button";
import { DEMO_BOARD_ID } from "@/lib/mock-board";
import { Kanban, Plus } from "lucide-react";
import Link from "next/link";

const boards = [
  {
    id: DEMO_BOARD_ID,
    name: "Product Launch",
    description: "Q2 release planning — demo board with live Kanban.",
    tasks: 6,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">Your boards</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage workspaces and collaborate in realtime.</p>
        </div>
        <Button variant="secondary" size="sm" disabled>
          <Plus className="h-4 w-4" />
          New board
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="group rounded-2xl border border-white/8 bg-zinc-950/60 p-5 transition hover:border-emerald-400/30 hover:bg-zinc-900/80"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition group-hover:scale-105">
              <Kanban className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-zinc-100">{board.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{board.description}</p>
            <p className="mt-4 text-xs text-zinc-500">{board.tasks} tasks</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
