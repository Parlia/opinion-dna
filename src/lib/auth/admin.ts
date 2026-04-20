export const ADMIN_EMAIL = "jpaul@neeleyworldwide.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
