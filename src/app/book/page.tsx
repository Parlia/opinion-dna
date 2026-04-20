import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Why We Think What We Think — The Book Behind Opinion DNA",
  description:
    "Explore the research behind Opinion DNA. 'Why We Think What We Think' by Turi Munthe reveals how genetics, geography, and biology shape our beliefs — and why we disagree.",
  alternates: { canonical: "https://www.opiniondna.com/book" },
  openGraph: {
    title: "Why We Think What We Think — The Book Behind Opinion DNA",
    description:
      "Explore the research behind Opinion DNA. By Turi Munthe, published by Penguin.",
    url: "https://www.opiniondna.com/book",
  },
};

const faq = [
  {
    question: "What is the connection between the book and Opinion DNA?",
    answer:
      "Opinion DNA grew out of the research behind the book. Turi Munthe spent years interviewing neuroscientists, psychologists, and philosophers about how beliefs form. Opinion DNA is the tool that lets you apply that research to yourself — mapping your own personality, values, and meta-thinking across 48 dimensions.",
  },
  {
    question: "Do I need to read the book to take the assessment?",
    answer:
      "No. The assessment stands on its own. But reading the book will give you a much deeper understanding of why your scores look the way they do and what the science behind each dimension reveals.",
  },
  {
    question: "Do I need to take the assessment to enjoy the book?",
    answer:
      "Not at all. The book is a standalone exploration of how human beliefs are formed. But taking your Opinion DNA assessment will make the book personal — you'll see your own mind reflected in the research.",
  },
  {
    question: "Who is Turi Munthe?",
    answer:
      "Turi Munthe is the founder of Opinion DNA and the author of 'Why We Think What We Think', published by Penguin. He has spent years researching what shapes human opinion, working with over 60 experts from Oxford, Cambridge, NYU, and UPenn.",
  },
  {
    question: "Where can I buy the book?",
    answer:
      "The book is available from Penguin, Amazon, and all major booksellers in hardcover, ebook, and audio formats.",
  },
];

export default function BookPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "The Book" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Why We Think What We Think
      </h1>
      <p className="mt-2 text-lg text-primary font-medium">
        By Turi Munthe &middot; Published by Penguin
      </p>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The research behind Opinion DNA — a deep exploration of how genetics,
        geography, history, and biology shape our beliefs, values, and the way
        we see the world.
      </p>

      <section className="mt-12 grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-3">
          <h2 className="text-2xl md:text-3xl text-black mb-6">
            The science of why we disagree
          </h2>
          <div className="space-y-4 text-foreground leading-relaxed">
            <p>
              We like to think our opinions are the product of reason and
              evidence. The truth is stranger. Our beliefs are shaped by forces
              most of us never examine — from the structure of our taste buds to
              the farming practices of our ancestors, from the density of our
              neighbourhoods to the microbes in our gut.
            </p>
            <p>
              Drawing on extensive interviews with neuroscientists, behavioural
              psychologists, social scientists, and philosophers, Turi Munthe
              traces the hidden architecture of human opinion. The result is a
              book that changes how you understand yourself, the people around
              you, and the arguments that define our time.
            </p>
            <p>
              This is the research that led to Opinion DNA — the 48-dimension
              assessment that maps your personality, values, and meta-thinking.
              Read the book to understand the science. Take the test to see it
              in yourself.
            </p>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <Image
              src="/images/book-cover.jpg"
              alt="Why We Think What We Think by Turi Munthe — book cover"
              width={325}
              height={500}
              className="mx-auto rounded-lg shadow-lg mb-6"
              priority
            />
            <p className="text-sm text-muted mb-2">
              Hardcover &middot; Ebook &middot; Audio
            </p>
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="https://www.penguin.co.uk/books/458410/why-we-think-what-we-think-by-munthe-turi/9781529153842"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-white font-semibold rounded-lg hover:bg-foreground/90 transition-colors text-sm"
              >
                Buy from Penguin
              </a>
              <a
                href="https://www.amazon.co.uk/gp/product/1529153840"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-foreground font-semibold rounded-lg border border-border hover:bg-beige-light transition-colors text-sm"
              >
                Buy on Amazon
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the book explores
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "The biology of belief",
              description:
                "How genetics, neuroscience, and physiology shape what we believe — from pain sensitivity to political orientation, from taste perception to moral intuition.",
            },
            {
              title: "The geography of opinion",
              description:
                "Why where you grew up changes how you think. How climate, population density, disease prevalence, and agricultural history leave cognitive fingerprints.",
            },
            {
              title: "The psychology of disagreement",
              description:
                "Why smart people disagree, how we construct identity from our beliefs, and what happens to our brains when someone challenges our worldview.",
            },
            {
              title: "The case for debate",
              description:
                "Why disagreement is essential for both individual growth and democratic society — and how to disagree better by understanding the forces that shape the other side.",
            },
          ].map((topic, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6"
            >
              <h3 className="text-lg text-black mb-2">{topic.title}</h3>
              <p className="text-foreground text-sm leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-6">
          What people are saying
        </h2>
        <div className="space-y-6">
          {[
            {
              quote:
                "Always fascinating but frequently mind-blowing",
              author: "Marina Hyde",
              role: "Guardian columnist",
            },
            {
              quote:
                "Provocative, wide-ranging and wonderfully written",
              author: "Prof. John Hibbing",
              role: "Author of Predisposed",
            },
          ].map((testimonial, i) => (
            <blockquote
              key={i}
              className="bg-white rounded-xl border border-border p-6"
            >
              <p className="text-foreground text-lg leading-relaxed italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted">
                <span className="font-semibold text-black">
                  {testimonial.author}
                </span>
                {" "}
                &mdash; {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl text-black">
          Read the science. Then see it in yourself.
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Take the Opinion DNA assessment and map your own personality, values,
          and meta-thinking across 48 dimensions — the same dimensions explored
          in the book.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Take My Opinion DNA &mdash; $47
          </Link>
          <a
            href="https://www.penguin.co.uk/books/458410/why-we-think-what-we-think-by-munthe-turi/9781529153842"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-foreground font-bold rounded-lg text-lg border border-border hover:bg-beige-light transition-all"
          >
            Buy the Book
          </a>
        </div>
        <p className="mt-3 text-sm text-muted">
          One-time purchase. Lifetime access. 30-day money-back guarantee.
        </p>
      </section>

      <SEOPageFAQ items={faq} pageUrl="/book" />
    </SEOPageLayout>
  );
}
