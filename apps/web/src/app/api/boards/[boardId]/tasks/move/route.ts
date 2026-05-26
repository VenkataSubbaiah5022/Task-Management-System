import { getSessionUser } from "@/lib/auth";
import { broadcastBoardEvent } from "@/lib/realtime";
import { prisma } from "@tms/db";
import { canEditTasks, moveTaskSchema } from "@tms/shared";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ boardId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;

  if (boardId === "demo-product-launch") {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const body = moveTaskSchema.parse(await request.json());

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: {
            members: { where: { userId: user.id } },
          },
        },
      },
    });

    if (!board || board.workspace.members.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const membership = board.workspace.members[0];
    if (!membership || !canEditTasks(membership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
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
        message: `moved a task`,
        metadata: body,
      },
    });

    await broadcastBoardEvent(boardId, "task:moved", body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Move failed" }, { status: 400 });
  }
}
