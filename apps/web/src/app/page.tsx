import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_NAME } from "@tms/config";
import { ArrowRight, Kanban, Shield, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    title: "Role-aware security",
    body: "JWT sessions with Owner, Admin, Member, and Viewer permissions on every task operation.",
  },
  {
    icon: Kanban,
    title: "Fluid Kanban UX",
    body: "Drag-and-drop columns powered by dnd-kit with optimistic updates and activity feeds.",
  },
  {
    icon: Zap,
    title: "Realtime sync",
    body: "Pusher channels broadcast board events so every teammate sees changes instantly.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 md:text-6xl">
              Ship tasks with{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </h1>
            <p className="mt-5 text-lg text-zinc-400 md:text-xl">{APP_DESCRIPTION}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/boards/demo-product-launch">
                <Button size="lg">
                  Open live demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Create workspace
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-white/8 bg-zinc-950/50 p-5 backdrop-blur-sm"
              >
                <feature.icon className="mb-3 h-5 w-5 text-emerald-400" />
                <h2 className="font-semibold text-zinc-100">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
