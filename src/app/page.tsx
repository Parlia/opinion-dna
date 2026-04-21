import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatYouGet from "@/components/landing/WhatYouGet";
import Impact from "@/components/landing/Impact";
import CognitiveSignature from "@/components/landing/CognitiveSignature";
import Credibility from "@/components/landing/Credibility";
import Founders from "@/components/landing/Founders";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Opinion DNA",
  url: "https://www.opiniondna.com",
  logo: "https://www.opiniondna.com/og-image.png",
  description:
    "Opinion DNA maps your personality, values, and meta-thinking across 48 dimensions.",
  sameAs: [
    "https://www.instagram.com/opiniondna",
    "https://www.tiktok.com/@opiniondna",
    "https://x.com/opiniondna",
  ],
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Opinion DNA Personal Assessment",
  description:
    "A 48-element psychographic assessment covering personality, values, and meta-thinking with an AI-generated personal report.",
  brand: { "@type": "Brand", name: "Opinion DNA" },
  offers: {
    "@type": "Offer",
    price: "47.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://www.opiniondna.com",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How was Opinion DNA developed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "During 2020, we interviewed 60+ experts in personality, behavioral economics, evolutionary psychology, and cognition. Over three years of development with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, and NYU.",
      },
    },
    {
      "@type": "Question",
      name: "How is Opinion DNA different from other personality tests?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unlike Colors, Myers-Briggs, OCEAN, or Enneagram, Opinion DNA combines Personality, Values, and Meta-Thinking into one comprehensive profile. This gives you a complete picture of how your opinions are formed, not just your personality traits.",
      },
    },
    {
      "@type": "Question",
      name: "How long does the assessment take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The assessment takes 10-15 minutes to complete. You answer 179 questions across personality, values, and meta-thinking. Your progress is saved automatically, so you can pause and return at any time.",
      },
    },
  ],
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Static JSON-LD from hardcoded constants — no user input, safe from XSS
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={productJsonLd} />
      <JsonLd data={faqJsonLd} />
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <WhatYouGet />
        <Impact />
        <CognitiveSignature />
        <Credibility />
        <Founders />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
