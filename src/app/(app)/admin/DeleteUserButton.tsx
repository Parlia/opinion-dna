"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteUserButton({
  userId,
  email,
  paid,
}: {
  userId: string;
  email: string;
  paid: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "confirm" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPhase("deleting");
    setError(null);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Delete failed.");
        setPhase("idle");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
      setPhase("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {phase === "confirm" ? (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-[var(--muted)]">
            {paid ? "Paid user — delete?" : "Delete?"}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            No
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPhase("confirm")}
          disabled={phase === "deleting"}
          aria-label={`Delete ${email}`}
          className="text-xs text-[var(--muted)] hover:text-red-600 disabled:opacity-50"
        >
          {phase === "deleting" ? "Deleting…" : "Delete"}
        </button>
      )}
      {error && (
        <span className="text-[10px] leading-tight text-red-600 max-w-[180px] text-right">
          {error}
        </span>
      )}
    </div>
  );
}
