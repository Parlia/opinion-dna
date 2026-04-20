"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/Toast";
import { isAdminEmail } from "@/lib/auth/admin";

const baseNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scores", label: "Scores" },
  { href: "/report", label: "Report" },
  { href: "/compare", label: "Compare" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(isAdminEmail(data.user?.email));
    });
  }, []);

  const navLinks = isAdmin
    ? [...baseNavLinks, { href: "/admin", label: "Admin" }]
    : baseNavLinks;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <Image src="/logo.png" alt="Opinion DNA" width={140} height={28} priority />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      pathname.startsWith(link.href)
                        ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main>{children}</main>
    </div>
    </ToastProvider>
  );
}
