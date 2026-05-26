import { getSessionUser } from "@/lib/auth";
import { getBoardsForUser, countBoardTasks } from "@/lib/board-data";
import { prisma } from "@tms/db";
import { createBoardSchema } from "@tms/shared";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await getBoardsForUser(user.id);
  return NextResponse.json({
    boards: boards.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      workspaceName: b.workspace.name,
      taskCount: countBoardTasks(b.columns),
      updatedAt: b.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createBoardSchema.parse(await request.json());

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      orderBy: { joinedAt: "asc" },
    });

    if (!membership) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        name: body.name,
        description: body.description,
        workspaceId: membership.workspaceId,
        columns: {
          create: [
            { title: "Backlog", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Review", order: 2 },
            { title: "Done", order: 3 },
          ],
        },
      },
    });

    return NextResponse.json({ board: { id: board.id, name: board.name } });
  } catch {
    return NextResponse.json({ error: "Could not create board" }, { status: 400 });
  }
}
