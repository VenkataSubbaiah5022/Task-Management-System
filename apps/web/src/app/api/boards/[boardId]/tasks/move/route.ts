import { getSessionUser } from "@/lib/auth";
import { requireBoardAccess } from "@/lib/board-access";
import { broadcastBoardEvent } from "@/lib/realtime";
import { prisma } from "@tms/db";
import { moveTaskSchema } from "@tms/shared";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ boardId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;
  const access = await requireBoardAccess(boardId, user.id);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!access.canEdit) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = moveTaskSchema.parse(await request.json());

    const task = await prisma.task.findFirst({
      where: { id: body.taskId, column: { boardId } },
      include: { column: { select: { title: true } } },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const targetColumn = await prisma.column.findFirst({
      where: { id: body.targetColumnId, boardId },
    });
    if (!targetColumn) {
      return NextResponse.json({ error: "Invalid column" }, { status: 400 });
    }

    await prisma.task.update({
      where: { id: body.taskId },
      data: {
        columnId: body.targetColumnId,
        order: body.targetOrder,
      },
    });

    await prisma.activity.create({
      data: {
        boardId,
        actorId: user.id,
        type: "TASK_MOVED",
        message: `moved "${task.title}" to ${targetColumn.title}`,
      },
    });

    await broadcastBoardEvent(boardId, "task:moved", body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Move failed" }, { status: 400 });
  }
}
