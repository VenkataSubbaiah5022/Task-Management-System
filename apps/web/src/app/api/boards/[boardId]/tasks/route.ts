import { getSessionUser } from "@/lib/auth";
import { requireBoardAccess } from "@/lib/board-access";
import { broadcastBoardEvent } from "@/lib/realtime";
import { prisma } from "@tms/db";
import { createTaskSchema } from "@tms/shared";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ boardId: string }> };

export async function POST(request: Request, context: RouteContext) {
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
    const body = createTaskSchema.parse(await request.json());

    const column = await prisma.column.findFirst({
      where: { id: body.columnId, boardId },
    });
    if (!column) {
      return NextResponse.json({ error: "Invalid column" }, { status: 400 });
    }

    const maxOrder = await prisma.task.aggregate({
      where: { columnId: body.columnId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        columnId: body.columnId,
        assigneeId: body.assigneeId,
        order,
      },
      include: {
        assignee: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    await prisma.activity.create({
      data: {
        boardId,
        actorId: user.id,
        type: "TASK_CREATED",
        message: `created "${task.title}" in ${column.title}`,
      },
    });

    await broadcastBoardEvent(boardId, "task:created", { taskId: task.id });

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        order: task.order,
        assignee: task.assignee,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create task" }, { status: 400 });
  }
}
