/**
 * Derive a sensible "what to call you" default from a full name. Handles
 * initials so "J. Paul Neeley" becomes "J. Paul" instead of "J.".
 *
 * Used as the placeholder + fallback for the preferred_name field in
 * signup and settings, and as the fallback in the OAuth callback when
 * Google hands us full_name without a preferred_name.
 */
export function deriveFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "";
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "";
  // First token is a single-letter initial (e.g. "J.") — pair it with the
  // next token so "J. Paul Neeley" → "J. Paul".
  if (tokens.length > 1 && /^[A-Za-z]\.$/.test(tokens[0])) {
    return `${tokens[0]} ${tokens[1]}`;
  }
  return tokens[0];
}
