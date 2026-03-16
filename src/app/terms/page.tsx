import type { Metadata } from "next";
import SEOPageLayout, { Breadcrumbs } from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using Opinion DNA. Operated by Jadala Limited, United Kingdom.",
  alternates: { canonical: "https://opiniondna.com/terms" },
};

export default function TermsOfServicePage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Terms of Service
      </h1>
      <p className="mt-4 text-muted">Last updated: 16 March 2026</p>

      <div className="mt-12 space-y-10 text-foreground leading-relaxed">
        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Agreement to terms
          </h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
            Opinion DNA website and service at{" "}
            <strong>opiniondna.com</strong> (&ldquo;Service&rdquo;), operated by{" "}
            <strong>Jadala Limited</strong>, a company registered in England and
            Wales (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
          <p className="mt-3">
            By creating an account or using the Service, you agree to be bound
            by these Terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            The service
          </h2>
          <p>
            Opinion DNA provides a psychographic assessment that measures 48
            dimensions across personality, values, and meta-thinking. The Service
            includes:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>An online questionnaire to capture your responses.</li>
            <li>An AI-generated personal report based on your dimension scores.</li>
            <li>A dashboard to view and explore your results.</li>
            <li>Optional comparison reports (couples, co-founders, teams).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Accounts
          </h2>
          <p>
            You must create an account to use the Service. You are responsible
            for maintaining the security of your account credentials and for all
            activity that occurs under your account.
          </p>
          <p className="mt-3">
            You must provide accurate information when creating your account.
            You must be at least 16 years old to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Payments and refunds
          </h2>
          <p>
            Opinion DNA is a one-time purchase that grants lifetime access to
            your assessment results and report. All payments are processed
            securely by Stripe.
          </p>
          <p className="mt-3">
            We offer a <strong>30-day money-back guarantee</strong>. If you are
            not satisfied with the Service, contact us at{" "}
            <a
              href="mailto:hello@opiniondna.com"
              className="text-primary hover:underline"
            >
              hello@opiniondna.com
            </a>{" "}
            within 30 days of your purchase for a full refund.
          </p>
          <p className="mt-3">
            Prices are displayed in US dollars and include any applicable taxes.
            We reserve the right to change pricing at any time, but changes will
            not affect existing purchases.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Intellectual property
          </h2>
          <p>
            All content, branding, assessment methodology, and software
            comprising the Service are owned by Jadala Limited or its licensors
            and are protected by copyright and other intellectual property laws.
          </p>
          <p className="mt-3">
            &ldquo;Opinion DNA&rdquo; is a registered trademark of Jadala
            Limited.
          </p>
          <p className="mt-3">
            Your assessment results and personal report are provided for your
            personal use. You may share your own results, but you may not
            reproduce, distribute, or commercially exploit our assessment
            methodology, question content, or scoring algorithms.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Your content and data
          </h2>
          <p>
            You retain ownership of the responses you provide during the
            assessment. By using the Service, you grant us a licence to process
            your responses to generate your results and reports. Our use of your
            personal data is governed by our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Use the Service for any unlawful purpose.</li>
            <li>
              Attempt to reverse-engineer, scrape, or extract our assessment
              content or algorithms.
            </li>
            <li>
              Create multiple accounts to circumvent payment or abuse the
              Service.
            </li>
            <li>
              Interfere with or disrupt the Service or its infrastructure.
            </li>
            <li>
              Impersonate another person or misrepresent your affiliation with
              any entity.
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Disclaimer
          </h2>
          <p>
            Opinion DNA is a self-discovery and personal insight tool. It is{" "}
            <strong>not</strong> a clinical, diagnostic, or therapeutic service.
            Results should not be used as a substitute for professional
            psychological, medical, or counselling advice.
          </p>
          <p className="mt-3">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, either express or
            implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, Jadala Limited shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenue, whether
            incurred directly or indirectly, arising from your use of the
            Service.
          </p>
          <p className="mt-3">
            Our total liability for any claim arising from or relating to the
            Service shall not exceed the amount you paid to us in the 12 months
            preceding the claim.
          </p>
          <p className="mt-3">
            Nothing in these Terms excludes or limits our liability for death or
            personal injury caused by negligence, fraud, or any other liability
            that cannot be excluded or limited under English law.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Termination
          </h2>
          <p>
            You may delete your account at any time through your account
            settings. We may suspend or terminate your access to the Service if
            you breach these Terms.
          </p>
          <p className="mt-3">
            Upon termination, your right to use the Service ceases immediately.
            We will delete your personal data in accordance with our Privacy
            Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Changes to these terms
          </h2>
          <p>
            We may update these Terms from time to time. If we make material
            changes, we will notify you by email or by placing a notice on our
            website. Your continued use of the Service after changes are posted
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Governing law
          </h2>
          <p>
            These Terms are governed by and construed in accordance with the
            laws of England and Wales. Any disputes arising from these Terms or
            your use of the Service shall be subject to the exclusive
            jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl text-black mb-4">
            Contact us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
            <a
              href="mailto:hello@opiniondna.com"
              className="text-primary hover:underline"
            >
              hello@opiniondna.com
            </a>
            .
          </p>
        </section>
      </div>
    </SEOPageLayout>
  );
}
