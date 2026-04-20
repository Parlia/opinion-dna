"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        router.push(`/compare?invited=${encodeURIComponent(email)}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send invite");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link
        href="/compare"
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        &larr; Back to Compare
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
        Invite Someone
      </h1>
      <p className="mt-1 text-[var(--muted)]">
        They&apos;ll get an email inviting them to take their own Opinion DNA assessment so you can compare results.
      </p>

      <form onSubmit={handleSend} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Their email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder="friend@example.com"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}
