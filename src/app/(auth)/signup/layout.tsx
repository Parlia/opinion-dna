import type { Metadata } from "next";

// Auth pages have no search value and inherit the homepage canonical from the
// root layout, so keep them out of the index (and out of the sitemap).
export const metadata: Metadata = {
  title: "Sign Up",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.opiniondna.com/signup" },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
