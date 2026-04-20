import type { Metadata } from "next";
import SEOPageLayout, { Breadcrumbs } from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Opinion DNA collects, uses, and protects your personal data. Operated by Jadala Limited, United Kingdom.",
  alternates: { canonical: "https://www.opiniondna.com/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Privacy Policy
      </h1>
      <p className="mt-4 text-muted">Last updated: 16 March 2026</p>

      <div className="mt-12 space-y-10 text-foreground leading-relaxed">
        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Who we are
          </h2>
          <p>
            Opinion DNA is operated by <strong>Jadala Limited</strong>, a company
            registered in England and Wales. When this policy refers to
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;, it means
            Jadala Limited.
          </p>
          <p className="mt-3">
            If you have questions about this policy, contact us at{" "}
            <a
              href="mailto:hello@opiniondna.com"
              className="text-primary hover:underline"
            >
              hello@opiniondna.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            What data we collect
          </h2>
          <p>We collect the following information when you use Opinion DNA:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Account information</strong> — your email address and name
              when you create an account.
            </li>
            <li>
              <strong>Assessment responses</strong> — your answers to our
              48-dimension assessment questions.
            </li>
            <li>
              <strong>Payment information</strong> — processed securely by
              Stripe. We do not store your card details on our servers.
            </li>
            <li>
              <strong>Usage data</strong> — pages visited, features used, and
              general interaction patterns to help us improve the product.
            </li>
            <li>
              <strong>Device and browser data</strong> — IP address, browser
              type, and operating system collected automatically via server logs
              and analytics.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            How we use your data
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To deliver and personalize your assessment results and reports.</li>
            <li>To generate AI-powered insights based on your dimension scores.</li>
            <li>To process payments and manage your account.</li>
            <li>To send transactional emails (receipts, report delivery, account updates).</li>
            <li>To improve and develop our product through anonymized, aggregated analytics.</li>
            <li>To respond to support requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Legal basis for processing (UK GDPR)
          </h2>
          <p>We process your personal data under the following legal bases:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Contract</strong> — to provide the assessment service you
              purchased.
            </li>
            <li>
              <strong>Legitimate interests</strong> — to improve our product,
              prevent fraud, and ensure security.
            </li>
            <li>
              <strong>Consent</strong> — where you have given explicit consent,
              for example for optional marketing communications.
            </li>
            <li>
              <strong>Legal obligation</strong> — to comply with applicable laws
              and regulations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Data sharing and third parties
          </h2>
          <p>
            We do not sell your personal data. We share data only with trusted
            service providers who help us operate Opinion DNA:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Supabase</strong> — database hosting and authentication.
            </li>
            <li>
              <strong>Stripe</strong> — payment processing.
            </li>
            <li>
              <strong>Anthropic</strong> — AI-powered report generation (only
              anonymized dimension scores are sent, never your email or name).
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery.
            </li>
            <li>
              <strong>Vercel</strong> — website hosting and analytics.
            </li>
          </ul>
          <p className="mt-3">
            Each provider is bound by their own privacy policies and data
            processing agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Data retention
          </h2>
          <p>
            We retain your account data and assessment results for as long as
            your account is active, so you can access your reports at any time.
            If you delete your account, we will remove your personal data within
            30 days, except where we are required by law to retain it.
          </p>
          <p className="mt-3">
            Payment records are retained for 7 years to comply with UK tax and
            accounting obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Your rights
          </h2>
          <p>Under UK data protection law, you have the right to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Access</strong> your personal data and request a copy.
            </li>
            <li>
              <strong>Rectify</strong> inaccurate or incomplete data.
            </li>
            <li>
              <strong>Erase</strong> your personal data (right to be forgotten).
            </li>
            <li>
              <strong>Restrict</strong> processing of your data.
            </li>
            <li>
              <strong>Object</strong> to processing based on legitimate
              interests.
            </li>
            <li>
              <strong>Data portability</strong> — receive your data in a
              structured, machine-readable format.
            </li>
            <li>
              <strong>Withdraw consent</strong> at any time where processing is
              based on consent.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{" "}
            <a
              href="mailto:hello@opiniondna.com"
              className="text-primary hover:underline"
            >
              hello@opiniondna.com
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Cookies and analytics
          </h2>
          <p>
            We use essential cookies to keep you signed in and remember your
            preferences. We also use Vercel Analytics to understand how people
            use Opinion DNA — this collects anonymised, aggregated data and does
            not use cookies for tracking.
          </p>
          <p className="mt-3">
            We do not use third-party advertising cookies or trackers.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            International transfers
          </h2>
          <p>
            Some of our service providers are based outside the United Kingdom.
            Where data is transferred internationally, we ensure appropriate
            safeguards are in place, including standard contractual clauses
            approved by the UK Information Commissioner&rsquo;s Office (ICO).
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Children&rsquo;s privacy
          </h2>
          <p>
            Opinion DNA is not intended for anyone under the age of 16. We do
            not knowingly collect personal data from children. If you believe a
            child has provided us with their data, please contact us and we will
            delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Changes to this policy
          </h2>
          <p>
            We may update this privacy policy from time to time. If we make
            significant changes, we will notify you by email or by placing a
            notice on our website. The &ldquo;Last updated&rdquo; date at the
            top of this page indicates when the policy was last revised.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Complaints
          </h2>
          <p>
            If you are unhappy with how we have handled your data, you have the
            right to lodge a complaint with the UK Information
            Commissioner&rsquo;s Office (ICO) at{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ico.org.uk
            </a>
            .
          </p>
        </section>
      </div>
    </SEOPageLayout>
  );
}
