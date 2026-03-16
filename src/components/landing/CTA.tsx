export default function CTA() {
  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
          backgroundSize: "300% 100%",
          animation: "gradient-shift 25s ease infinite",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to discover your mind?
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          48 dimensions of personality, values, and meta-thinking. Built with
          60+ world experts. Your complete psychographic profile in 10-15
          minutes.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-white text-primary font-bold rounded-lg text-lg hover:bg-white/90 transition-colors"
        >
          Start My Assessment &mdash; $47
        </a>
        <p className="mt-4 text-sm text-white/60">
          One-time purchase. Lifetime access.
        </p>
      </div>
    </section>
  );
}
