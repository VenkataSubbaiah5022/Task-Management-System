"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@tms/config";
import type { AuthUser } from "@tms/shared";
import { Kanban, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BoardNav = { id: string; name: string };

type AppShellProps = {
  user: AuthUser;
  boards: BoardNav[];
  children: React.ReactNode;
};

export function AppShell({ user, boards, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/6 bg-zinc-950/80 p-4 md:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-zinc-950">
            <Kanban className="h-4 w-4" />
          </span>
          {APP_NAME}
        </Link>

        <Link
          href="/dashboard"
          className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            pathname === "/dashboard"
              ? "bg-white/10 text-white"
              : "text-zinc-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 text-emerald-400" />
          All boards
        </Link>

        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Your boards
        </p>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                pathname === `/boards/${board.id}`
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Kanban className="h-4 w-4 shrink-0 text-emerald-400/80" />
              <span className="truncate">{board.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t border-white/6 pt-4">
          <div className="flex items-center gap-2 px-2">
            <Avatar name={user.name} imageUrl={user.imageUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-white/6 px-4 md:px-6">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 md:hidden">
            {APP_NAME}
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
