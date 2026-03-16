export default function CTA() {
  return (
    <section className="px-6 py-20 bg-primary">
      <div className="max-w-3xl mx-auto text-center">
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
