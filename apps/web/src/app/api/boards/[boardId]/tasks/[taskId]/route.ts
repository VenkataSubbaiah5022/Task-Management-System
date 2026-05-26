import { getSessionUser } from "@/lib/auth";
import { requireBoardAccess } from "@/lib/board-access";
import { prisma } from "@tms/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TaskPriority } from "@tms/shared";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: TaskPriority.optional(),
});

type RouteContext = { params: Promise<{ boardId: string; taskId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, taskId } = await context.params;
  const access = await requireBoardAccess(boardId, user.id);
  if (!access?.canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = updateTaskSchema.parse(await request.json());

    const existing = await prisma.task.findFirst({
      where: { id: taskId, column: { boardId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: body,
      include: {
        assignee: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    await prisma.activity.create({
      data: {
        boardId,
        actorId: user.id,
        type: "TASK_UPDATED",
        message: `updated "${task.title}"`,
      },
    });

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId, taskId } = await context.params;
  const access = await requireBoardAccess(boardId, user.id);
  if (!access?.canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, column: { boardId } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  await prisma.activity.create({
    data: {
      boardId,
      actorId: user.id,
      type: "TASK_DELETED",
      message: `deleted "${existing.title}"`,
    },
  });

  return NextResponse.json({ ok: true });
}
