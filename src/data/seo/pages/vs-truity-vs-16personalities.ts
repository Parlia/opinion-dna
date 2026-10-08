import type { HeadToHeadPage } from "../content-types";

// /vs/truity-vs-16personalities
// Targets: truity vs dimensional, 16personalities vs dimensional, truity vs
// 16personalities, trueself soulprint vs truity, is personalitytest.io more
// reliable than truity.
//
// Sources (all checked October 8, 2026). Competitor facts on this page come
// only from these official pages.
// Truity:
//   https://www.truity.com/
//   https://www.truity.com/test/type-finder-personality-test-new
//   https://www.truity.com/test/big-five-personality-test
//   https://www.truity.com/sites/default/files/fillpdf/typefinder-technicaldoc.pdf
// 16Personalities:
//   https://www.16personalities.com/
//   https://www.16personalities.com/articles/our-theory
//   https://www.16personalities.com/free-personality-test
//   https://www.16personalities.com/premium (prices are localized: 29 EUR via
//   one fetch, 24.99 GBP via a UK fetch, so the page says "varies by region")
// Dimensional:
//   https://www.dimensional.me/
//   https://www.dimensional.me/traits
//   https://about.dimensional.me/personality-test
//   https://about.dimensional.me/about
//   https://about.dimensional.me/faqs
// TrueSelf Soulprint:
//   https://trueself.io/ and https://soulprint.trueself.io/ (the landing page
//   renders client-side; copy read from the page's own markup and bundle)
// personalitytest.io:
//   https://www.personalitytest.io/
//   https://www.personalitytest.io/theory
//   https://www.personalitytest.io/about
//
// Deliberately left out (not verifiable on the official sites): Truity report
// prices (its test pages say only "a small fee"), Dimensional prices, question
// count, and scale sources, the 16Personalities question count, any
// test-retest figures for any product, and all third-party ratings or reviews.
export const truityVs16PersonalitiesPage: HeadToHeadPage = {
  slug: "truity-vs-16personalities",
  shortTitle: "Truity vs 16Personalities",
  title: "Truity vs 16Personalities vs Dimensional (and Where Opinion DNA Fits)",
  seoTitle: "Truity vs 16Personalities vs Dimensional: 2026 Comparison",
  description:
    "Truity vs 16Personalities vs Dimensional: what each test measures, how results are scored, what is free, and where a 48-dimension assessment fits.",
  intro:
    "Most people comparing Truity and 16Personalities want one of two things: a quick answer on which free test to take, or a sense of which one sits closer to real psychology. Dimensional tends to show up in the same searches, because it promises a much larger profile than either.\n\nThe three are built differently. Truity is a catalog of standalone tests, each tied to a named framework: the TypeFinder (Myers and Briggs' 16 types), a Big Five test, an Enneagram test, DISC, a career test, and several more. 16Personalities is built around one free flagship test with its own five-part model, which borrows the Myers-Briggs letter format and, by its own account, reworks dimensions from the Big Five. Dimensional is an app that runs a suite of tests, builds a profile of over 200 traits, and lets you compare yours with friends.\n\nBelow you'll find a side-by-side table, each pairing head to head, short notes on TrueSelf Soulprint and personalitytest.io, a practical way to judge reliability for yourself, and where Opinion DNA fits. Product details come from each company's own website as of October 2026. Where a site doesn't say something, we say so instead of guessing.",
  table: {
    columns: ["", "Truity", "16Personalities", "Dimensional", "Opinion DNA"],
    rows: [
      [
        "What it is",
        "A catalog of separate tests: TypeFinder, Big Five, Enneagram, DISC, career, love styles, emotional intelligence, and more",
        "One flagship free test that gives a five-letter type code such as INTJ-A, plus paid add-ons",
        "An app with a suite of personality tests that builds a profile of over 200 traits",
        "One 179-question assessment scored on 48 dimensions",
      ],
      [
        "Framework",
        "Named per test. The TypeFinder is based on Myers and Briggs' type theory; the Big Five test uses the five-factor model",
        "Its own five-aspect model, using the Myers-Briggs letter format and dimensions reworked from the Big Five",
        "No named framework on its site. Areas include primary traits, cognition, values, attachment, and conflict styles",
        "Peer-reviewed psychometric scales across personality, values, and meta-thinking",
      ],
      [
        "Length",
        "TypeFinder: 130 questions, about 10 to 15 minutes. Big Five: 60 questions, about 5 to 10 minutes",
        "About 10 minutes (question count not stated)",
        "Not stated",
        "179 questions, about 10 to 15 minutes",
      ],
      [
        "Result format",
        "TypeFinder: four-letter type plus 23 facets. Big Five: trait scores compared with a large international sample",
        "Type code, with percentages showing which side of each aspect you fall on and how strongly",
        "A personality profile you can compare with friends; scoring method not stated",
        "Continuous 0 to 100 scores against population averages, plus an AI-generated report",
      ],
      [
        "Free option",
        "Free test and brief report, no registration needed",
        "Free test and type description",
        "Not stated (a premium tier exists)",
        "Paid only; the Friends comparison is free once both people finish",
      ],
      [
        "Paid option",
        "Full report per test for what Truity calls a small fee (price not listed on the test pages)",
        "Premium Career Suite (price varies by region) and a Pro Suite",
        "Dimensional Plus subscription: 50+ premium traits and 4 premium reports (price not stated)",
        "$47 one-time, lifetime access, 30-day money-back guarantee",
      ],
      [
        "Best for",
        "Trying several well-known frameworks one at a time",
        "A quick, free type with a large library of reading around it",
        "Mapping many topic areas in one app and comparing with friends",
        "One profile covering personality, values, and how you think",
      ],
    ],
    highlightColumn: 4,
    note: "Details for Truity, 16Personalities, and Dimensional are from each company's own website as of October 2026. Not stated means we could not find it on the company's site. Prices and test lengths change, so check before you buy.",
  },
  sections: [
    {
      heading: "Truity vs 16Personalities, head to head",
      content:
        "The biggest difference is structural. Truity is a shelf of standalone tests, each named after the framework it measures. 16Personalities is built around one free flagship test, with paid guides and specialized tests layered on top.\n\n### Truity\n\nTruity's best-known test, the TypeFinder, is based on the type theory of Isabel Briggs Myers and Katharine Briggs. It has 130 questions, takes about 10 to 15 minutes, and measures the four Myers-Briggs preferences plus 23 narrower facets. Truity is explicit that the TypeFinder is not the official MBTI and that it has no affiliation with the organizations that publish the MBTI.\n\nIf you would rather have trait scores than a type, Truity also offers a separate Big Five test: 60 questions, about 5 to 10 minutes, with your results on [openness](/dimensions/openness), [conscientiousness](/dimensions/conscientiousness), extraversion, agreeableness, and neuroticism shown against a large international sample. Both tests are free to take, with a brief report and no registration. The fuller report costs extra; Truity calls it a small fee and doesn't print the price on the test pages.\n\n### 16Personalities\n\n16Personalities gives you a five-letter code such as INTJ-A. Its model has five aspects: Energy, Mind, Nature, Tactics, and Identity. Four of them follow the Myers-Briggs letter pairs, with Sensing renamed Observant and Perceiving renamed Prospecting. The site says it uses the Myers-Briggs acronym format for simplicity and convenience, that it does not use Jungian cognitive functions, and that its scales rework and rebalance dimensions from the Big Five. The free test takes about 10 minutes. Paid products include a Premium Career Suite and a Pro Suite.\n\nThe fifth aspect, Identity, is the one people ask about most. 16Personalities describes Assertive (-A) types as self-assured, even-tempered, and resistant to stress, and Turbulent (-T) types as self-conscious and sensitive to stress. That contrast reads a lot like the low and high ends of [neuroticism](/dimensions/neuroticism) in the Big Five, which fits the site's own account of where its model comes from.\n\n### Which one to take\n\nIf you want to try several frameworks and compare them, Truity's catalog is the more flexible option, and our guide to [Truity alternatives](/alternatives/truity-alternatives) covers what else sits in that space. If you want one free type with a lot of reading attached, 16Personalities is the simpler start; the [16Personalities alternatives](/alternatives/16personalities-alternatives) page lists options that report scores instead of types. If trait scores matter more to you than a letter code, Truity's Big Five test is the closer of the two to how personality is measured in research.",
    },
    {
      heading: "Truity vs Dimensional",
      content:
        "Dimensional describes itself as a personality test for getting to know yourself and your friends. It runs as an app (iOS, with Android in beta when we checked) and, according to its site, measures over 200 traits through a suite of tests. The site groups those traits into areas such as primary traits, cognition, values, interaction styles, interests, love styles, attachment styles, conflict styles, strengths, lifestyle, and political ideology, and it lets you add friends and compare profiles. A paid subscription, Dimensional Plus, adds 50+ premium traits, four premium reports, more content about you and your connections, and unlimited use of a feature called the Dimensional Assistant. The site doesn't list prices, question counts, or the published scales behind its traits.\n\nSo the trade-off against Truity is breadth against documentation. Dimensional covers more ground in one place, including relationship topics (attachment, love styles, conflict) that Truity splits into separate tests or doesn't cover. Truity covers less per test but tells you which framework each test belongs to, how many questions it has, and links technical documentation for its TypeFinder and Big Five tests.\n\nIf you care about knowing exactly what is being measured and how, Truity gives you more to check. If you want one app that maps many areas at once and puts your friends next to you, Dimensional is built for that.",
    },
    {
      heading: "16Personalities vs Dimensional",
      content:
        "These two are closer in spirit. Both are polished consumer products with a lot of content written around your result, and both have a social side: 16Personalities offers team assessments and reports for professionals, and Dimensional builds friend comparison into the app. The real difference is the shape of what you get back.\n\n16Personalities compresses you into one of 32 codes (16 types, each Assertive or Turbulent), with percentages showing how strongly you lean on each aspect. Dimensional spreads you across hundreds of traits in many topic areas. A single code is easy to remember and easy to share. It also discards information: two people with the same code can sit in quite different places on every scale, and someone just over a midpoint gets the same letter as someone at the far end. A many-trait profile keeps more of that detail but is harder to take in, and its value depends on how carefully each trait is measured. 16Personalities explains its model in some detail, including what it took from Myers-Briggs and what it took from the Big Five. Dimensional's public pages don't describe how its traits are scored.\n\nHow you relate to the result matters as much as which app produced it. Some people treat a type code as a starting point for reflection; others start defending it as a fact about themselves. How tightly someone holds a label like that is a small, everyday case of what [dogmatism](/dimensions/dogmatism) and [intellectual humility](/dimensions/intellectual-humility) describe more broadly: how certain you are, and how readily you revise when the evidence changes.",
    },
    {
      heading: "TrueSelf Soulprint and personalitytest.io",
      content:
        "Two other names come up in the same searches, and they sit at opposite ends of the market.\n\n### TrueSelf Soulprint\n\nTrueSelf's Soulprint is a different kind of product from everything above. Its site describes an AI-generated reading that synthesizes eight systems: the Enneagram, Human Design, Gene Keys, Western astrology, Vedic astrology, Chinese astrology, Spiral Dynamics, and numerology. The reading runs to more than 10,000 words, can be listened to like a podcast, and comes with a chat feature called the Cosmic Guide. Several of those systems (astrology, numerology, Human Design) are calculated from birth data. They don't ask how you think or behave, so they aren't psychometric instruments in the usual sense.\n\nThat makes TrueSelf Soulprint vs Truity a choice between two goals: a reflective, spiritual reading, or a questionnaire that names the framework it measures and publishes some of its psychometric work.\n\n### personalitytest.io\n\npersonalitytest.io offers 22 free assessments with no paywall. The main one is a 16-type test of 56 statements (14 per preference pair) that takes about 12 minutes, and the others include Big Five, HEXACO, Enneagram, DISC, and attachment style tests. Like Truity, it says plainly that it is an independent test and not the official MBTI. Each preference pair is scored separately and the stronger side becomes your letter, and the site is candid that retaking it in a different mood or season of life can shift a borderline preference.\n\nIts About and Theory pages don't name the source of its items or report reliability statistics. That leaves you with less to check, and it doesn't settle the reliability question either way. The next section covers what to look for.",
    },
    {
      heading: "How to judge which test is more reliable",
      content:
        "Reliability has a specific meaning in psychometrics: a reliable test gives consistent results, both across its own items and across time. You can't judge it by how accurate your result feels. Most people feel well described by most personality write-ups, a pattern psychologists have documented since Bertram Forer's classroom experiment in the late 1940s (the Barnum or Forer effect). Here is what you can check instead, on any test's own website.\n\n- Does it name its framework and where its questions come from? A test built on published scales, or one that publishes its own development work, gives you something to verify. Truity links technical documentation from its TypeFinder and Big Five pages; the TypeFinder document reports internal consistency for each of its four scales, calculated on a sample of more than 200,000 people.\n- Does it report internal consistency, test-retest stability, or both? They answer different questions. Internal consistency (usually Cronbach's alpha) tells you whether a scale's items hang together. Test-retest data tells you whether you would get the same result next month. A type test can do well on the first and still move people's letters on a retake.\n- Does it give continuous scores or only a type? A type comes from cutting a continuous scale at a midpoint. If you sit near that line, a change in mood or a single reworded question can flip your letter. Scores or percentages let you see whether you're near a cutoff; Truity's Big Five results and the 16Personalities aspect percentages both give you some of that.\n- Does it say who you're being compared with? A score only means something relative to a reference group, so look for a description of who is in it.\n- Does it keep marketing claims separate from evidence? A phrase like freakishly accurate (it appears on both the 16Personalities and Dimensional homepages) tells you about tone and nothing about consistency over time.\n\nApply that to the question of whether personalitytest.io is more reliable than Truity, and the honest answer is that public material can't settle it. Truity gives you more to examine; personalitytest.io gives you less. If you want a rough check of your own, take both tests twice, a few weeks apart, and see which result moves. That is a one-person test-retest study.",
    },
    {
      heading: "Where Opinion DNA fits",
      content:
        "Opinion DNA is a different kind of product from the three above, so it's worth being plain about how. It is paid: $47, one time, with lifetime access to your results and a 30-day money-back guarantee. If you want a free result to start with, Truity or 16Personalities is the right first step.\n\nWhat the price buys is breadth in one sitting. The assessment is 179 questions, takes about 10 to 15 minutes, and scores you on 48 dimensions in three layers. The 12 personality dimensions include the Big Five ([extraversion](/dimensions/extraversion), [agreeableness](/dimensions/agreeableness), and the other three), the Dark Triad, emotion regulation, and life satisfaction. The 24 values dimensions cover moral foundations such as [care](/dimensions/care) and [fairness](/dimensions/fairness), cooperative virtues, and Schwartz's personal values. The 12 meta-thinking dimensions measure how you hold beliefs and how you see the world, including dogmatism, intellectual humility, and need for cognition. Every score is continuous, from 0 to 100, shown against population averages, and an AI-generated personal report ties the results together across personality, values, meta-thinking, career, and relationships. The scales are peer-reviewed, and the assessment was built over three years with more than 60 experts from Oxford, Cambridge, NYU, Royal Holloway, and UPenn.\n\nFor one-to-one detail, see [Opinion DNA vs Truity](/vs/opinion-dna-vs-truity) and [Opinion DNA vs 16Personalities](/vs/opinion-dna-vs-16personalities). The short version: Truity and 16Personalities describe your personality, Dimensional maps a wide spread of traits and preferences, and Opinion DNA adds what you value and how you think, all on continuous scores. If that fuller picture is what you're after, you can take [the full assessment](/personal-assessment).",
    },
  ],
  faq: [
    {
      question: "Is Truity or 16Personalities more accurate?",
      answer:
        "Neither company's marketing settles that, so look at what each one publishes. Truity names the framework behind each test and links technical documentation for its TypeFinder and Big Five tests, including internal consistency figures. 16Personalities explains its five-aspect model in detail and shows percentages for each aspect, but it is a type system at heart. If you want trait scores closest to how personality is studied in research, Truity's separate Big Five test is the more direct option.",
    },
    {
      question: "Is 16Personalities the same as Myers-Briggs?",
      answer:
        "No. By its own description, 16Personalities uses the Myers-Briggs four-letter acronym format for simplicity and convenience, does not use Jungian cognitive functions, and builds its scales by reworking dimensions from the Big Five. It also adds a fifth letter, A or T. Truity's TypeFinder sits closer to the original theory, since it is based on Myers and Briggs' work, but Truity is clear that it is not the official MBTI and has no affiliation with the MBTI's publishers.",
    },
    {
      question: "What does the A or T at the end of a 16Personalities type mean?",
      answer:
        "It is the Identity aspect: Assertive (A) or Turbulent (T). 16Personalities describes Assertive people as self-assured, even-tempered, and resistant to stress, and Turbulent people as self-conscious, sensitive to stress, and eager to improve. In Big Five terms that contrast sits close to [neuroticism](/dimensions/neuroticism), which Opinion DNA reports as a 0 to 100 score against the population average.",
    },
    {
      question: "Is Dimensional free, and what does Dimensional Plus add?",
      answer:
        "Dimensional's site describes a premium version called Dimensional Plus, which adds 50+ premium traits, four premium reports, more content about you and your connections, and unlimited use of the Dimensional Assistant. The site doesn't list prices or spell out exactly what the non-premium version includes, so check inside the app before you commit to anything.",
    },
    {
      question: "Is personalitytest.io more reliable than Truity?",
      answer:
        "Public information can't answer that with confidence, so we won't pretend to. What you can compare is documentation. Truity publishes technical documentation for its TypeFinder, including internal consistency on a sample of more than 200,000 people. personalitytest.io's About and Theory pages don't name item sources or report reliability statistics, though the site is upfront that a retake can shift a borderline preference. A practical check: take both tests twice, a few weeks apart, and see whose result moves.",
    },
    {
      question: "How does TrueSelf Soulprint compare with Truity?",
      answer:
        "They aim at different things. TrueSelf's Soulprint is an AI-written reading that combines eight systems, including the Enneagram, Human Design, three kinds of astrology, Spiral Dynamics, and numerology. Truity's main tests are self-report questionnaires tied to named psychological frameworks, with free short results and paid full reports. Choose Soulprint if you want a reflective, spiritual reading. Choose a questionnaire like Truity, or a broader one like [Opinion DNA](/vs/opinion-dna-vs-truity), if you want scores you can check against published methods.",
    },
  ],
  relatedDimensions: [
    "openness",
    "conscientiousness",
    "extraversion",
    "neuroticism",
    "dogmatism",
    "intellectual-humility",
  ],
};
