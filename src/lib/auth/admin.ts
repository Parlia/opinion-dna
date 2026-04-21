export const ADMIN_EMAIL = "jpaulneeley@gmail.com";

// Dedicated account that owns the seeded "Example report" cards on /compare.
// Anyone else with a comparison report owns a real one (tied to an invite).
export const EXAMPLE_REPORTS_EMAIL = "jpaulneeley+test@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function isExampleReportsEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === EXAMPLE_REPORTS_EMAIL.toLowerCase();
}
