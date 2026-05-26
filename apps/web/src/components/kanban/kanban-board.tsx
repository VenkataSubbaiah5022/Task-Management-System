"use client";

import { ActivityFeed } from "@/components/kanban/activity-feed";
import { KanbanColumnView } from "@/components/kanban/kanban-column";
import { demoActivities } from "@/lib/mock-board";
import type { ActivityItem, KanbanColumn, KanbanTask } from "@tms/shared";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { TaskCard } from "./task-card";

type KanbanBoardProps = {
  initialColumns: KanbanColumn[];
  activities?: ActivityItem[];
  boardId: string;
};

function findContainer(columns: KanbanColumn[], id: string) {
  if (columns.some((c) => c.id === id)) return id;
  return columns.find((c) => c.tasks.some((t) => t.id === id))?.id;
}

export function KanbanBoard({
  initialColumns,
  activities = demoActivities,
  boardId,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as KanbanTask | undefined;
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setColumns((prev) => {
      const sourceColId = findContainer(prev, activeId);
      const targetColId = findContainer(prev, overId) ?? overId;
      if (!sourceColId || !targetColId || sourceColId === targetColId) {
        if (sourceColId !== targetColId) return prev;
      }

      const next = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
      const sourceCol = next.find((c) => c.id === sourceColId);
      const targetCol = next.find((c) => c.id === targetColId);
      if (!sourceCol || !targetCol) return prev;

      const taskIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
      if (taskIndex < 0) return prev;

      const [moved] = sourceCol.tasks.splice(taskIndex, 1);
      if (!moved) return prev;

      const overTaskIndex =
        overId === targetColId
          ? targetCol.tasks.length
          : targetCol.tasks.findIndex((t) => t.id === overId);
      targetCol.tasks.splice(overTaskIndex < 0 ? targetCol.tasks.length : overTaskIndex, 0, moved);

      void fetch(`/api/boards/${boardId}/tasks/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: moved.id,
          targetColumnId: targetColId,
          targetOrder: overTaskIndex < 0 ? targetCol.tasks.length - 1 : overTaskIndex,
        }),
      }).catch(() => undefined);

      return next;
    });
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1fr_18rem]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {columns.map((column) => (
              <KanbanColumnView key={column.id} column={column} />
            ))}
          </div>
        </SortableContext>
        {typeof document !== "undefined"
          ? createPortal(
              <DragOverlay>
                {activeTask ? (
                  <div className="w-72 rotate-1 opacity-95">
                    <TaskCard task={activeTask} />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
      <ActivityFeed items={activities} />
    </div>
  );
}
