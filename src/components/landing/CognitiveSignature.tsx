import AnimateIn from "@/components/ui/AnimateIn";

const traits = [
  {
    label: "How you think",
    color: "#8A00FF",
    description:
      "The shape of your reasoning — whether you lean intuitive or deliberative, concrete or abstract, fast or patient.",
  },
  {
    label: "What biases you carry",
    color: "#0054FF",
    description:
      "The tilts and shortcuts your mind reaches for. Not flaws, but patterns you can learn to recognise.",
  },
  {
    label: "How you handle disagreement",
    color: "#00B922",
    description:
      "Whether you dig in, update, or reframe — and what that predicts about the arguments you win, lose, and avoid.",
  },
];

export default function CognitiveSignature() {
  return (
    <section className="px-6 py-24 bg-[var(--beige-light)]">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em] mb-4">
              The 4th insight
            </p>
            <h2 className="text-3xl md:text-4xl text-black">
              Your <span className="italic text-primary">Cognitive Signature</span>
            </h2>
            <p className="mt-5 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Not what you believe. <em>How</em> you believe. The distinctive
              way your mind forms opinions, weighs evidence, and meets ideas
              you disagree with.
            </p>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {traits.map((trait, i) => (
            <AnimateIn key={trait.label} delay={i * 100}>
              <div className="bg-white rounded-xl p-6 border border-border h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: trait.color }}
                  />
                  <p className="text-sm font-semibold text-black">
                    {trait.label}
                  </p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {trait.description}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn delay={300}>
          <div className="bg-white rounded-2xl border border-border p-8 md:p-10 max-w-3xl mx-auto">
            <p className="text-foreground leading-relaxed">
              Most assessments stop at personality — the <em>what</em> of you.
              Opinion DNA goes further by reading your 12 meta-thinking
              dimensions together to produce your Cognitive Signature: a
              detailed portrait of how your mind actually operates. It's the
              layer most people never see in themselves, and the one that
              quietly shapes every decision, argument, and relationship you
              have.
            </p>
            <p className="mt-4 text-foreground leading-relaxed">
              Inside your report, the Cognitive Signature section names your
              mental super powers, flags the blind spots worth watching, and
              gives you practical ways to use both.
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
