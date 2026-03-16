import Image from "next/image";
import AnimateIn from "@/components/ui/AnimateIn";

const founders = [
  {
    name: "Turi Munthe",
    title: "Creator, Opinion DNA",
    quote:
      "We believe Opinion DNA is the most precise and informative guide to how you think. Knowing your own mind is the first step towards intellectual independence.",
    image: "/images/turi-munthe.jpg",
  },
  {
    name: "J. Paul Neeley",
    title: "Creator, Opinion DNA",
    quote:
      "We engaged experts from around the world to help create the Opinion DNA. I\u2019m thrilled that this impactful psychological assessment is now available to the public. Knowing your own mind is transformative.",
    image: "/images/j-paul-neeley.jpg",
  },
];

export default function Founders() {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-4xl mx-auto">
        <AnimateIn>
          <h2 className="text-3xl md:text-4xl text-black text-center mb-16">
            Meet the creators
          </h2>
        </AnimateIn>

        <div className="grid md:grid-cols-2 gap-12">
          {founders.map((founder, i) => (
            <AnimateIn key={founder.name} delay={i * 150}>
              <div className="text-center">
                <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden ring-2 ring-[var(--border)]">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <blockquote className="text-foreground leading-relaxed italic mb-5">
                  &ldquo;{founder.quote}&rdquo;
                </blockquote>
                <p className="font-semibold text-black">{founder.name}</p>
                <p className="text-sm text-muted">{founder.title}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
