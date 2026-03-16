import Image from "next/image";

const universities = [
  "Royal Holloway",
  "Oxford",
  "Cambridge",
  "University of Pennsylvania",
  "NYU",
];

const press = [
  { name: "TechCrunch", logo: "/logos/techcrunch.svg", height: 24 },
  { name: "The Spectator", logo: "/logos/spectator.svg", height: 28 },
  { name: "openDemocracy", logo: "/logos/opendemocracy.svg", height: 22 },
  { name: "El País", logo: "/logos/elpais.svg", height: 26 },
  { name: "Google News Initiative", logo: "/logos/google-news-initiative.svg", height: 22 },
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

        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-8">
          As seen in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {press.map((outlet) => (
            <Image
              key={outlet.name}
              src={outlet.logo}
              alt={outlet.name}
              width={outlet.height * 6}
              height={outlet.height}
              className="opacity-40 hover:opacity-70 transition-opacity"
              style={{ height: outlet.height, width: "auto" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
