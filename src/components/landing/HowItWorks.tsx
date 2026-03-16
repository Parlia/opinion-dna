const steps = [
  {
    number: "1",
    title: "Take the assessment",
    description:
      "Answer 179 carefully designed questions across personality, values, and meta-thinking. Takes 10-15 minutes.",
  },
  {
    number: "2",
    title: "Get your Opinion DNA",
    description:
      "See your scores across all 48 elements, grouped into three dimensions. Compare yourself to the population.",
  },
  {
    number: "3",
    title: "Read your Personal Report",
    description:
      "Receive an AI-generated report with actionable insights for your life, relationships, and career.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-16">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-black mb-3">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
