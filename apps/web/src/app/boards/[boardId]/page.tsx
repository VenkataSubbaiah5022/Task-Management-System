import { KanbanBoard } from "@/components/kanban/kanban-board";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { DEMO_BOARD_ID, demoColumns } from "@/lib/mock-board";
import Link from "next/link";
import { notFound } from "next/navigation";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  if (boardId !== DEMO_BOARD_ID) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1600px] flex-col px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-400/80">Demo workspace</p>
            <h1 className="text-xl font-semibold text-zinc-50">Product Launch</h1>
          </div>
          <Link href="/register">
            <Button size="sm" variant="secondary">
              Sign up to save changes
            </Button>
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <KanbanBoard initialColumns={demoColumns} boardId={boardId} />
        </div>
      </div>
    </>
  );
}
