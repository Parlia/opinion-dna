const universities = [
  "Royal Holloway",
  "Oxford",
  "Cambridge",
  "University of Pennsylvania",
  "NYU",
];

const press = [
  "TechCrunch",
  "The Spectator",
  "OpenDemocracy",
  "El País",
  "Google News Initiative",
];

export default function Credibility() {
  return (
    <section className="px-6 py-16 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">
          Developed with 60+ world experts over 2+ years
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-12">
          {universities.map((uni) => (
            <span key={uni} className="text-sm text-foreground font-medium">
              {uni}
            </span>
          ))}
        </div>

        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">
          As seen in
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {press.map((outlet) => (
            <span key={outlet} className="text-sm text-muted font-medium">
              {outlet}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
