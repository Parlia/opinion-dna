import AnimateIn from "@/components/ui/AnimateIn";

export default function CTA() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* Animated gradient — fades from background at top to color at bottom */}
      <div
        className="absolute inset-0 opacity-30 blur-xl"
        style={{
          background:
            "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
          backgroundSize: "300% 100%",
          animation: "gradient-shift 25s ease infinite",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <AnimateIn>
          <h2 className="text-3xl md:text-4xl text-black">
            Ready to discover your mind?
          </h2>
        </AnimateIn>
        <AnimateIn delay={100}>
          <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
            48 dimensions of personality, values, and meta-thinking. Built with
            60+ world experts. Your complete psychographic profile in 10-15
            minutes.
          </p>
        </AnimateIn>
        <AnimateIn delay={200}>
          <a
            href="/signup"
            className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Start My Assessment &mdash; $47
          </a>
          <p className="mt-4 text-sm text-muted">
            One-time purchase. Lifetime access.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
