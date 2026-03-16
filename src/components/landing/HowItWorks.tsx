import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Take the assessment",
    description:
      "Answer 179 carefully designed questions across personality, values, and meta-thinking. Takes 10-15 minutes.",
    icon: "/icons/assessment.svg",
  },
  {
    number: "2",
    title: "Get your Opinion DNA",
    description:
      "See your scores across all 48 elements, grouped into three dimensions. Compare yourself to the population.",
    icon: "/icons/dna.svg",
  },
  {
    number: "3",
    title: "Read your Personal Report",
    description:
      "Receive an AI-generated report with actionable insights for your life, relationships, and career.",
    icon: "/icons/report.svg",
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
              <div className="w-16 h-16 mx-auto mb-6">
                <Image
                  src={step.icon}
                  alt=""
                  width={64}
                  height={64}
                  className="w-full h-full opacity-60"
                />
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
