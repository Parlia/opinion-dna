import type {
  AlternativeDetail,
  ContentSection,
  FAQItem,
  HeadToHeadPage,
} from "./content-types";
import { visualDnaAlternativesPage } from "./pages/alternatives-visualdna";
import { deepPersonalityAlternativesPage } from "./pages/alternatives-deep-personality";
import { mbtiStepIIAlternativesPage } from "./pages/alternatives-mbti-step-ii";
import { truityVs16PersonalitiesPage } from "./pages/vs-truity-vs-16personalities";

export interface Competitor {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  website: string;
  dimensions: string;
  price: string;
  timeToComplete: string;
  resultType: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  notIdealFor: string;
  howItWorks: string;
  keyDifference: string;
  /** Extra long-form sections after "What is X?" (prose, links allowed). */
  sections?: ContentSection[];
  /** Dimension slugs for the "Dimensions on this page" chip block. */
  relatedDimensions?: string[];
}

export const OPINION_DNA = {
  name: "Opinion DNA",
  shortName: "Opinion DNA",
  dimensions: "48 dimensions across Personality, Values, and Meta-Thinking",
  price: "$47 one-time",
  timeToComplete: "10-15 minutes",
  resultType: "AI-generated personal report with life, career, and relationship insights",
  strengths: [
    "Combines personality, values, and meta-thinking in one assessment",
    "48 scored dimensions, each on a 0 to 100 scale",
    "AI-generated personalized report with actionable insights",
    "Developed with 60+ experts from Oxford, Cambridge, NYU, UPenn",
    "Measures thinking style: dogmatism, intellectual humility, need for cognition",
    "Population comparison for every dimension",
    "Covers life satisfaction, career, and relationships",
  ],
  bestFor: "People who want a broad, research-based picture of themselves: their personality, their values, and the thinking habits behind their opinions",
};

export const competitors: Competitor[] = [
  // 16Personalities facts checked 2026-10-08:
  // https://www.16personalities.com/articles/our-theory (five aspects: Energy, Mind, Nature, Tactics, Identity; MB-style letters plus a fifth; no Jungian concepts; reworks the Big Five; percentages show strength of preferences)
  // https://www.16personalities.com/ ("Only 10 minutes"; free type descriptions)
  // https://www.16personalities.com/premium (Premium Career Suite and Pro Suite; price shown in local currency, e.g. 29 EUR; free test "available in 49 languages")
  // Removed: "world's most popular", "~$33", "up to 50% get a different type on retake" (not on their site).
  {
    slug: "opinion-dna-vs-16personalities",
    name: "16Personalities",
    shortName: "16Personalities",
    description: "16Personalities is a free online personality test that gives you a five-letter code such as INTJ-A. The first four letters follow the Myers-Briggs format, but its own theory page says it does not use Jungian concepts and instead reworks the Big Five traits into five scales: Energy, Mind, Nature, Tactics, and Identity (Assertive or Turbulent).",
    website: "16personalities.com",
    dimensions: "5 scales, 16 types with an -A or -T suffix",
    price: "Free test; paid Premium Career Suite and Pro Suite (price varies by region)",
    timeToComplete: "About 10 minutes",
    resultType: "Five-letter type (e.g., INTJ-A) with a percentage for each scale",
    strengths: [
      "Free test with free type descriptions",
      "Beautifully designed, engaging experience",
      "Massive community and social sharing",
      "Easy-to-understand type labels",
      "Free test available in 49 languages",
    ],
    weaknesses: [
      "Sorts you into types, so someone near the middle of a scale can land on a different letter on a retake",
      "Measures personality only: no values, moral foundations, or thinking-style measurement",
      "Type labels can feel reductive, since two people with the same code can differ a lot",
      "Shares its letters with the MBTI while being a separate model, which can blur what you actually took",
    ],
    bestFor: "People who want a quick, fun personality label to share with friends",
    notIdealFor: "People seeking scientifically rigorous or comprehensive self-understanding",
    howItWorks: "You respond to a series of agree-or-disagree statements. 16Personalities scores you on five scales, shows a percentage for each, and combines them into a five-letter type with a written description.",
    keyDifference: "16Personalities gives you one of 16 types plus an Assertive or Turbulent suffix. Opinion DNA maps you across 48 continuous dimensions covering personality, values, and how your mind works, so you can see why you think the way you do.",
    relatedDimensions: ["extraversion", "openness", "agreeableness", "conscientiousness", "neuroticism"],
  },
  // MBTI facts checked 2026-10-08 on the publisher's own sites:
  // https://www.themyersbriggs.com/en-US/Products-and-Services/Myers-Briggs (Step I "sorts you into one of 16 types"; certification or education eligibility needed to purchase and administer; individuals can use MBTIonline)
  // https://www.mbtionline.com/products/for-you ($59.95 USD; "assessment and best-fit type verification process takes about 45 minutes")
  // https://www.myersbriggs.org/my-mbti-personality-type/take-the-mbti-instrument/ (online type verification "without the aid of a practitioner")
  // https://www.themyersbriggs.com/en-us/support/validity-of-the-myers-briggs-assessment (Jung's theory; Katharine Briggs and Isabel Briggs Myers; "first appeared in 1942")
  // https://www.themyersbriggs.com/en-US/Access-Resources/All-About-the-MBTI-Assessment (measures preferences, not performance; can't predict job performance or tell companies who to hire)
  // https://www.themyersbriggs.com/en-US/Access-Resources/Articles/the-mbti-step-ii-assessment (Step II: five facets per preference pair, 20 in total)
  // Removed as unverifiable: "$50-150+", "requires certified practitioner" (for individuals), "poor test-retest reliability documented in multiple studies".
  {
    slug: "opinion-dna-vs-myers-briggs",
    name: "Myers-Briggs Type Indicator (MBTI)",
    shortName: "MBTI",
    description: "The Myers-Briggs Type Indicator (MBTI) is the original 16-type personality assessment. Katharine Briggs and her daughter Isabel Briggs Myers built it from Carl Jung's theory of psychological type, and its publisher, The Myers-Briggs Company, dates the first version to 1942. Individuals can take the official assessment online through MBTIonline; organizations use it through certified practitioners.",
    website: "themyersbriggs.com",
    dimensions: "4 preference pairs, 16 types",
    price: "$59.95 on MBTIonline (as of October 2026)",
    timeToComplete: "About 45 minutes online, including type verification",
    resultType: "Four-letter type, verified online or in a practitioner feedback session",
    strengths: [
      "Decades of organizational use and a large certified practitioner network",
      "A built-in step for confirming your best-fit type, online or with a practitioner",
      "Career and team versions on MBTIonline, plus an official Step II with 20 facets",
      "Shared vocabulary that many workplaces already know",
    ],
    weaknesses: [
      "Sorts you into one of 16 types, so someone near the middle of a scale can land on a different letter on another day",
      "Measures personality preferences only, not values, moral intuitions, or reasoning style",
      "Its publisher says it doesn't measure performance and can't predict job performance",
      "Organizations need certification or education eligibility to buy and administer it",
      "Built on Jung's type theory, while most academic personality research uses trait models such as the Big Five",
    ],
    bestFor: "Teams and organizations that already speak MBTI, and people who want the official version of the 16-type framework with a verified best-fit type.",
    notIdealFor: "People who want continuous scores on many traits, or one profile that covers values and thinking style alongside personality.",
    howItWorks: "You answer the official questionnaire and get a four-letter type built from four preference pairs: Extraversion or Introversion, Sensing or Intuition, Thinking or Feeling, and Judging or Perceiving. On MBTIonline you then confirm your best-fit type through a self-guided process. Through a certified practitioner, that confirmation happens in a feedback session.",
    keyDifference: "MBTI sorts you into one of 16 types built from four preference pairs. Opinion DNA gives you continuous 0 to 100 scores on 48 dimensions, benchmarked against population averages, including values, moral foundations, and thinking patterns that MBTI doesn't set out to measure.",
    sections: [
      {
        heading: "Types versus scores: the core design difference",
        content: "The MBTI is a type instrument. Its publisher describes Step I as sorting you into one of 16 types, and the official process ends with you confirming the four letters that fit best. That design is the point: a type is easy to remember, easy to share with a team, and easy to build a workshop around.\n\nOpinion DNA is a trait instrument. Every result is a 0 to 100 score benchmarked against population averages, so two people who would share an MBTI letter can still sit at visibly different places on, say, [extraversion](/dimensions/extraversion) or [openness](/dimensions/openness). Nobody gets rounded to the nearest letter.\n\nThe second difference is scope. MBTI measures personality preferences. Opinion DNA's 179 questions cover 12 personality dimensions, including the Big Five (with [neuroticism](/dimensions/neuroticism), which no MBTI letter targets) and the Dark Triad, plus 24 values such as [care](/dimensions/care) and [self-direction](/dimensions/self-direction), and 12 meta-thinking dimensions such as [intellectual humility](/dimensions/intellectual-humility). It takes about 10 to 15 minutes and costs $47 once.",
      },
      {
        heading: "Weighing more than these two tests?",
        content: "If you are deciding between the MBTI and a whole field of options, our guide to [MBTI alternatives](/alternatives/myers-briggs-alternatives) sorts them into tests like Myers-Briggs (for people who like types) and trait-based tests (for people who want scores), and explains where 16Personalities' -A and -T suffixes come from. If you already know you want to go past four letters, [this overview of tests beyond Myers-Briggs](/tests/beyond-myers-briggs) walks through what a broader profile covers.",
      },
    ],
    relatedDimensions: ["extraversion", "openness", "neuroticism", "care", "self-direction", "intellectual-humility"],
  },
  {
    slug: "opinion-dna-vs-enneagram",
    name: "Enneagram",
    shortName: "Enneagram",
    description: "The Enneagram is a personality framework that identifies nine core types, each driven by a fundamental motivation or fear. Popular in spiritual and personal growth communities, it emphasizes emotional patterns and paths for development.",
    website: "enneagraminstitute.com",
    dimensions: "9 types with wings and subtypes",
    price: "Free (basic tests) / $12-60 for detailed reports",
    timeToComplete: "10-20 minutes",
    resultType: "Core type number (1-9) with wing, subtype, and growth paths",
    strengths: [
      "Deep focus on core motivations and fears",
      "Strong personal growth framework",
      "Active spiritual and self-development community",
      "Useful for understanding emotional patterns",
      "Growth and stress paths for each type",
    ],
    weaknesses: [
      "Limited empirical validation in peer-reviewed research",
      "Rooted in spiritual tradition, not behavioral science",
      "Only 9 categories for all human personality",
      "No measurement of values, political views, or cognitive biases",
      "Self-typing can be unreliable",
      "Lacks population-level comparison data",
    ],
    bestFor: "People drawn to spiritual growth and understanding their core emotional motivations",
    notIdealFor: "People who want research-backed, multi-dimensional assessment beyond core type",
    howItWorks: "You answer questions or self-identify with descriptions of nine types. Each type is defined by a core motivation and core fear. Advanced versions include wings (adjacent types) and subtypes.",
    keyDifference: "The Enneagram gives you one core type based on motivation. Opinion DNA measures 48 dimensions across personality, values, and meta-thinking with peer-reviewed scales — giving you the full picture, not just your emotional core.",
    relatedDimensions: ["neuroticism", "achievement", "security", "benevolence", "self-direction", "intolerance-for-uncertainty"],
  },
  {
    slug: "opinion-dna-vs-big-five",
    name: "Big Five Personality Test",
    shortName: "Big Five",
    description: "The Big Five (also called OCEAN) is the most scientifically validated personality model, measuring Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Multiple versions exist online, from academic to commercial.",
    website: "Various (Truity, IPIP, etc.)",
    dimensions: "5 personality traits",
    price: "Free (basic) / $20-40 for paid versions",
    timeToComplete: "5-15 minutes",
    resultType: "Scores on five personality dimensions",
    strengths: [
      "Most scientifically validated personality model",
      "Strong cross-cultural reliability",
      "Decades of academic research backing",
      "Continuous scores, not binary types",
      "Widely used in psychological research",
    ],
    weaknesses: [
      "Only measures personality — not values, morals, or thinking patterns",
      "Five dimensions can feel incomplete for deep self-understanding",
      "Free versions often lack personalized interpretation",
      "No measurement of Dark Triad, moral foundations, or cognitive biases",
      "Basic results without actionable life insights",
    ],
    bestFor: "People who want a scientifically solid personality baseline",
    notIdealFor: "People who want to understand their complete psychological profile including values and thinking patterns",
    howItWorks: "You rate how much you agree with statements about your behavior and preferences. Your responses are scored on five continuous scales from low to high for each trait.",
    keyDifference: "The Big Five measures 5 personality traits — a solid foundation. Opinion DNA includes all five Big Five traits plus 43 more dimensions covering values, moral foundations, cooperative virtues, and meta-thinking. It's the Big Five and beyond.",
    sections: [
      {
        heading: "The five Big Five traits in Opinion DNA",
        content: "Opinion DNA scores all five Big Five traits on the same 0 to 100 scale it uses for everything else: [openness](/dimensions/openness), [conscientiousness](/dimensions/conscientiousness), [extraversion](/dimensions/extraversion), [agreeableness](/dimensions/agreeableness), and [neuroticism](/dimensions/neuroticism). Each one has its own page explaining what high and low scores look like.\n\nThe other 43 dimensions sit next to them. The Dark Triad, such as [Machiavellianism](/dimensions/machiavellianism), extends the personality layer, while the values and meta-thinking layers cover what you care about and how you reason, which is where Big Five scores tend to leave people with follow-up questions.",
      },
    ],
    relatedDimensions: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "machiavellianism"],
  },
  {
    slug: "opinion-dna-vs-truity",
    name: "Truity",
    shortName: "Truity",
    // Truity facts checked 2026-10-08:
    // https://www.truity.com/ (tests: Enneagram, TypeFinder, Big Five, Career, Love Styles, DISC)
    // https://www.truity.com/test/type-finder-personality-test-new (based on Myers and Briggs' theory, "not the same as the MBTI"; no affiliation with MBTI's publishers; 130 questions, 10 to 15 minutes; full report for "a small fee")
    // https://www.truity.com/test/big-five-personality-test (60 questions, 5 to 10 minutes; full report for "a small fee")
    // https://www.truity.com/test/enneagram-personality-test (about 105 questions, 10 to 15 minutes)
    // https://www.truity.com/test/disc-personality-test (38 questions, about 5 minutes)
    // Removed: "$29-79" (no price shown), "No AI-generated insights", "template-driven", "combined cost exceeds Opinion DNA", "one of the largest".
    description: "Truity offers a range of separate online personality tests, including the Enneagram, the Big Five, DISC, and TypeFinder, its 16-type test. Truity says TypeFinder is based on Myers and Briggs' theory but is not the MBTI and that it has no affiliation with the MBTI's publishers. Basic results are free, and each full report costs extra.",
    website: "truity.com",
    dimensions: "Varies by test (4 DISC styles, 5 Big Five traits, 9 Enneagram types, 16 TypeFinder types)",
    price: "Free basic results; each full report for a fee",
    timeToComplete: "About 5 to 15 minutes per test",
    resultType: "Type or trait scores with optional paid detailed report",
    strengths: [
      "Multiple test options (Big Five, Enneagram, DISC, TypeFinder)",
      "Professional design and user experience",
      "Free basic results on its main tests",
      "Publishes technical documentation for its tests",
      "Team versions through its Truity@Work platform",
    ],
    weaknesses: [
      "Each test is separate, so there is no unified profile",
      "Must take multiple tests to approach Opinion DNA's breadth",
      "Its main tests don't score moral foundations or meta-thinking",
      "Each full report is a separate purchase",
    ],
    bestFor: "People who want to pick and choose between established personality frameworks",
    notIdealFor: "People who want one comprehensive assessment that covers personality, values, and thinking in a single profile",
    howItWorks: "You choose from several personality tests (TypeFinder, Big Five, Enneagram, DISC, etc.). Each test gives separate results. Premium reports are available per test for additional cost.",
    keyDifference: "Truity offers separate tests for separate frameworks. Opinion DNA gives you one assessment that covers personality (including Big Five), values (including moral foundations), and meta-thinking — all in one unified 48-dimension profile.",
    relatedDimensions: ["openness", "conscientiousness", "neuroticism", "achievement", "care", "need-for-cognition"],
  },
  {
    slug: "opinion-dna-vs-disc",
    name: "DISC Assessment",
    shortName: "DISC",
    description: "DISC measures four behavioral styles: Dominance, Influence, Steadiness, and Conscientiousness. It's widely used in corporate training, team building, and sales coaching.",
    website: "discprofile.com",
    dimensions: "4 behavioral styles",
    // https://www.truity.com/test/disc-personality-test (free; 38 questions, about 5 minutes), https://www.everythingdisc.com/ (no prices listed), checked 2026-10-08
    price: "Varies by publisher (Truity's DISC test is free)",
    timeToComplete: "Varies by publisher (Truity's takes about 5 minutes)",
    resultType: "DISC style profile with behavioral tendencies",
    strengths: [
      "Simple, easy-to-understand framework",
      "Excellent for workplace communication training",
      "Widely recognized in corporate settings",
      "Practical application for team dynamics",
      "Quick to administer and interpret",
    ],
    weaknesses: [
      "Only 4 dimensions — very limited scope",
      "Workplace-focused, limited personal insight",
      "No measurement of values, morals, or thinking patterns",
      "Publishers label and score the four letters differently, so results don't always transfer",
      "Can feel overly simplistic for deep self-understanding",
    ],
    bestFor: "Corporate teams focused on improving workplace communication styles",
    notIdealFor: "Individuals seeking comprehensive personal insight beyond workplace behavior",
    howItWorks: "You answer questions about how you respond to challenges, influence others, maintain pace, and follow rules. Your responses generate a profile across four behavioral dimensions.",
    keyDifference: "DISC measures 4 workplace behaviors. Opinion DNA measures 48 dimensions — personality, values, moral foundations, thinking patterns, life satisfaction, and more — giving you insight into your whole self, not just your office behavior.",
    relatedDimensions: ["extraversion", "agreeableness", "conscientiousness", "achievement", "power"],
  },
  {
    slug: "opinion-dna-vs-gallup-strengthsfinder",
    name: "Gallup CliftonStrengths",
    shortName: "CliftonStrengths",
    description: "CliftonStrengths (formerly StrengthsFinder) identifies your top talent themes from a list of 34. Developed by Gallup, it's focused on identifying what you naturally do best for career and leadership development.",
    website: "gallup.com/cliftonstrengths",
    dimensions: "34 strength themes (top 5 or all 34)",
    price: "$25 (top 5) / $60 (all 34)",
    // https://www.gallup.com/cliftonstrengths/en/252137/home.aspx ("30-minute assessment" of paired statements, checked 2026-10-08)
    timeToComplete: "About 30 minutes",
    resultType: "Ranked list of strength themes with development suggestions",
    strengths: [
      "Strong focus on positive capabilities",
      "Well-researched by Gallup over decades",
      "Excellent for career and leadership development",
      "34 nuanced talent themes",
      "Large coaching ecosystem",
    ],
    weaknesses: [
      "Strengths-only focus — doesn't address blind spots or challenges",
      "No measurement of values, morals, or thinking patterns",
      "Longer assessment (about 30 minutes)",
      "Career-focused, limited personal life application",
      "Rankings can change significantly on retake",
      "No AI-generated personalized narrative",
    ],
    bestFor: "Professionals and leaders focused on leveraging their natural talents at work",
    notIdealFor: "People who want complete self-understanding including values, biases, and thinking patterns",
    howItWorks: "You respond to 177 paired statements under time pressure, choosing which describes you better. Gallup ranks your 34 talent themes and highlights your top 5 (or all 34 with the premium version).",
    keyDifference: "CliftonStrengths focuses exclusively on your talents for career development. Opinion DNA maps your entire psychological landscape — personality, values, moral foundations, cognitive biases, and thinking patterns — with an AI-generated report covering life, career, and relationships.",
    relatedDimensions: ["achievement", "power", "self-direction", "stimulation", "benevolence"],
  },
  {
    slug: "opinion-dna-vs-via-character-strengths",
    name: "VIA Character Strengths",
    shortName: "VIA",
    description: "The VIA Character Strengths Survey identifies your top character strengths from 24 possibilities, organized under 6 virtues. Developed by positive psychology researchers Martin Seligman and Christopher Peterson.",
    website: "viacharacter.org",
    dimensions: "24 character strengths under 6 virtues",
    price: "Free (basic) / $20-50 for detailed reports",
    timeToComplete: "15-20 minutes",
    resultType: "Ranked list of 24 character strengths",
    strengths: [
      "Grounded in positive psychology research",
      "Free basic results",
      "Focuses on character and virtue — uplifting framing",
      "24 nuanced strength categories",
      "Cross-cultural validation research",
    ],
    weaknesses: [
      "Character strengths only — not personality traits or thinking patterns",
      "No Big Five, no values measurement, no cognitive biases",
      "Rankings can feel arbitrary (is Creativity really your #3?)",
      "Limited actionable insights without coaching",
      "No AI-personalized report",
      "Strengths framing misses important self-awareness areas",
    ],
    bestFor: "People interested in positive psychology and character development",
    notIdealFor: "People seeking a complete map of personality, values, and thinking beyond character virtues",
    howItWorks: "You rate how much each statement describes you. The survey ranks your 24 character strengths from highest to lowest. Premium reports offer more detailed interpretation.",
    keyDifference: "VIA measures 24 character strengths through a positive psychology lens. Opinion DNA measures 48 dimensions across personality (Big Five + Dark Triad), values (moral foundations + cooperative virtues), and meta-thinking (cognitive biases + world beliefs) — a far more complete picture.",
    relatedDimensions: ["care", "fairness", "benevolence", "universalism", "self-direction", "tradition"],
  },
];

export interface AlternativePage {
  slug: string;
  /** Used in "Why look for X alternatives?" and hub/chip labels. */
  competitorName: string;
  /** H1 (and <title> unless seoTitle is set). */
  title: string;
  /** Absolute <title>, no brand suffix added. Under 60 chars. */
  seoTitle?: string;
  /** Meta description and lede under the H1. Plain text. */
  description: string;
  /** Prose rendered after the lede (links allowed). */
  intro?: string;
  whySwitch: string[];
  /** Keys into the shared lookup in alternatives/[slug]/page.tsx, or inline cards. */
  alternatives: (string | AlternativeDetail)[];
  /** Long-form sections rendered after the alternatives list. */
  sections?: ContentSection[];
  /** Replaces the generic FAQ when present. */
  faq?: FAQItem[];
  /** Explicit /vs/* page to link (otherwise matched by competitor name). */
  vsSlug?: string;
  /** Dimension slugs for the "Dimensions on this page" chip block. */
  relatedDimensions?: string[];
  /** Bottom CTA destination (default /signup). */
  ctaHref?: string;
}

const baseAlternativePages: AlternativePage[] = [
  {
    slug: "16personalities-alternatives",
    competitorName: "16Personalities",
    title: "Best 16Personalities Alternatives in 2026",
    description: "Looking for a more comprehensive personality test than 16Personalities? Compare the best alternatives that go beyond 16 types to map your complete psychological profile.",
    whySwitch: [
      "It sorts you into one of 16 types, so someone near the middle of a scale can land on a different letter on a retake",
      "Binary categories (Thinking vs. Feeling) don't reflect the spectrum of human personality",
      "No measurement of your values, moral foundations, or thinking patterns",
      "Free results are surface-level, and even premium profiles stay within the 16-type framework",
    ],
    alternatives: ["opinion-dna", "truity", "big-five", "enneagram", "via"],
    relatedDimensions: ["extraversion", "openness", "agreeableness", "conscientiousness", "neuroticism"],
  },
  // MBTI hub sources, checked 2026-10-08:
  // https://www.themyersbriggs.com/en-US/Products-and-Services/Myers-Briggs (Step I sorts you into one of 16 types; Step II is "slightly longer", five facets per letter; certification or education eligibility to purchase and administer)
  // https://www.mbtionline.com/products/for-you ($59.95 USD; about 45 minutes including best-fit type verification)
  // https://www.myersbriggs.org/my-mbti-personality-type/take-the-mbti-instrument/ (online verification without a practitioner; optional follow-up with an MBTI professional)
  // https://www.themyersbriggs.com/en-US/Access-Resources/All-About-the-MBTI-Assessment (can't measure or predict job performance or tell companies who to hire)
  // https://www.themyersbriggs.com/en-US/Access-Resources/Articles/the-mbti-step-ii-assessment (20 facets, builds on Step I, certified practitioners are certified for Step II, "out-of-preference" results)
  // https://www.themyersbriggs.com/-/media/myers-briggs/files/sample-reports/smp262149.pdf (Step II sample report: in-preference, midzone, out-of-preference)
  // https://www.16personalities.com/articles/our-theory (five aspects incl. Identity; extra letter added to the MB-style code; no Jungian concepts; reworks the Big Five)
  // https://www.16personalities.com/articles/identity-assertive-vs-turbulent (Assertive vs Turbulent definitions)
  // https://www.truity.com/test/type-finder-personality-test-new (TypeFinder: based on Myers and Briggs' theory but not the MBTI; 130 questions; 23 facets; free brief report)
  // https://www.enneagraminstitute.com/how-the-enneagram-system-works (nine types, wings)
  // McCrae and Costa (1989), "Reinterpreting the Myers-Briggs Type Indicator from the perspective of the five-factor model of personality", Journal of Personality 57(1).
  {
    slug: "myers-briggs-alternatives",
    competitorName: "Myers-Briggs (MBTI)",
    title: "MBTI Alternatives: The Best Myers-Briggs Alternatives in 2026",
    seoTitle: "MBTI Alternatives: Better Tests Than Myers-Briggs (2026)",
    description: "MBTI alternatives compared: tests like Myers-Briggs for people who like types, trait tests with real scores, what -A and -T mean, and a 48-dimension option.",
    intro: "People look for an alternative to the MBTI for three different reasons, and each one points to a different test. Some like the four-letter language and want a free or more detailed version of it. Some want a score on each trait, which a type can't give them. And some have outgrown personality tests altogether and want to know what they value and how they reason.\n\nIt helps to know what the official Myers-Briggs actually is before replacing it. The Myers-Briggs Type Indicator is published by The Myers-Briggs Company. Individuals can take it online through MBTIonline, which listed its individual version at $59.95 as of October 2026 and says the assessment plus best-fit type verification takes about 45 minutes. Organizations buy and administer it through certified practitioners. Step I gives you one of 16 types; Step II, covered below, breaks each letter into five facets.\n\nThis guide sorts the alternatives by what you want from them: tests like Myers-Briggs that keep the types, trait-based tests that replace them with scores, and broader assessments that add values and thinking style. Along the way it explains a question that sends many people here: where the -A and -T at the end of a 16Personalities type come from, and why the official MBTI doesn't have them.",
    whySwitch: [
      "It sorts you into one of 16 types, so someone near the middle of a scale can land on a different letter on another day",
      "It measures personality preferences only, not values, moral intuitions, or how you reason",
      "Its theory comes from Carl Jung's work on psychological type, while most academic personality research now uses trait models such as the Big Five",
      "The official version is a paid product, and organizations need certified practitioners or education eligibility to administer it",
      "Its publisher says it can't measure or predict job performance, so it is the wrong tool for some workplace decisions",
    ],
    alternatives: [
      "opinion-dna",
      "16personalities",
      {
        name: "Truity TypeFinder",
        description: "Truity's 16-type test. Truity says it is based on Myers and Briggs' theory but is not the same as the MBTI assessment. It scores four dimensions of type plus 23 more detailed facets across 130 questions.",
        dimensions: "4 dimensions, 23 facets, 16 types",
        bestFor: "People who like the 16-type language and want facet-level detail, with a free brief report before you pay for the full one.",
        website: "truity.com",
      },
      "big-five",
      "enneagram",
      "disc",
    ],
    sections: [
      {
        heading: "Tests like Myers-Briggs: MBTI alternatives that keep the types",
        content: "If the part of the MBTI you liked was the type itself, a short code that summarizes you and gives you a vocabulary for other people, there are three well-known tests built the same way.\n\n### 16Personalities\n\nIts codes look like MBTI types (INTJ, ENFP) with a fifth letter added, which is why many people assume it is the Myers-Briggs. Its own theory page is clear that it is a different model: it does not use Jungian concepts, and it describes its five scales as a reworking of the Big Five. The test is free.\n\n### Truity TypeFinder\n\nTruity says TypeFinder is based on Myers and Briggs' theory but is not the MBTI assessment. It runs 130 questions and reports four dimensions of type plus 23 facets, so you see more texture inside your four letters. The brief report is free and the full report is paid.\n\n### The Enneagram\n\nA different type system entirely: nine types, each with a neighboring wing that colors it. People who enjoy the MBTI often find the Enneagram more useful for motivation and stress. Our [Enneagram alternatives guide](/alternatives/enneagram-alternatives) and [Opinion DNA vs the Enneagram](/vs/opinion-dna-vs-enneagram) cover its tradeoffs.\n\nAll three keep the strength of a type (it is memorable) and its cost (two people with the same code can differ a lot). If that tradeoff is fine for you, any of them will feel familiar.",
      },
      {
        heading: "Trait-based Myers-Briggs alternatives: scores instead of letters",
        content: "The other family of MBTI alternatives drops types altogether. A trait test gives you a position on each scale, so a mild introvert and a strong introvert get different results instead of the same letter.\n\nThe standard here is the Big Five, the model most academic personality research uses. It also happens to overlap with the MBTI more than people expect. In a well-known 1989 paper, Robert McCrae and Paul Costa compared the two and found that four MBTI scales lined up with four Big Five traits: Extraversion-Introversion with [extraversion](/dimensions/extraversion), Sensing-Intuition with [openness](/dimensions/openness), Thinking-Feeling with [agreeableness](/dimensions/agreeableness), and Judging-Perceiving with [conscientiousness](/dimensions/conscientiousness). The fifth trait, [neuroticism](/dimensions/neuroticism), had no MBTI counterpart. That gap matters for the -A and -T question below.\n\nSo a Big Five test is, roughly, the MBTI measured as continuous scores, plus the emotional dimension the MBTI leaves out. Free versions based on public item pools are easy to find, and paid versions add interpretation. If you want the five traits with a written report, see [our Big Five test page](/tests/big-five-test-with-report).",
      },
      {
        heading: "A vs T in MBTI types: assertive and turbulent come from 16Personalities",
        content: "If your type reads INFJ-T or ENTP-A, the suffix did not come from the Myers-Briggs. The official MBTI reports four letters. The -A or -T is the fifth scale of 16Personalities, which it calls Identity. 16Personalities explains that its codes borrow the Myers-Briggs letter format and add one extra letter for this fifth scale.\n\nAccording to 16Personalities:\n\n- Assertive (-A) people are self-assured, even-tempered, and resistant to stress. Their confidence comes from within.\n- Turbulent (-T) people are self-conscious and sensitive to stress, more responsive to outside influence, and prone to self-doubt. They also tend to be perfectionistic, success-driven, and eager to improve.\n\nThe site presents Identity as a scale that underpins the other four, and it describes an upside at each end: calm for the Assertive, and for the Turbulent, self-doubt that works as a motivator.\n\nIf that description sounds like a familiar trait, it should. Stress sensitivity, self-consciousness, and emotional reactivity are the core of [neuroticism](/dimensions/neuroticism), the Big Five trait that the MBTI has no scale for. 16Personalities doesn't use that label, and its scale is its own, so treat the comparison as a resemblance. Still, it explains why the A or T letter often feels more revealing than the four letters before it: it reaches for the one major trait the original four leave out.\n\nOne caution. Because A and T is a single either-or split, it hides how you handle stress once it arrives. Opinion DNA scores neuroticism on a 0 to 100 scale and separately measures [emotional reappraisal](/dimensions/emotional-reappraisal) and [suppression tendency](/dimensions/suppression-tendency), so you can see whether you feel things strongly, and also what you do about it.",
      },
      {
        heading: "MBTI Step II: the official, more detailed Myers-Briggs",
        content: "Before switching tests, it is worth knowing that the publisher already sells a more granular MBTI. The Myers-Briggs Company describes Step II as a slightly longer version of the questionnaire that starts from your Step I type and splits each of the four preference pairs into five facets, 20 in total. Extraversion-Introversion, for example, breaks into facets such as Initiating-Receiving and Gregarious-Intimate.\n\nThe practical gain is nuance inside your type. In the publisher's sample reports, each facet result is marked in-preference, midzone, or out-of-preference, so an extravert who is reserved in one specific way can see exactly where. Step II is aimed at practitioners: the publisher notes that certified MBTI practitioners are already certified to use it.\n\nStep II still describes you within the 16-type framework. If you want facet-level detail without the types, or want your values measured too, our guide to [MBTI Step II alternatives](/alternatives/mbti-step-ii-alternatives) compares the options.",
      },
      {
        heading: "Choosing a personality test other than MBTI",
        content: "Most lists of MBTI alternatives rank tests by accuracy, which is hard to judge from the outside. Four plainer questions sort them faster.\n\n- Do you want a type or a score? Types are easier to share. Scores show how far you lean.\n- What should it measure? Personality only, or also what you value and how you reason?\n- What do you get free, and what does the full version cost?\n- Who explains the results? A practitioner, a written report, or a label and a few paragraphs?\n\nThe table puts the main options side by side, using what each publisher states on its own site.",
        table: {
          columns: ["Test", "Result", "What it covers", "Cost"],
          rows: [
            ["Official MBTI (MBTIonline)", "Four-letter type", "Personality preferences", "$59.95"],
            ["16Personalities", "Five-letter type ending in -A or -T", "Five personality scales", "Free test"],
            ["Truity TypeFinder", "16 types with 23 facets", "Personality type", "Free brief report, paid full report"],
            ["Big Five tests", "Five trait scores", "Personality traits", "Many free versions"],
            ["Enneagram tests", "One of nine types, plus a wing", "Type centered on motivation", "Varies by publisher"],
            ["Opinion DNA", "48 scores from 0 to 100", "Personality, values, and meta-thinking", "$47 one-time"],
          ],
          note: "Details from each publisher's own website, checked October 2026. Prices change, so confirm before buying.",
        },
      },
      {
        heading: "When the official Myers-Briggs is still the right choice",
        content: "There are good reasons to stay with the MBTI. If your team already shares its vocabulary, switching tests means relearning a language that works. The official version also includes a step most alternatives skip: you confirm your best-fit type, either through MBTIonline's self-guided process or in a session with a certified practitioner, which catches results that don't feel right.\n\nIts publisher is also direct about the limits. It says the MBTI measures preferences, can't measure or predict job performance, and can't tell a company who to hire. If you need a tool for team conversations, the MBTI and several alternatives can do that job. If you need to understand how a group's values and working styles fit together, see [personality tools for teams and leadership](/for/teams-and-leadership) or [Opinion DNA for teams](/teams).",
      },
      {
        heading: "Beyond MBTI and Myers-Briggs: measuring values and thinking style",
        content: "The tests above are mainly about personality: how you tend to act and feel. They don't score your moral intuitions or how you handle evidence and uncertainty, and those are often the questions people were trying to answer when they first took a Myers-Briggs test.\n\nOpinion DNA measures 48 dimensions in three layers. Twelve are personality, including the Big Five and the Dark Triad. Twenty-four are values, from moral foundations such as [fairness](/dimensions/fairness) to personal values such as [achievement](/dimensions/achievement). Twelve are meta-thinking, such as [need for cognition](/dimensions/need-for-cognition) and [intolerance for uncertainty](/dimensions/intolerance-for-uncertainty). Every dimension is a 0 to 100 score benchmarked against the population, and an AI-generated report reads them together across personality, values, career, and relationships.\n\nIt is 179 questions, about 10 to 15 minutes, $47 once, with a 30-day money-back guarantee. If you want the head-to-head first, read [Opinion DNA vs MBTI](/vs/opinion-dna-vs-myers-briggs). If you are ready, start [the full assessment](/personal-assessment).",
      },
    ],
    faq: [
      {
        question: "What is the best alternative to the MBTI?",
        answer: "It depends on what you want to keep. If you like types, 16Personalities and Truity's TypeFinder are the closest tests like Myers-Briggs, and the Enneagram is a different type system many MBTI fans enjoy. If you want scores instead of letters, a Big Five test is the research standard. If you want personality plus values and thinking style in one profile, Opinion DNA measures 48 dimensions, including the five traits the Big Five covers.",
      },
      {
        question: "Is there a free alternative to the Myers-Briggs test?",
        answer: "Yes. 16Personalities is free, Truity's TypeFinder gives a free brief report with a paid full report, and many free Big Five tests exist. The official MBTI is a paid product: MBTIonline listed its individual version at $59.95 as of October 2026. Free tests that use four-letter codes are separate tests from separate publishers, even when the letters look the same.",
      },
      {
        question: "What does -A or -T mean at the end of an MBTI type?",
        answer: "It comes from 16Personalities, not from the official MBTI, which reports four letters. The fifth letter is 16Personalities' Identity scale: Assertive (-A) types are self-assured and resistant to stress, while Turbulent (-T) types are more self-conscious, sensitive to stress, and driven to improve. It closely resembles the Big Five trait [neuroticism](/dimensions/neuroticism), which no MBTI scale measures. The full explanation is in the A vs T section above.",
      },
      {
        question: "Is 16Personalities the same as the Myers-Briggs?",
        answer: "No. 16Personalities borrows the Myers-Briggs letter format, but its own theory page says it does not use Jungian concepts and that its five scales rework the Big Five traits. The official MBTI is published by The Myers-Briggs Company and sold through MBTIonline and certified practitioners. For a three-way look at popular online tests, see [Truity vs 16Personalities vs Dimensional](/vs/truity-vs-16personalities).",
      },
      {
        question: "What is MBTI Step II?",
        answer: "Step II is the publisher's longer version of the MBTI. It keeps your four-letter type and adds five facets under each preference pair, 20 in total, so you can see where you differ from others of the same type. It is aimed at certified practitioners. Our [MBTI Step II alternatives](/alternatives/mbti-step-ii-alternatives) page covers other ways to get that level of detail.",
      },
      {
        question: "Can I take the official MBTI without a practitioner?",
        answer: "Yes. MBTIonline, run by the publisher, lets individuals take the official assessment and confirm their best-fit type through a self-guided process, which it says takes about 45 minutes in total. The Myers & Briggs Foundation suggests that people who go this route may still want a follow-up conversation with an MBTI professional.",
      },
    ],
    relatedDimensions: ["extraversion", "openness", "agreeableness", "conscientiousness", "neuroticism", "need-for-cognition"],
    vsSlug: "opinion-dna-vs-myers-briggs",
    ctaHref: "/personal-assessment",
  },
  {
    slug: "enneagram-alternatives",
    competitorName: "Enneagram",
    title: "Best Enneagram Alternatives in 2026",
    description: "Want more than 9 types? Explore research-backed personality assessments that measure your complete psychological profile beyond core motivations.",
    whySwitch: [
      "Limited peer-reviewed scientific validation",
      "Only 9 categories for all human personality",
      "Rooted in spiritual tradition, not behavioral science",
      "Self-typing can be unreliable without a trained guide",
      "No measurement of values, cognitive biases, or thinking patterns",
    ],
    alternatives: ["opinion-dna", "big-five", "truity", "16personalities", "via"],
    relatedDimensions: ["neuroticism", "achievement", "security", "benevolence", "self-direction", "intolerance-for-uncertainty"],
  },
  {
    slug: "big-five-alternatives",
    competitorName: "Big Five (OCEAN)",
    title: "Best Big Five Personality Test Alternatives in 2026",
    description: "The Big Five is scientifically solid — but only measures 5 traits. Find assessments that include values, thinking patterns, and actionable insights.",
    intro: "The Big Five measures five traits: [openness](/dimensions/openness), [conscientiousness](/dimensions/conscientiousness), [extraversion](/dimensions/extraversion), [agreeableness](/dimensions/agreeableness), and [neuroticism](/dimensions/neuroticism). Each link explains what high and low scores mean. The alternatives below either keep those five and add more, or measure something else entirely, such as values or talents.",
    whySwitch: [
      "Only 5 dimensions — doesn't cover values, morals, or thinking patterns",
      "Free versions often lack personalized interpretation",
      "No Dark Triad, moral foundations, or cognitive bias measurement",
      "Results without context — what do you do with a Conscientiousness score?",
      "No AI-generated personalized insights for your specific profile",
    ],
    alternatives: ["opinion-dna", "truity", "gallup", "via", "enneagram"],
    relatedDimensions: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "machiavellianism"],
  },
  // Truity hub sources, checked 2026-10-08:
  // https://www.truity.com/ (homepage tests: Enneagram, TypeFinder, Big Five, Career Test, Love Styles, DISC)
  // https://www.truity.com/test/enneagram-personality-test (free; about 105 questions; 10 to 15 minutes; free scores on all nine types; full report for a fee; technical document on reliability and validity; reviewed by Dr. Steven Melendy, PsyD)
  // https://www.truity.com/test/type-finder-personality-test-new (TypeFinder: based on Myers and Briggs' theory but not the MBTI; 130 questions; 10 to 15 minutes; 23 facets; free brief report, full report for a small fee)
  // https://www.truity.com/test/big-five-personality-test (60 questions; 5 to 10 minutes; free brief report; full report for a small fee)
  // https://www.truity.com/test/disc-personality-test (38 questions, about 5 minutes)
  // https://www.truity.com/truity-at-work/product/big-five (Truity@Work business platform)
  // https://www.enneagraminstitute.com/how-the-enneagram-system-works (official test: Riso-Hudson Enneagram Type Indicator, RHETI, version 2.5)
  // https://www.16personalities.com/articles/our-theory (five aspects; no Jungian concepts)
  // Removed as unverifiable: "$29-79 per test report" (Truity lists full reports only as "a small fee"), "No AI-generated insights", "template-driven" reports.
  {
    slug: "truity-alternatives",
    competitorName: "Truity",
    title: "Truity Alternatives for Personality Assessments in 2026",
    seoTitle: "Truity Alternatives: Personality Tests Compared (2026)",
    description: "Truity alternatives for personality assessments: how its Enneagram, TypeFinder, Big Five, and DISC tests compare with 16Personalities and a 48-dimension test.",
    intro: "Truity offers a wide range of online personality tests. Its homepage leads with the Enneagram, TypeFinder (its 16-type test), the Big Five, a career test, Love Styles, and DISC. The main tests give free basic results, and each full report is sold separately.\n\nPeople look for alternatives to Truity for personality assessments for two reasons. The first is specific: they want a different take on one framework, most often the Enneagram, because they are unsure of their type. The second is structural: they have taken two or three Truity tests and have a stack of separate reports that never talk to each other.\n\nThis page covers both. It starts with Truity's Enneagram test and where else to take the Enneagram, compares Truity with 16Personalities, and then looks at assessments that put personality, values, and thinking style into one profile.",
    whySwitch: [
      "Each Truity test is its own product, so your Enneagram, Big Five, and TypeFinder results arrive as separate reports",
      "Free results are a summary, and every full report is a separate purchase",
      "Its main tests each follow one established framework, so you have to combine the pieces yourself",
      "If you are unsure of your Enneagram or 16-type result, a second opinion has to come from a different test",
      "None of its main tests scores moral intuitions or reasoning style alongside personality",
    ],
    alternatives: ["opinion-dna", "16personalities", "big-five", "enneagram", "gallup"],
    sections: [
      {
        heading: "Truity's Enneagram test, and where else to take the Enneagram",
        content: "Truity's Enneagram test is its headline product. According to Truity, it is about 105 questions, takes 10 to 15 minutes, and is free to take. The free results show your score on each of the nine types; the full report is paid. Truity also publishes a technical document on the test's reliability and validity and names the clinical psychologist who reviewed it.\n\nScoring all nine types is useful, because the Enneagram's main difficulty is that many people sit close to two or three types and are not sure which one is theirs. That is also the most common reason to look for a Truity Enneagram alternative: a second instrument, written by someone else, is a reasonable way to check a result.\n\n### Other Enneagram tests\n\nThe Enneagram Institute offers its own test, the Riso-Hudson Enneagram Type Indicator (RHETI), now in version 2.5. Its framework adds wings, nine levels of development within each type, and lines of growth and stress between types, which give a single type number more texture.\n\n### Going past one type number\n\nThe Enneagram is organized around motivation: what each type wants and fears. A values assessment measures the same territory more directly. Opinion DNA scores personal values such as [achievement](/dimensions/achievement), [security](/dimensions/security), and [benevolence](/dimensions/benevolence) on separate scales, along with [neuroticism](/dimensions/neuroticism), the trait behind much of how people respond under stress. For a fuller comparison, see our [Enneagram alternatives](/alternatives/enneagram-alternatives) guide and [Opinion DNA vs the Enneagram](/vs/opinion-dna-vs-enneagram).",
      },
      {
        heading: "Truity vs 16Personalities: two takes on the 16 types",
        content: "Truity and 16Personalities get compared often, since both offer a 16-type test. They are built differently.\n\n- Truity's TypeFinder is, in Truity's words, based on Myers and Briggs' theory but not the same as the MBTI assessment. It runs 130 questions and reports four dimensions of type plus 23 facets. The brief report is free and the full report is paid.\n- 16Personalities uses Myers-Briggs-style letters, adds a fifth scale for Assertive or Turbulent, and says on its theory page that it does not use Jungian concepts and instead reworks the Big Five traits. The test is free.\n\nSo if you want a classic 16-type result with more detail inside each letter, TypeFinder is closer to the Myers-Briggs tradition. If you want a quick free code with the A or T stress scale included, 16Personalities fits. We put both side by side, along with Dimensional, in [Truity vs 16Personalities vs Dimensional](/vs/truity-vs-16personalities). For alternatives to the Myers-Briggs itself, see our [MBTI alternatives](/alternatives/myers-briggs-alternatives) guide.",
      },
      {
        heading: "One profile instead of several Truity tests",
        content: "Taking the Truity Enneagram, Big Five, and TypeFinder tests gives you three good snapshots from three frameworks. What it doesn't give you is one picture where the pieces are scored on the same scale and read together.\n\nOpinion DNA is designed as that single picture. One 179-question assessment, about 10 to 15 minutes, produces 48 continuous scores in three layers:\n\n- Personality (12): the Big Five, including [openness](/dimensions/openness) and [conscientiousness](/dimensions/conscientiousness), plus the Dark Triad and four more, such as life satisfaction.\n- Values (24): moral foundations such as [care](/dimensions/care), cooperative virtues, and personal values such as [self-direction](/dimensions/self-direction).\n- Meta-thinking (12): how you reason and what you assume about the world, such as [need for cognition](/dimensions/need-for-cognition).\n\nEvery score is benchmarked against population averages, and an AI-generated report interprets them together across personality, values, career, and relationships. It is a $47 one-time purchase with lifetime access. The head-to-head is at [Opinion DNA vs Truity](/vs/opinion-dna-vs-truity).",
      },
      {
        heading: "When Truity is still the right choice",
        content: "Truity is a sensible pick in a few situations. If you want one specific framework, quickly and for free, its tests are short: the Big Five is 60 questions and 5 to 10 minutes, and DISC is 38 questions and about 5 minutes. If you are curious about the Enneagram and want scores on all nine types before paying anything, its Enneagram test does that. And if you manage a team that already uses one of these frameworks, Truity sells the same tests to organizations through Truity@Work.\n\nThe case for an alternative is strongest when you want more than one framework can answer, or when you want a second opinion on a type that never quite fit.",
      },
      {
        heading: "How to choose a Truity alternative",
        content: "Match the alternative to the reason you are leaving.\n\n- Unsure of your Enneagram type: take a second Enneagram test from another publisher, such as the RHETI.\n- Want a free 16-type result: 16Personalities.\n- Want research-standard trait scores: a Big Five test.\n- Want to focus on talents at work: Gallup's CliftonStrengths, which ranks 34 themes.\n- Want personality, values, and thinking style in one profile: Opinion DNA.\n\nIf the last one describes you, start [the full assessment](/personal-assessment). It comes with a 30-day money-back guarantee.",
      },
    ],
    faq: [
      {
        question: "What are the best alternatives to Truity for personality assessments?",
        answer: "It depends on which Truity test you are replacing. For the Enneagram, the Enneagram Institute's RHETI is a well-known alternative. For TypeFinder, 16Personalities is the free 16-type option. For the Big Five, many free versions exist. If you want one assessment instead of several, Opinion DNA measures 48 dimensions of personality, values, and meta-thinking in a single profile.",
      },
      {
        question: "Is there a good alternative to Truity's Enneagram test?",
        answer: "Yes. The Enneagram Institute's Riso-Hudson Enneagram Type Indicator (RHETI) is a natural second opinion, and taking two instruments is a reasonable way to settle a type you are unsure about. If you want to measure motivation more directly, a values assessment scores what you care about on separate scales. Our [Enneagram alternatives](/alternatives/enneagram-alternatives) page compares the options.",
      },
      {
        question: "Is Truity free?",
        answer: "Truity's main tests, including the Enneagram, TypeFinder, Big Five, and DISC, are free to take and give free basic results. Each full report is sold separately, and Truity sells tests to organizations through its Truity@Work platform.",
      },
      {
        question: "Is Truity's TypeFinder the same as the MBTI?",
        answer: "No. Truity says TypeFinder is based on Myers and Briggs' theory but is not the same as the MBTI assessment, which is published by The Myers-Briggs Company. For a comparison of the main 16-type tests, see [Truity vs 16Personalities vs Dimensional](/vs/truity-vs-16personalities).",
      },
      {
        question: "How is Opinion DNA different from Truity?",
        answer: "Truity offers separate tests for separate frameworks, each with its own report. Opinion DNA is one 179-question assessment that scores 48 dimensions, including the Big Five, values such as [care](/dimensions/care) and [achievement](/dimensions/achievement), and meta-thinking, and reads them together in one AI-generated report. It costs $47 once, with a 30-day money-back guarantee.",
      },
    ],
    relatedDimensions: ["openness", "neuroticism", "achievement", "security", "care", "need-for-cognition"],
    vsSlug: "opinion-dna-vs-truity",
    ctaHref: "/personal-assessment",
  },
  // DISC hub sources, checked 2026-10-08:
  // https://www.truity.com/test/disc-personality-test (38 questions, about 5 minutes, free without registering; D Drive, I Influence, S Support, C Clarity; primary type plus scores on the other three; paid full report; Marston)
  // https://www.everythingdisc.com/what-is-disc/ (DiSC: D Dominance, i Influence, S Steadiness, C Conscientiousness; Wiley owns DiSC and Everything DiSC; product line)
  // https://www.everythingdisc.com/our-story (Marston 1928, "Emotions of Normal People"; Geier's Personal Profile System, Performax, Inscape, now Wiley; Everything DiSC launched 2007)
  // https://www.everythingdisc.com/ ("computer-adaptive" assessments; authorized partners; facilitation)
  // https://www.everythingdisc.com/build-better-relationships (five-point scale; adaptive; facilitator-led)
  // https://www.ttisi.com/disc/ (Dominance, Influence, Steadiness, Compliance; certified partners; "does not measure intelligence, aptitude, values, or mental health"; pairs with motivators, EQ, competencies)
  // https://www.gallup.com/cliftonstrengths/en/252137/home.aspx (34 themes; 30-minute assessment of paired statements)
  // Not used: DiSC Profile (discprofile.com) prices, because the site blocked automated fetches today. Removed "often $70+" and "limited scientific validation" claims.
  {
    slug: "disc-alternatives",
    competitorName: "DISC",
    title: "DISC Assessment Alternatives: The Best DISC Tests and What to Try Instead",
    seoTitle: "DISC Alternatives: Best DISC Assessment Tests Compared",
    description: "DISC alternatives compared: Truity's free DISC test, Everything DiSC, TTI, and assessments that go past work style to values and personality traits.",
    intro: "DISC is a model before it is a product. William Moulton Marston described four types of emotional behavior in his 1928 book Emotions of Normal People, and several publishers have built assessments on that idea since. Wiley's version is spelled DiSC, with a lowercase i. Truity and TTI Success Insights spell it DISC. They share four letters, but each publisher writes its own questions, names the factors its own way, and sells it its own way.\n\nThat is why the search for DISC alternatives splits in two. Some people want a different DISC: a free one, a quicker one, or one they can buy without going through a facilitator. Others have taken DISC at work and want something that describes more than work style. This page covers both: which DISC assessment test to use, and which assessments to try when four behavioral styles are not enough.",
    whySwitch: [
      "It describes behavioral style at work, and TTI, one of its publishers, says it does not measure intelligence, aptitude, values, or mental health",
      "Four styles are a useful shorthand for a team, but they leave out most of what shapes a person outside the office",
      "Publishers label and score the four letters differently, so results from two DISC tests may not line up",
      "Major commercial versions are built around certified partners and facilitated team sessions, which is more than one person may need",
      "It doesn't score personality traits such as the Big Five, moral intuitions, or reasoning style",
    ],
    alternatives: [
      "opinion-dna",
      {
        name: "Truity DISC Assessment",
        description: "A free DISC test from Truity: 38 questions, about 5 minutes, no registration needed for the summary. Truity names the four styles Drive, Influence, Support, and Clarity, and reports a primary style plus scores on the other three. A fuller report is paid.",
        dimensions: "4 DISC styles",
        bestFor: "Individuals who want a quick DISC result without buying through a facilitator.",
        website: "truity.com",
      },
      "big-five",
      "gallup",
      "enneagram",
    ],
    sections: [
      {
        heading: "Truity's DISC test",
        content: "If you searched for Truity DISC, here is what Truity's own test page says. It is a 38-question assessment that takes about 5 minutes, and you can see a summary without paying or registering. You get a primary DISC style and scores on the other three. A fuller report is available for a fee, and Truity offers the same test to teams through its Truity@Work platform.\n\nThe main thing to know is the naming. Truity's four styles are Drive (control, power, and assertiveness), Influence (people, interaction, and communication), Support (patience, thoughtfulness, and harmony), and Clarity (structure, organization, and correctness). Truity credits the model to William Moulton Marston, but the S and C labels differ from the Steadiness and Conscientiousness used by Wiley's Everything DiSC, so don't expect a Truity result to map one-to-one onto a DiSC report from work.\n\nTruity also publishes a technical document for the test. For a free, quick, individual DISC result, it is the easiest place to start.",
      },
      {
        heading: "The best DISC assessment test depends on the publisher",
        content: "There is no single official DISC. The model is Marston's, and the best-known assessments come from different companies with different spellings, labels, and ways of buying.\n\n### Everything DiSC (Wiley)\n\nWiley owns DiSC and Everything DiSC. Its history traces the first DiSC assessment to John Geier's Personal Profile System in the 1970s, published by Performax, which later became Inscape Publishing and is now part of Wiley. Everything DiSC launched in 2007. Wiley describes its assessments as computer-adaptive and points organizations to authorized partners who run facilitated sessions, in versions such as Workplace, Management, Agile EQ, Productive Conflict, Work of Leaders, and Sales. Its letters stand for Dominance, Influence, Steadiness, and Conscientiousness, and Wiley writes the four styles as D, i, S, and C.\n\n### TTI Success Insights\n\nTTI's DISC measures Dominance, Influence, Steadiness, and Compliance. Organizations use it through TTI or certified partners, and TTI pairs it with other measures, such as motivators, emotional intelligence, and competencies, in combined reports.\n\n### Truity\n\nCovered above: free, 38 questions, and its own labels for S and C.\n\nThe best DISC assessment test for you comes down to context. If your company already runs Everything DiSC or TTI workshops, use that version so your results match your colleagues'. If you are on your own and curious, a free test like Truity's is enough to learn your style.",
        table: {
          columns: ["Publisher", "Spelling", "The four letters", "How you get it"],
          rows: [
            ["Wiley (Everything DiSC)", "DiSC (lowercase i)", "Dominance, Influence, Steadiness, Conscientiousness", "Wiley's site or authorized partners"],
            ["TTI Success Insights", "DISC", "Dominance, Influence, Steadiness, Compliance", "Through TTI or certified partners"],
            ["Truity", "DISC", "Drive, Influence, Support, Clarity", "Free online, paid full report"],
          ],
          note: "From each publisher's own website, checked October 2026.",
        },
      },
      {
        heading: "What DISC measures, and what DISC alternatives add",
        content: "DISC describes how you behave, especially at work: how fast you move, how much you push, how you deal with people and rules. TTI's own description is that it covers how you prefer to act, communicate, and make decisions, and that it does not measure intelligence, aptitude, values, or mental health.\n\nIf you have taken DISC, parts of the Big Five will feel familiar. The outgoing, persuasive side of Influence overlaps with [extraversion](/dimensions/extraversion), the patient, cooperative side of Steadiness with [agreeableness](/dimensions/agreeableness), and the careful, rule-minded C with [conscientiousness](/dimensions/conscientiousness). The difference is that a Big Five test scores each trait on its own scale, and it adds [neuroticism](/dimensions/neuroticism) and [openness](/dimensions/openness), which DISC does not frame as styles.\n\nThe bigger gap is values. Two people with the same D style can want completely different things from that drive. Opinion DNA scores personal values such as [achievement](/dimensions/achievement), [power](/dimensions/power), and [security](/dimensions/security), alongside moral foundations and thinking style, so you can see what the behavior is in service of.",
      },
      {
        heading: "DISC alternatives for teams",
        content: "Most DISC is bought for teams, so it is fair to compare alternatives on team use.\n\n- CliftonStrengths, from Gallup, is a 30-minute assessment of paired statements that ranks 34 talent themes. It suits teams that want to talk about strengths.\n- A Big Five test gives each person continuous trait scores, which is more precise than a style and less tied to the workplace.\n- Opinion DNA compares people across all 48 dimensions. Its [team product](/teams) and [co-founder comparison](/co-founders) show where a group's values and thinking styles line up or pull apart.\n\nFor a broader look at personality tools for groups, see [personality assessments for teams and leadership](/for/teams-and-leadership), or the head-to-head [Opinion DNA vs DISC](/vs/opinion-dna-vs-disc).",
      },
      {
        heading: "Choosing between DISC and a broader assessment",
        content: "Use DISC when the goal is a shared language for working styles on one team, and pick the publisher your colleagues already use. Use a broader assessment when the goal is understanding yourself: why you react the way you do, what you care about, and how you reason under uncertainty.\n\nOpinion DNA is built for the second case. It measures 48 dimensions in 179 questions, takes about 10 to 15 minutes, and comes with an AI-generated report covering personality, values, meta-thinking, career, and relationships. It costs $47 once, with a 30-day money-back guarantee. Start with [the full assessment](/personal-assessment).",
      },
    ],
    faq: [
      {
        question: "What is the best alternative to a DISC assessment?",
        answer: "If you want another DISC, Truity's free DISC test is the quickest option for an individual, while Everything DiSC and TTI are the usual choices inside organizations. If you want to go past work style, a Big Five test scores your personality traits, CliftonStrengths ranks 34 talent themes, and Opinion DNA measures 48 dimensions of personality, values, and thinking style in one profile.",
      },
      {
        question: "Is Truity's DISC test free?",
        answer: "The test and a summary of your results are free, and Truity says you don't need to register to see them. You get a primary DISC style and scores on the other three. A more detailed report is available for a fee.",
      },
      {
        question: "What is the difference between DISC and DiSC?",
        answer: "DiSC, with a lowercase i, is the spelling Wiley uses for its Everything DiSC assessments. DISC in capitals is how other publishers, such as Truity and TTI Success Insights, write it. Wiley and Truity both trace the model back to William Moulton Marston. The assessments are separate products with their own questions and labels.",
      },
      {
        question: "What does DISC stand for?",
        answer: "It depends on the publisher. Wiley's Everything DiSC uses Dominance, Influence, Steadiness, and Conscientiousness. TTI Success Insights uses Dominance, Influence, Steadiness, and Compliance. Truity uses Drive, Influence, Support, and Clarity. Marston's original 1928 terms, according to Wiley's history page, were Dominance, Inducement, Submission, and Compliance.",
      },
      {
        question: "Is DISC a personality test?",
        answer: "It is usually described as a behavioral assessment. TTI says its DISC covers how you prefer to act, communicate, and make decisions, and does not measure intelligence, aptitude, values, or mental health. A personality trait test such as the Big Five scores broader dispositions like [extraversion](/dimensions/extraversion) and [conscientiousness](/dimensions/conscientiousness) on continuous scales.",
      },
    ],
    relatedDimensions: ["extraversion", "agreeableness", "conscientiousness", "achievement", "power", "security"],
    vsSlug: "opinion-dna-vs-disc",
    ctaHref: "/personal-assessment",
  },
];

export const alternativePages: AlternativePage[] = [
  ...baseAlternativePages,
  visualDnaAlternativesPage,
  deepPersonalityAlternativesPage,
  mbtiStepIIAlternativesPage,
];

/** Competitor-vs-competitor pages under /vs (rendered by the same route). */
export const headToHeadPages: HeadToHeadPage[] = [truityVs16PersonalitiesPage];

export function getCompetitor(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug);
}

export function getAlternativePage(slug: string): AlternativePage | undefined {
  return alternativePages.find((a) => a.slug === slug);
}
