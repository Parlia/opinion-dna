"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Invite {
  id: string;
  to_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function ComparePage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvites() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("invites")
        .select("id, to_email, status, created_at, updated_at")
        .eq("from_user_id", user.id)
        .order("created_at", { ascending: false });

      setInvites(data ?? []);
      setLoading(false);
    }
    loadInvites();
  }, []);

  const pending = invites.filter((i) => i.status === "pending");
  const accepted = invites.filter((i) => i.status === "accepted");

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-40 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Compare
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Invite someone to take their own assessment and compare results
          </p>
        </div>
        <Link
          href="/compare/invite"
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Invite Someone
        </Link>
      </div>

      {invites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <p className="font-medium text-[var(--foreground)]">No invitations yet</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Invite a friend, partner, or colleague to compare your Opinion DNA.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Accepted */}
          {accepted.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
                Accepted
              </h2>
              <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {accepted.map((invite) => (
                  <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{invite.to_email}</p>
                      <p className="text-sm text-[var(--muted)]">
                        Accepted {new Date(invite.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Accepted
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
                Pending
              </h2>
              <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
                {pending.map((invite) => (
                  <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{invite.to_email}</p>
                      <p className="text-sm text-[var(--muted)]">
                        Invited {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
