import { prisma } from "@tms/db";
import type { ActivityItem, KanbanColumn, TaskPriority } from "@tms/shared";

export async function getBoardsForUser(userId: string) {
  return prisma.board.findMany({
    where: {
      workspace: { members: { some: { userId } } },
    },
    include: {
      _count: { select: { columns: true } },
      columns: { include: { _count: { select: { tasks: true } } } },
      workspace: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getBoardForUser(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      workspace: { members: { some: { userId } } },
    },
    include: {
      workspace: {
        select: {
          name: true,
          members: { where: { userId }, select: { role: true } },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: { select: { id: true, name: true, imageUrl: true } },
            },
          },
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          actor: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });
}

export async function getFirstBoardId(userId: string) {
  const board = await prisma.board.findFirst({
    where: { workspace: { members: { some: { userId } } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return board?.id ?? null;
}

export function countBoardTasks(
  columns: { _count: { tasks: number } }[] | { tasks: unknown[] }[],
) {
  return columns.reduce((sum, col) => {
    if ("_count" in col) return sum + col._count.tasks;
    return sum + col.tasks.length;
  }, 0);
}

export function toKanbanColumns(
  columns: {
    id: string;
    title: string;
    order: number;
    tasks: {
      id: string;
      title: string;
      description: string | null;
      priority: TaskPriority;
      order: number;
      assignee: { id: string; name: string; imageUrl: string | null } | null;
    }[];
  }[],
): KanbanColumn[] {
  return columns.map((col) => ({
    id: col.id,
    title: col.title,
    order: col.order,
    tasks: col.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      order: task.order,
      assignee: task.assignee,
    })),
  }));
}

export function toActivityItems(
  activities: {
    id: string;
    type: string;
    message: string;
    createdAt: Date;
    actor: { name: string; imageUrl: string | null };
  }[],
): ActivityItem[] {
  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    actor: a.actor,
  }));
}
