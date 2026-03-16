import AnimateIn from "@/components/ui/AnimateIn";

const product = {
  name: "Personal",
  price: "$47",
  description: "Individual psychographic assessment",
  features: [
    "48-element Opinion DNA profile",
    "Personalised AI-generated report",
    "Life & Happiness insight",
    "Relationships insight",
    "Career insight",
    "Cognitive Signature analysis",
    "Viewable online",
  ],
  cta: "Start My Assessment",
};

export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 max-w-6xl mx-auto relative overflow-hidden">
      {/* Animated gradient background — matching hero style */}
      <div className="absolute inset-0 top-[12%] -z-10 opacity-30">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background:
              "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
            backgroundSize: "300% 100%",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 20%, var(--background) 70%)",
          }}
        />
      </div>

      <AnimateIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-black">
            Your Opinion DNA
          </h2>
          <p className="mt-4 text-lg text-muted">
            One assessment. Lifetime access to your scores and report.
          </p>
        </div>
      </AnimateIn>

      <AnimateIn delay={100}>
        <div className="max-w-sm mx-auto">
          <div className="rounded-xl p-8 bg-primary text-white ring-2 ring-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow">
            <h3 className="text-lg font-bold text-white">{product.name}</h3>
            <div className="mt-3">
              <span className="text-4xl font-bold text-white">{product.price}</span>
              <span className="text-sm ml-2 text-white/70">one-time</span>
            </div>
            <p className="mt-2 text-sm text-white/80">{product.description}</p>

            <ul className="mt-6 space-y-2.5">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm flex items-start gap-2.5 text-white/90"
                >
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="mt-8 block text-center py-3.5 px-4 rounded-lg font-semibold text-sm transition-colors bg-white text-primary hover:bg-white/90"
            >
              {product.cta}
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              30-day money-back guarantee
            </p>
            <p className="text-xs text-muted/60">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
