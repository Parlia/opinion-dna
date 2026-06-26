"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// Cloudflare Turnstile — invisible/managed CAPTCHA used to satisfy Supabase
// Auth's bot protection. Supabase enforces a captcha token on the email/password
// endpoints (signUp, signInWithPassword, resetPasswordForEmail); the Google OAuth
// redirect flow is exempt, so only those three forms mount this widget.

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

// Load the Turnstile script exactly once, shared across every widget instance.
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile load failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export interface TurnstileHandle {
  /** Reset the widget to issue a fresh token (tokens are single-use). */
  reset: () => void;
}

interface TurnstileProps {
  /** Fired with a fresh token once the challenge passes. */
  onVerify: (token: string) => void;
  /** Fired when a previously issued token expires (clear it in the parent). */
  onExpire?: () => void;
  /** Fired on script/challenge failure. */
  onError?: () => void;
}

const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { onVerify, onExpire, onError },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Keep the latest callbacks without re-rendering the widget.
  const cbRef = useRef({ onVerify, onExpire, onError });
  cbRef.current = { onVerify, onExpire, onError };

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    if (!SITE_KEY) {
      console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set");
      cbRef.current.onError?.();
      return;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        // Guard against React strict-mode double-invoke rendering twice.
        if (widgetIdRef.current) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          callback: (token) => cbRef.current.onVerify(token),
          "expired-callback": () => cbRef.current.onExpire?.(),
          "error-callback": () => cbRef.current.onError?.(),
        });
      })
      .catch(() => cbRef.current.onError?.());

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="flex justify-center" />;
});

export default Turnstile;
