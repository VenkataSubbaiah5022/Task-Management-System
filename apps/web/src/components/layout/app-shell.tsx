import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@tms/config";
import type { AuthUser } from "@tms/shared";
import { Kanban, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";

type AppShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

const nav = [
  { href: "/dashboard", label: "Boards", icon: LayoutDashboard },
  { href: `/boards/demo-product-launch`, label: "Demo board", icon: Kanban },
];

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/6 bg-zinc-950/80 p-4 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-zinc-950">
            <Kanban className="h-4 w-4" />
          </span>
          {APP_NAME}
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <item.icon className="h-4 w-4 text-emerald-400" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-2 border-t border-white/6 pt-4">
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
        <header className="flex h-14 items-center justify-between border-b border-white/6 px-4 md:px-6">
          <h1 className="text-sm font-medium text-zinc-400 md:hidden">{APP_NAME}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
