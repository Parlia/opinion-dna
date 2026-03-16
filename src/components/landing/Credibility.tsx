import Image from "next/image";
import AnimateIn from "@/components/ui/AnimateIn";

const universities = [
  { name: "University of Oxford", logo: "/logos/oxford.png", height: 34 },
  { name: "University of Cambridge", logo: "/logos/cambridge.png", height: 36 },
  { name: "NYU", logo: "/logos/nyu.png", height: 36 },
  { name: "Royal Holloway", logo: "/logos/royal-holloway.png", height: 38 },
  { name: "University of Pennsylvania", logo: "/logos/upenn.png", height: 34 },
];

const press = [
  { name: "TechCrunch", logo: "/logos/techcrunch.png", height: 28 },
  { name: "The Spectator", logo: "/logos/spectator.png", height: 32 },
  { name: "openDemocracy", logo: "/logos/opendemocracy.png", height: 26 },
  { name: "El País", logo: "/logos/elpais.png", height: 30 },
  { name: "Google News Initiative", logo: "/logos/google-news-initiative.png", height: 26 },
];

export default function Credibility() {
  return (
    <section className="px-6 py-16 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <AnimateIn>
          <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em] mb-8">
            Developed with 60+ world experts over 2+ years
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-14">
            {universities.map((uni) => (
              <Image
                key={uni.name}
                src={uni.logo}
                alt={uni.name}
                width={uni.height * 6}
                height={uni.height}
                className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                style={{ height: uni.height, width: "auto" }}
              />
            ))}
          </div>
        </AnimateIn>

        <AnimateIn delay={100}>
          <p className="text-xs font-semibold text-muted uppercase tracking-[0.2em] mb-8">
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
                className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                style={{ height: outlet.height, width: "auto" }}
              />
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
