const testimonials = [
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
    <section id="testimonials" className="px-6 py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-16">
          What people are saying
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-background rounded-xl p-6 border border-border"
            >
              <p className="text-foreground leading-relaxed mb-4 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="text-sm">
                <span className="font-semibold text-black">{t.name}</span>
                <span className="text-muted ml-2">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
