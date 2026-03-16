import Image from "next/image";
import AnimateIn from "@/components/ui/AnimateIn";

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
    <section id="how-it-works" className="px-6 py-24 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimateIn>
          <h2 className="text-3xl md:text-4xl text-black text-center mb-16">
            How it works
          </h2>
        </AnimateIn>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[1px] bg-border" />

          {steps.map((step, i) => (
            <AnimateIn key={step.number} delay={i * 120}>
              <div className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-6 relative z-10 bg-white rounded-full p-2">
                  <Image
                    src={step.icon}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  Step {step.number}
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
