import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth";
import { getBoardsForUser } from "@/lib/board-data";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const boards = await getBoardsForUser(user.id);

  return (
    <AppShell
      user={user}
      boards={boards.map((b) => ({
        id: b.id,
        name: b.name,
      }))}
    >
      {children}
    </AppShell>
  );
}
