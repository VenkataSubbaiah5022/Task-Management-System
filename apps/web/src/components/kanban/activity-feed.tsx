import { Avatar } from "@/components/ui/avatar";
import type { ActivityItem } from "@tms/shared";
import { Activity } from "lucide-react";

type ActivityFeedProps = {
  items: ActivityItem[];
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <aside className="flex h-full flex-col rounded-2xl border border-white/8 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
        <Activity className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-100">Activity</h3>
      </header>
      <ul className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 text-sm">
            <Avatar name={item.actor.name} imageUrl={item.actor.imageUrl} className="mt-0.5" />
            <div>
              <p className="text-zinc-300">
                <span className="font-medium text-zinc-100">{item.actor.name}</span> {item.message}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{timeAgo(item.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
