import { Button } from "@/components/ui/button";
import { APP_NAME } from "@tms/config";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-zinc-950">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="secondary" size="sm">
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
