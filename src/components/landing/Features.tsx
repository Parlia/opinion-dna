const features = [
  {
    dimension: "Personality",
    count: 12,
    color: "#00B922",
    description:
      "Deep traits that determine how you engage with the world. Biologically embedded and remarkably stable over a lifetime.",
    elements:
      "Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism, and the Dark Triad",
  },
  {
    dimension: "Values",
    count: 24,
    color: "#0054FF",
    description:
      "Your motivational forces: beliefs animated by emotion that guide your decisions. Generally stable but shaped by culture and experience.",
    elements:
      "Moral Foundations, Cooperative Virtues, Personal Values, and Social Orientation",
  },
  {
    dimension: "Meta-Thinking",
    count: 12,
    color: "#8A00FF",
    description:
      "How your mind naturally works: where it rests, what it tends toward, the distinctive features of your mental processing.",
    elements:
      "Dogmatism, Need for Cognition, Intellectual Humility, Primal World Beliefs, and more",
  },
];

export default function Features() {
  return (
    <section id="what-it-is" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-black">
          Three dimensions. 48 elements.
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          No other assessment combines personality, values, and meta-thinking
          into a single comprehensive profile.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.dimension}
            className="bg-white rounded-xl p-8 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: feature.color }}
              />
              <h3 className="text-xl font-bold text-black">
                {feature.dimension}
              </h3>
              <span className="ml-auto text-sm font-semibold text-muted bg-beige-light px-3 py-1 rounded-full">
                {feature.count} elements
              </span>
            </div>
            <p className="text-foreground leading-relaxed mb-4">
              {feature.description}
            </p>
            <p className="text-sm text-muted">{feature.elements}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
