"use client";

import { useEffect, useRef, useState } from "react";
import AnimateIn from "@/components/ui/AnimateIn";

/* ── Sample score data (static, not real user data) ── */

const sampleScores = [
  {
    code: "O",
    name: "Openness",
    score: 82,
    level: "VERY HIGH",
    levelColor: "#6F00FF",
    barColor: "#00B922",
    avg: 61,
    tooltip: "Propensity to explore new ideas, experiences, and aesthetics",
    explanation:
      "Your Openness score of 82 is well above average and puts you in the very high range. You're naturally drawn to new ideas, unusual experiences, and aesthetic depth. You probably get restless with routine, notice patterns others miss, and find intellectual exploration genuinely pleasurable. This is a classic marker of creative, curious minds. The watchout: the same drive can make mundane commitments feel heavy, so it's worth building structure that supports you without boxing you in.",
  },
  {
    code: "Sd",
    name: "Self-Direction",
    score: 76,
    level: "HIGH",
    levelColor: "#9B4DFF",
    barColor: "#00AEFF",
    avg: 58,
    tooltip: "Desire for independence in thought and action",
    explanation:
      "A score of 76 on Self-Direction means independence is one of your core values. You prefer to think things through for yourself, make your own choices, and move at your own pace. Paired with your high Openness, this suggests you're someone who charts original paths rather than following established ones. It also means you can bristle at top-down structure. The most useful thing to know: your autonomy is a strength when paired with clear self-accountability.",
  },
  {
    code: "Ih",
    name: "Intellectual Humility",
    score: 71,
    level: "HIGH",
    levelColor: "#9B4DFF",
    barColor: "#9200FF",
    avg: 52,
    tooltip: "Willingness to revise beliefs when presented with new evidence",
    explanation:
      "Intellectual Humility at 71 puts you in the high range. You can hold a strong opinion and still change your mind when the evidence warrants it. That's rarer than most people think. Combined with your Openness, this creates a powerful pattern: you're simultaneously curious and willing to be wrong. In conversation, this shows up as genuine listening. In decision-making, it shows up as not getting trapped by your first read.",
  },
  {
    code: "N",
    name: "Neuroticism",
    score: 34,
    level: "LOW",
    levelColor: "#D2691E",
    barColor: "#00C839",
    avg: 51,
    tooltip: "Tendency toward negative emotions and emotional reactivity",
    explanation:
      "A Neuroticism score of 34 is meaningfully below average. You're relatively even-keeled under pressure, recover quickly from setbacks, and don't easily catastrophize. This is protective in high-stakes situations and tends to correlate with higher life satisfaction. One subtle tradeoff: partners and friends with higher Neuroticism may read your calm as coldness during their hard moments. Naming that asymmetry helps.",
  },
];

const superpowers = [
  {
    title: "Independent Thinker",
    text: "Your high Openness (82) and Self-Direction (76) combine to make you someone who naturally questions assumptions and finds original solutions.",
  },
  {
    title: "Emotionally Grounded",
    text: "Low Neuroticism (34) with strong Emotional Reappraisal means you stay calm under pressure and recover quickly from setbacks.",
  },
  {
    title: "Growth-Oriented Learner",
    text: "High Intellectual Humility (71) signals a rare ability to change your mind when the evidence calls for it.",
  },
];

const watchouts = [
  {
    title: "Patience with Structure",
    text: "High Self-Direction can create friction in environments that require following rigid processes or deferring to hierarchy.",
  },
  {
    title: "Over-Analyzing Decisions",
    text: "Your strong Need for Cognition may lead to overthinking when quick, intuitive action is what\u2019s needed.",
  },
];

const tips = [
  {
    title: "Set Decision Deadlines",
    text: "Give yourself a time limit for important decisions to balance your analytical strengths with the need for action.",
  },
  {
    title: "Seek Opposing Views",
    text: "Your Intellectual Humility is a superpower \u2014 lean into it by actively seeking out perspectives that challenge your own.",
  },
];

/* ── Animated score bar (expandable accordion row) ── */

function ScoreBar({
  item,
  animate,
  open,
  onToggle,
}: {
  item: (typeof sampleScores)[0];
  animate: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-5 py-3 cursor-pointer hover:bg-[#FAFAF8] transition-colors" onClick={onToggle}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="min-w-7 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: item.barColor }}
          >
            {item.code}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {item.name}
            </span>
            <p className="text-xs text-[var(--muted)] truncate">{item.tooltip}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-xs text-[#aaa]">avg {item.avg}</span>
          <span className="text-base font-bold text-[var(--foreground)] w-8 text-right">
            {item.score}
          </span>
          <span
            className="text-[10px] font-bold w-16 text-right"
            style={{ color: item.levelColor }}
          >
            {item.level}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-[#bbb] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="relative h-2 bg-[var(--beige-dark)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${item.score}%` : "0%",
            backgroundColor: item.barColor,
          }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--foreground)] opacity-20"
          style={{ left: `${item.avg}%` }}
        />
      </div>
      {open && (
        <div className="mt-3 bg-[#F9F8F6] border border-[#E8E4DC] rounded-lg px-4 py-3">
          <p className="text-[13px] text-[#444] leading-relaxed">{item.explanation}</p>
        </div>
      )}
    </div>
  );
}

/* ── Insight card ── */

function InsightCard({
  title,
  text,
  bg,
  border,
  icon,
}: {
  title: string;
  text: string;
  bg: string;
  border: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-xl p-5 border transition-transform duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <p className="font-semibold text-sm text-[var(--foreground)] mb-1">
        <span className="mr-1.5">{icon}</span>
        {title}
      </p>
      <p className="text-sm text-[var(--foreground)] leading-relaxed">{text}</p>
    </div>
  );
}

/* ── Main section ── */

export default function WhatYouGet() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-6 py-24 bg-[var(--beige-light)]">
      <div className="max-w-5xl mx-auto">
        <AnimateIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-black">
              What you get
            </h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Your scores, your superpowers, your blind spots &mdash; and what
              to do about them.
            </p>
          </div>
        </AnimateIn>

        <div className="grid lg:grid-cols-2 gap-10" ref={sectionRef}>
          {/* Left: sample scores */}
          <AnimateIn>
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-white border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                  Sample scores
                </p>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {sampleScores.map((item, idx) => (
                  <ScoreBar
                    key={item.code}
                    item={item}
                    animate={animate}
                    open={openIndex === idx}
                    onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                  />
                ))}
              </div>
              <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--beige-light)]">
                <p className="text-xs text-muted text-center">
                  48 elements across personality, values &amp; meta-thinking
                </p>
              </div>
            </div>
          </AnimateIn>

          {/* Right: insight cards */}
          <div className="space-y-4">
            <AnimateIn delay={100}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Super Powers
              </p>
              <div className="space-y-3">
                {superpowers.map((sp) => (
                  <InsightCard
                    key={sp.title}
                    title={sp.title}
                    text={sp.text}
                    bg="#ECFDF5"
                    border="#A7F3D0"
                    icon="⚡"
                  />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn delay={250}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 mt-6">
                Watch Outs
              </p>
              <div className="space-y-3">
                {watchouts.map((wo) => (
                  <InsightCard
                    key={wo.title}
                    title={wo.title}
                    text={wo.text}
                    bg="#FFFBEB"
                    border="#FDE68A"
                    icon="⚠️"
                  />
                ))}
              </div>
            </AnimateIn>

            <AnimateIn delay={400}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 mt-6">
                Tips
              </p>
              <div className="space-y-3">
                {tips.map((tip) => (
                  <InsightCard
                    key={tip.title}
                    title={tip.title}
                    text={tip.text}
                    bg="#F0F7FF"
                    border="#BFDBFE"
                    icon="💡"
                  />
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </div>
    </section>
  );
}
