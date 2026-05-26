"use client";

import { TaskCard } from "@/components/kanban/task-card";
import { cn } from "@/lib/utils";
import type { KanbanColumn } from "@tms/shared";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type KanbanColumnViewProps = {
  column: KanbanColumn;
};

export function KanbanColumnView({ column }: KanbanColumnViewProps) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = column.tasks.map((t) => t.id);

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex w-[min(100%,20rem)] shrink-0 flex-col rounded-2xl border border-white/8 bg-zinc-950/50",
        isDragging && "opacity-80",
      )}
    >
      <header className="flex items-center justify-between border-b border-white/6 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-100">{column.title}</h3>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
          {column.tasks.length}
        </span>
      </header>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[12rem] flex-1 flex-col gap-2 p-3">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
