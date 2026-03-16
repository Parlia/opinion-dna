import AnimateIn from "@/components/ui/AnimateIn";

const features = [
  {
    dimension: "Personality",
    count: 12,
    color: "#00B922",
    colorLight: "#00B92210",
    description:
      "Deep traits that determine how you engage with the world. Biologically embedded and remarkably stable over a lifetime.",
    elements:
      "Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism, and the Dark Triad",
  },
  {
    dimension: "Values",
    count: 24,
    color: "#0054FF",
    colorLight: "#0054FF10",
    description:
      "Your motivational forces: beliefs animated by emotion that guide your decisions. Generally stable but shaped by culture and experience.",
    elements:
      "Moral Foundations, Cooperative Virtues, Personal Values, and Social Orientation",
  },
  {
    dimension: "Meta-Thinking",
    count: 12,
    color: "#8A00FF",
    colorLight: "#8A00FF10",
    description:
      "How your mind naturally works: where it rests, what it tends toward, the distinctive features of your mental processing.",
    elements:
      "Dogmatism, Need for Cognition, Intellectual Humility, Primal World Beliefs, and more",
  },
];

export default function Features() {
  return (
    <section id="what-it-is" className="px-6 py-24 max-w-6xl mx-auto">
      <AnimateIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-black">
            Three dimensions. 48 elements.
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            No other assessment combines personality, values, and meta-thinking
            into a single comprehensive profile.
          </p>
        </div>
      </AnimateIn>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <AnimateIn key={feature.dimension} delay={i * 100}>
            <div
              className="bg-white rounded-xl p-8 shadow-sm border border-border relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Colored top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: feature.color }}
              />
              {/* Subtle color fade on right edge */}
              <div
                className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, transparent, ${feature.color}12)`,
                }}
              />
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: feature.color }}
                >
                  {feature.count}
                </div>
                <h3 className="text-xl text-black">
                  {feature.dimension}
                </h3>
              </div>
              <p className="text-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <p className="text-sm text-muted">{feature.elements}</p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
