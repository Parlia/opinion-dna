"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How was the Opinion DNA developed?",
    answer:
      "During 2020, we interviewed 60+ experts in personality, behavioural economics, evolutionary psychology, and cognition. Over three years of development with academic psychologists and behavioural scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, and NYU, we reviewed thousands of well-researched metrics to create the Opinion DNA.",
  },
  {
    question: "How is Opinion DNA different from other personality tests?",
    answer:
      "Unlike Colors, Myers-Briggs, OCEAN, or Enneagram, Opinion DNA combines Personality, Values, and Meta-Thinking into one comprehensive profile. This gives you a complete picture of how your opinions are formed, not just your personality traits. All questions are grounded in psychological research.",
  },
  {
    question: "How long does the assessment take?",
    answer:
      "The assessment takes 10-15 minutes to complete. You answer 179 questions across personality, values, and meta-thinking. Your progress is saved automatically, so you can pause and return at any time.",
  },
  {
    question: "Could I use Opinion DNA with my romantic partner?",
    answer:
      "Yes. Our Couples Report helps you understand each other's communication styles, approach to conflict, and shared values. You each take the individual assessment, then receive a personalised comparison report with practical tips for your relationship.",
  },
  {
    question: "Could I use Opinion DNA with my co-founder?",
    answer:
      "Yes. Our Co-Founders Report helps founders understand how they process information, handle conflict, and align on values. It includes a personal call to discuss the results and build a stronger working relationship.",
  },
  {
    question: "Could I use Opinion DNA with my team?",
    answer:
      "Yes. Our Teams Report supports team communication, innovation, and cohesion. We also offer facilitated workshops for deeper engagement. Contact us for team and company-wide pricing.",
  },
  {
    question: "Can I talk to a coach about my results?",
    answer:
      "Yes. We have coaches trained in Opinion DNA who can help you interpret your results, identify patterns, and create action plans. Coaching sessions are available for $299.",
  },
  {
    question: "Do you support academic research?",
    answer:
      "Yes. Researchers from Oxford, NYU, and other institutions are actively engaged with Opinion DNA. If you're interested in academic collaboration, we'd love to hear from you.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-20 max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-16">
        Frequently asked questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-border overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
            >
              <span className="font-semibold text-black">{faq.question}</span>
              <span className="text-muted text-xl flex-shrink-0">
                {openIndex === i ? "\u2212" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4">
                <p className="text-foreground leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
