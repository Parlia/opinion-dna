/** Validate a redirect path to prevent open redirects. Returns a safe path or the fallback. */
export function safeRedirectPath(next: string | null, fallback = "/dashboard"): string {
  if (!next) return fallback;
  // Must start with / and not contain // (protocol-relative URL) or backslash tricks
  if (!/^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(next)) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
