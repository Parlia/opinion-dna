"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center text-[var(--muted)]">
            Loading...
          </div>
        </div>
      }
    >
      <SignupPage />
    </Suspense>
  );
}

function SignupPage() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteFromName, setInviteFromName] = useState<string | null>(null);
  const router = useRouter();

  // If signup was reached via an invite link, fetch the inviter's name
  // so we can show contextual copy.
  useEffect(() => {
    const nextParam = searchParams.get("next") || "";
    const tokenMatch = nextParam.match(/token=([a-f0-9]+)/);
    if (!tokenMatch) return;
    const token = tokenMatch[1];

    let cancelled = false;
    fetch(`/api/invite/info?token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.fromName) setInviteFromName(data.fromName);
      })
      .catch(() => {
        /* ignore — fall back to generic signup */
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Preserve any ?next=... from the signup URL through the auth redirect flow.
  // This is critical for invited users: without this, the email-confirmation
  // click and the OAuth return land on /callback without a next param, so the
  // user is dropped on /dashboard and the invite never gets marked accepted.
  function buildCallbackUrl(): string {
    const rawNext = searchParams.get("next");
    const base = `${window.location.origin}/callback`;
    return rawNext ? `${base}?next=${encodeURIComponent(rawNext)}` : base;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: buildCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildCallbackUrl(),
        queryParams: { prompt: "select_account" },
      },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Check your email</h2>
            <p className="mt-2 text-[var(--muted)]">
              We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Opinion DNA" width={180} height={36} priority className="mx-auto" />
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">
            {inviteFromName ? `Join ${inviteFromName} on Opinion DNA` : "Create your account"}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {inviteFromName
              ? "Take your own assessment to compare results"
              : "Start your psychographic assessment"}
          </p>
        </div>

        {inviteFromName && (
          <div
            className="rounded-2xl border p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center sm:items-start text-center sm:text-left"
            style={{ borderColor: "var(--primary)", backgroundColor: "var(--primary-light)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
              style={{ backgroundColor: "var(--primary)", color: "white" }}
            >
              {inviteFromName.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm text-[var(--foreground)] leading-relaxed">
              <p>
                <strong>{inviteFromName}</strong> has taken the Opinion DNA assessment and wants to compare results with you.
              </p>
              <p className="mt-1 text-[var(--muted)]">
                Create an account to continue — you&apos;ll take your own 179-question assessment ($47, 10-15 minutes). Once you&apos;re done, you&apos;ll both see how your minds compare.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--beige-light)] transition-colors text-[var(--foreground)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-sm text-[var(--muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
