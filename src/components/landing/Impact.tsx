const areas = [
  {
    title: "Life",
    description:
      "Understand the fundamentals of how you think: what drives your decisions about where to live, what to eat, how to vote, and where to go next.",
  },
  {
    title: "Relationships",
    description:
      "Improve communication with friends, family, and romantic partners by understanding the beliefs and worldview that sit beneath your conversations.",
  },
  {
    title: "Career",
    description:
      "Reveal the patterns behind your professional success and identify the personality, values, or meta-thinking elements that may be creating invisible barriers.",
  },
];

export default function Impact() {
  return (
    <section id="impact" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-black">
          Real life changes
        </h2>
        <p className="mt-4 text-lg text-muted">
          Your Opinion DNA gives you practical insight across three areas of
          your life.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {areas.map((area) => (
          <div key={area.title} className="text-center px-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              {area.title}
            </h3>
            <p className="text-foreground leading-relaxed">
              {area.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
