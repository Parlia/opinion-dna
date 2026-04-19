import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="px-6 py-12 bg-foreground text-white/70">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-white mb-4">
              Opinion DNA<span className="text-primary-mid">&reg;</span>
            </h4>
            <p className="text-sm leading-relaxed">
              The most complete map of your mind. 48 dimensions across
              personality, values, and meta-thinking.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/personal-assessment" className="hover:text-white transition-colors">
                  Personal Assessment
                </Link>
              </li>
              <li>
                <Link href="/friends" className="hover:text-white transition-colors">
                  Friends Report
                </Link>
              </li>
              <li>
                <Link href="/couples" className="hover:text-white transition-colors">
                  Couples Report
                </Link>
              </li>
              <li>
                <Link href="/co-founders" className="hover:text-white transition-colors">
                  Co-Founders Report
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-white transition-colors">
                  Teams Report
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vs" className="hover:text-white transition-colors">
                  Compare Tests
                </Link>
              </li>
              <li>
                <Link href="/alternatives" className="hover:text-white transition-colors">
                  Alternatives
                </Link>
              </li>
              <li>
                <Link href="/for" className="hover:text-white transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link href="/tests" className="hover:text-white transition-colors">
                  Assessments
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  The Book
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="hover:text-white transition-colors">
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:hello@opiniondna.com"
                  className="hover:text-white transition-colors"
                >
                  hello@opiniondna.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; 2020-{new Date().getFullYear()} Opinion DNA&reg; from Jadala
            Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
