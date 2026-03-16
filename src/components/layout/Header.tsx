"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "What it is", href: "#what-it-is" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="Opinion DNA" width={160} height={32} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <a
            href="#pricing"
            className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
        </nav>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-muted hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="block text-sm text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <a
            href="#pricing"
            className="block text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg text-center"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </a>
        </div>
      )}
    </header>
  );
}
