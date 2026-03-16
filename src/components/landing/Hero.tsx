export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-[300px] -z-10 opacity-30">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background:
              "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
            backgroundSize: "300% 100%",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
          }}
        />
      </div>

      <div className="px-6 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-tight">
          The most complete map of your mind available today
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          Opinion DNA maps your personality, values, and meta-thinking across 48
          dimensions to reveal why you believe what you believe, and what to do
          about it.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg text-lg hover:bg-primary/90 transition-colors"
          >
            Start My Assessment
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-foreground font-semibold rounded-lg text-lg hover:border-primary hover:text-primary transition-colors"
          >
            Learn More
          </a>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            48 dimensions
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            60+ world experts
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            10-15 minutes
          </span>
        </div>
      </div>
    </section>
  );
}
