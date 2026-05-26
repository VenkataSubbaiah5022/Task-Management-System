"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KanbanTask } from "@tms/shared";
import { Plus } from "lucide-react";
import { useState } from "react";

type AddTaskFormProps = {
  boardId: string;
  columnId: string;
  onCreated: (task: KanbanTask) => void;
};

export function AddTaskForm({ boardId, columnId, onCreated }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setPending(true);

    try {
      const res = await fetch(`/api/boards/${boardId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), columnId }),
      });
      const data = (await res.json()) as { task?: KanbanTask; error?: string };
      if (res.ok && data.task) {
        onCreated(data.task);
        setTitle("");
        setOpen(false);
      }
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:border-emerald-400/30 hover:text-zinc-300"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        autoFocus
        disabled={pending}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
