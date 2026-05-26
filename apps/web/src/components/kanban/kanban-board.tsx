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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { TaskCard } from "./task-card";

type KanbanBoardProps = {
  initialColumns: KanbanColumn[];
  initialActivities?: ActivityItem[];
  boardId: string;
  boardName?: string;
  canEdit?: boolean;
  readOnly?: boolean;
};

function findContainer(columns: KanbanColumn[], id: string) {
  if (columns.some((c) => c.id === id)) return id;
  return columns.find((c) => c.tasks.some((t) => t.id === id))?.id;
}

function prependActivity(items: ActivityItem[], entry: ActivityItem): ActivityItem[] {
  return [entry, ...items].slice(0, 40);
}

export function KanbanBoard({
  initialColumns,
  initialActivities,
  boardId,
  canEdit = false,
  readOnly = false,
}: KanbanBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState(initialColumns);
  const [activities, setActivities] = useState<ActivityItem[]>(
    initialActivities ?? (readOnly ? demoActivities : []),
  );
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);
  const editable = canEdit && !readOnly;

  function handleTaskCreated(columnId: string, task: KanbanTask) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col,
      ),
    );
    setActivities((prev) =>
      prependActivity(prev, {
        id: `local-${Date.now()}`,
        type: "TASK_CREATED",
        message: `created "${task.title}"`,
        createdAt: new Date().toISOString(),
        actor: { name: "You", imageUrl: null },
      }),
    );
    router.refresh();
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as KanbanTask | undefined;
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !editable) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColId = findContainer(columns, activeId);
    const targetColId = findContainer(columns, overId) ?? overId;
    if (!sourceColId || !targetColId) return;

    const sourceCol = columns.find((c) => c.id === sourceColId);
    const targetCol = columns.find((c) => c.id === targetColId);
    if (!sourceCol || !targetCol) return;

    const taskIndex = sourceCol.tasks.findIndex((t) => t.id === activeId);
    if (taskIndex < 0) return;

    const moved = sourceCol.tasks[taskIndex];
    if (!moved) return;

    let overTaskIndex =
      overId === targetColId
        ? targetCol.tasks.length
        : targetCol.tasks.findIndex((t) => t.id === overId);

    if (sourceColId === targetColId && overTaskIndex > taskIndex) {
      overTaskIndex -= 1;
    }

    const insertAt = overTaskIndex < 0 ? targetCol.tasks.length : overTaskIndex;

    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
      const src = next.find((c) => c.id === sourceColId);
      const tgt = next.find((c) => c.id === targetColId);
      if (!src || !tgt) return prev;

      const idx = src.tasks.findIndex((t) => t.id === activeId);
      if (idx < 0) return prev;

      const [item] = src.tasks.splice(idx, 1);
      if (!item) return prev;

      let pos =
        overId === targetColId
          ? tgt.tasks.length
          : tgt.tasks.findIndex((t) => t.id === overId);
      if (sourceColId === targetColId && pos > idx) pos -= 1;
      tgt.tasks.splice(pos < 0 ? tgt.tasks.length : pos, 0, item);

      return next;
    });

    if (readOnly || boardId === "demo-product-launch") return;

    const res = await fetch(`/api/boards/${boardId}/tasks/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: moved.id,
        targetColumnId: targetColId,
        targetOrder: insertAt,
      }),
    });

    if (res.ok) {
      setActivities((prev) =>
        prependActivity(prev, {
          id: `local-${Date.now()}`,
          type: "TASK_MOVED",
          message: `moved "${moved.title}" to ${targetCol.title}`,
          createdAt: new Date().toISOString(),
          actor: { name: "You", imageUrl: null },
        }),
      );
      router.refresh();
    }
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
              <KanbanColumnView
                key={column.id}
                column={column}
                boardId={boardId}
                canEdit={editable}
                readOnly={readOnly}
                onTaskCreated={handleTaskCreated}
              />
            ))}
          </div>
        </SortableContext>
        {typeof document !== "undefined"
          ? createPortal(
              <DragOverlay>
                {activeTask ? (
                  <div className="w-72 rotate-1 opacity-95">
                    <TaskCard task={activeTask} readOnly={readOnly} />
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
