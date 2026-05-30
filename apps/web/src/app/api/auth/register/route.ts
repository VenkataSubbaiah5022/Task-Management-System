import { hashPassword, setSessionCookie, signToken } from "@/lib/auth";
import { prisma } from "@tms/db";
import { registerSchema } from "@tms/shared";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const slug = body.email.split("@")[0]?.replace(/\W+/g, "-") ?? "workspace";

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: body.email,
          name: body.name,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${body.name}'s Workspace`,
          slug: `${slug}-${created.id.slice(-6)}`,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: created.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      const board = await tx.board.create({
        data: {
          name: "Product Launch",
          description: "Your first project board",
          workspaceId: workspace.id,
          columns: {
            create: [
              { title: "Backlog", order: 0 },
              { title: "In Progress", order: 1 },
              { title: "Review", order: 2 },
              { title: "Done", order: 3 },
            ],
          },
        },
        include: { columns: { orderBy: { order: "asc" } } },
      });

      const [backlog, inProgress, review, done] = board.columns;
      if (backlog && inProgress && review && done) {
        await tx.task.createMany({
          data: [
            {
              title: "Define MVP scope",
              description: "Align on v1 goals and boundaries.",
              priority: "HIGH",
              order: 0,
              columnId: backlog.id,
              assigneeId: created.id,
            },
            {
              title: "Design Kanban flows",
              priority: "MEDIUM",
              order: 1,
              columnId: backlog.id,
            },
            {
              title: "Implement drag-and-drop",
              priority: "URGENT",
              order: 0,
              columnId: inProgress.id,
              assigneeId: created.id,
            },
            {
              title: "Activity feed",
              priority: "MEDIUM",
              order: 0,
              columnId: review.id,
            },
            {
              title: "Welcome to Flowboard",
              description: "You are all set — start adding tasks.",
              priority: "LOW",
              order: 0,
              columnId: done.id,
            },
          ],
        });
      }

      await tx.activity.create({
        data: {
          boardId: board.id,
          actorId: created.id,
          type: "MEMBER_JOINED",
          message: "joined the workspace",
        },
      });

      return { created, boardId: board.id };
    });

    const token = await signToken({
      id: user.created.id,
      email: user.created.email,
      name: user.created.name,
      imageUrl: user.created.imageUrl,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.created.id,
        email: user.created.email,
        name: user.created.name,
        imageUrl: user.created.imageUrl,
      },
      boardId: user.boardId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Registration failed. Check DATABASE_URL and try again." },
      { status: 500 },
    );
  }
}
