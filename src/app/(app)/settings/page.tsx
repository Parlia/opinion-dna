"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deriveFirstName } from "@/lib/auth/display-name";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");
      setName(user.user_metadata?.full_name ?? "");

      // preferred_name isn't in auth.users.user_metadata by default (the
      // signup trigger wrote it directly to profiles), so read it from there.
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_name")
        .eq("id", user.id)
        .single();
      setPreferredName(profile?.preferred_name ?? "");
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const userRes = await supabase.auth.getUser();
    const userId = userRes.data.user?.id;

    // Blank preferred_name → fall back to deriveFirstName so reports still
    // have a sensible short address (handles initials like "J. Paul" too).
    const finalPreferred = preferredName.trim() || deriveFirstName(name);

    await supabase.auth.updateUser({
      data: { full_name: name, preferred_name: finalPreferred },
    });

    if (userId) {
      await supabase
        .from("profiles")
        .update({ full_name: name, preferred_name: finalPreferred })
        .eq("id", userId);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Settings
      </h1>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="preferredName" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            What should we call you? <span className="text-[var(--muted)] font-normal">(optional)</span>
          </label>
          <input
            id="preferredName"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder={deriveFirstName(name) || "e.g. J. Paul"}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            How you&apos;ll be addressed in your reports. Leave blank to use your first name.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--beige-light)] text-[var(--muted)]"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">Email cannot be changed</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
