import { setSessionCookie, signToken, verifyPassword } from "@/lib/auth";
import { getFirstBoardId } from "@/lib/board-data";
import { prisma } from "@tms/db";
import { loginSchema } from "@tms/shared";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
    });
    await setSessionCookie(token);

    const boardId = await getFirstBoardId(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, imageUrl: user.imageUrl },
      boardId,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
