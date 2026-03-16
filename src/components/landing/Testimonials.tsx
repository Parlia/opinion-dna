import AnimateIn from "@/components/ui/AnimateIn";

const featured = [
  {
    quote: "This is so beautiful. A window into my mind.",
    name: "Nicola B.",
    location: "London, UK",
  },
  {
    quote:
      "This is life changing. I wish I had known my Opinion DNA twenty years ago!",
    name: "Tim H.",
    location: "Denver, CO",
  },
];

const testimonials = [
  {
    quote: "This is better than 10 years of therapy. Totally crazy!",
    name: "Sarah H.",
    location: "Singapore",
  },
  {
    quote:
      "This was fun! I loved sharing it with friends and discovering how our unique perspectives can complement each other.",
    name: "Maria C.",
    location: "Las Vegas, NV",
  },
  {
    quote:
      "Opinion DNA has been a great tool for my personal growth. I've gained a deeper understanding of my mind.",
    name: "Elliott W.",
    location: "Oakland, CA",
  },
  {
    quote:
      "I loved how much my Opinion DNA got me. Much more complete than just my personality.",
    name: "Alessandra M.",
    location: "London, UK",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <h2 className="text-3xl md:text-4xl text-black text-center mb-16">
            What people are saying
          </h2>
        </AnimateIn>

        {/* Featured testimonials — larger pull-quote style */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {featured.map((t, i) => (
            <AnimateIn key={t.name} delay={i * 100}>
              <div className="bg-background rounded-xl p-8 border border-border relative">
                <span className="absolute top-4 left-6 text-5xl text-primary/15 font-serif leading-none select-none">
                  &ldquo;
                </span>
                <p className="text-xl text-foreground leading-relaxed mb-5 italic relative z-10 pt-4">
                  {t.quote}
                </p>
                <div className="text-sm">
                  <span className="font-semibold text-black">{t.name}</span>
                  <span className="text-muted ml-2">{t.location}</span>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Remaining testimonials — compact grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <AnimateIn key={t.name} delay={200 + i * 80}>
              <div className="bg-background rounded-xl p-6 border border-border h-full">
                <p className="text-foreground leading-relaxed mb-4 italic text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-sm">
                  <span className="font-semibold text-black">{t.name}</span>
                  <span className="text-muted ml-2">{t.location}</span>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
