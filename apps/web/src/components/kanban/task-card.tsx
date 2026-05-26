"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KanbanTask } from "@tms/shared";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const priorityTone = {
  LOW: "default",
  MEDIUM: "cyan",
  HIGH: "amber",
  URGENT: "red",
} as const;

type TaskCardProps = {
  task: KanbanTask;
};

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-white/8 bg-zinc-900/80 p-3 shadow-sm backdrop-blur-sm transition",
        isDragging && "z-20 scale-[1.02] border-emerald-400/40 shadow-xl shadow-emerald-500/10",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
        <button
          type="button"
          className="cursor-grab rounded p-0.5 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:text-zinc-300 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag task"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <h4 className="text-sm font-medium text-zinc-100">{task.title}</h4>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{task.description}</p>
      ) : null}
      {task.assignee ? (
        <div className="mt-3 flex items-center gap-2">
          <Avatar name={task.assignee.name} imageUrl={task.assignee.imageUrl} />
          <span className="text-xs text-zinc-400">{task.assignee.name}</span>
        </div>
      ) : null}
    </article>
  );
}
