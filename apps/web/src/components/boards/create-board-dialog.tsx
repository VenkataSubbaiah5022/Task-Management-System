"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateBoardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { error?: string; board?: { id: string } };
      if (!res.ok) {
        setError(data.error ?? "Could not create board");
        return;
      }
      setOpen(false);
      setName("");
      if (data.board?.id) {
        router.push(`/boards/${data.board.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New board
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleCreate}
      className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Board name"
        required
        minLength={2}
        autoFocus
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error ? <p className="text-xs text-red-400 sm:absolute sm:mt-12">{error}</p> : null}
    </form>
  );
}
