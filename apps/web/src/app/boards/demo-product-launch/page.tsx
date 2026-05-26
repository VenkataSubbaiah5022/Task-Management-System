import { KanbanBoard } from "@/components/kanban/kanban-board";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { DEMO_BOARD_ID, demoColumns } from "@/lib/mock-board";
import Link from "next/link";

export default function DemoBoardPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1600px] flex-col px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-50">Product Launch</h1>
            <p className="text-sm text-zinc-500">Preview board — changes are not saved</p>
          </div>
          <Link href="/register">
            <Button size="sm">Sign up to save your work</Button>
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <KanbanBoard
            initialColumns={demoColumns}
            boardId={DEMO_BOARD_ID}
            readOnly
          />
        </div>
      </div>
    </>
  );
}
