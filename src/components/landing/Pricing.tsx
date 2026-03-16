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
    <section id="pricing" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-black">
          Your Opinion DNA
        </h2>
        <p className="mt-4 text-lg text-muted">
          One assessment. Lifetime access to your scores and report.
        </p>
      </div>

      <div className="max-w-sm mx-auto">
        <div className="rounded-xl p-8 bg-primary text-white ring-2 ring-primary shadow-lg">
          <h3 className="text-lg font-bold text-white">{product.name}</h3>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white">{product.price}</span>
            <span className="text-sm ml-1 text-white/70">one-time</span>
          </div>
          <p className="mt-2 text-sm text-white/80">{product.description}</p>

          <ul className="mt-6 space-y-2">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="text-sm flex items-start gap-2 text-white/90"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/60" />
                {feature}
              </li>
            ))}
          </ul>

          <a
            href="/signup"
            className="mt-6 block text-center py-3 px-4 rounded-lg font-semibold text-sm transition-colors bg-white text-primary hover:bg-white/90"
          >
            {product.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
