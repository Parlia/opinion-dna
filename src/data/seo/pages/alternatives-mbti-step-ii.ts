import type { AlternativePage } from "../competitors";

// Sources for every MBTI Step II fact on this page (all fetched October 8, 2026):
//   https://www.themyersbriggs.com/en-US/Access-Resources/Articles/the-mbti-step-ii-assessment
//     (five facets per preference pair, 20 in all; facet names; out-of-preference facets;
//      Step II Interpretive Report; "If you're already an MBTI Certified Practitioner, then
//      you've already been certified to use the MBTI Step II assessment")
//   https://asia.themyersbriggs.com/wp-content/uploads/267149-MBTI-STEP-II-INTERPRETIVE-REPORT.pdf
//     (publisher's sample Interpretive Report; its text spells the first J-P facet "Casual",
//      where the article above has the typo "Causal")
//   https://www.myersbriggs.org/unique-features-of-myers-briggs/three-unique-instruments/
//     (Step II "only available through an MBTI Step II certified professional")
//   https://www.themyersbriggs.com/en-US/Access-Resources/MBTI-Global-Version
//     (MBTI Global Step II, 143 items; Profile Report and Interpretive Report samples;
//      Global assessments available only on the Elevate platform with an Elevate license)
//   https://www.themyersbriggs.com/en-US/Explore-Solutions/MBTI
//     ("slightly longer version of the questionnaire"; can clarify Step I best-fit type;
//      requirements must be met to purchase and administer)
//   https://www.themyersbriggs.com/en-us/get-certified/mbti
//     (certification covers Step I and Step II Global; about four days, virtual or in person;
//      80% exam score; Elevate dashboard for sending assessments and generating reports)
//   https://www.mbtionline.com/products/for-you
//     (individual product: official assessment, four-letter type, interactive verification,
//      about 45 minutes; no mention of Step II or facets)
// Alternatives, each checked on its publisher's own site October 8, 2026:
//   16pf: https://talogy.com/en/talent-management-solutions/assessments/16pf-personality-assessment/
//     (16 primary factors, five global factors, 30 to 40 minutes, 20+ languages, accreditation required)
//   16pf: https://www.pearsonassessments.com/store/usd/p/100000483
//     (Fifth Edition, 185 items, Qualification Level B, selection and development uses)
//   Hogan: https://www.hoganassessments.com/assessment/hogan-personality-inventory/
//     (five-factor model basis, 7 primary scales, 42 subscales, 15 to 20 minutes, 40+ languages)
//   Hogan: https://www.hoganassessments.com/certifications/overview/
//     (certification "qualifies professionals to administer our assessments"; covers HPI, HDS,
//      MVPI; Advanced Interpretation workshop covers using subscales)
//   Hogan: https://www.hoganassessments.com/assessment/motives-values-preferences-inventory/
//     (MVPI describes "core goals, values, drivers, and interests")
//   NEO-PI-3: https://www.parinc.com/products/NEO-PI-3-NU
//     (240 items, five domains, 30 facets, ages 12 to 99+, Qualification Level S, PARiConnect)
//   NEO-PI-3: https://www.parinc.com/customer-support/product-information
//     (Level S: degree, certificate, or license in a health care profession plus training)
//   Lumina Spark: https://luminalearning.com/en-us/our-products/lumina-spark/
//     ("directly measuring 72 personality qualities"; Underlying, Everyday, Overextended personas)
//   Lumina Spark: https://luminalearning.com/become-a-practitioner
//     (practitioner qualification; Spark is the usual starting point)
// Left out because we could not verify it on the publishers' own pages today: Step II prices,
// Step II completion time, Step II reliability figures, Saville Wave facet counts (its product
// pages returned 404), Lumina Spark question count, NEO-PI-3 completion time, and any
// validity or reliability comparison between instruments.

export const mbtiStepIIAlternativesPage: AlternativePage = {
  slug: "mbti-step-ii-alternatives",
  competitorName: "MBTI Step II",
  title: "MBTI Step II Alternatives",
  seoTitle: "MBTI Step II Alternatives: Facet-Level Tools Compared",
  description: "MBTI Step II alternatives for HR, L&D, and coaches: 16pf, Hogan, NEO-PI-3, Lumina Spark, and Opinion DNA (48 dimensions), compared on facets and certification.",
  intro:
    "People who search for MBTI Step II alternatives are rarely looking for a quick quiz. They tend to be HR leads, L&D managers, executive coaches, and workshop facilitators who already know the four-letter Myers-Briggs type and want something with more resolution: facet-level scores, a report a practitioner can debrief, and an instrument they can defend in front of a leadership team.\n\n" +
    "This page is written for that reader. It explains what Step II adds to the standard MBTI, according to its publisher, The Myers-Briggs Company. It then covers four professional instruments that also report personality below the level of broad types or traits, and describes each one only in terms its own publisher uses: what it measures, how it is delivered, and who is allowed to administer it. We do not rank them on validity or reliability, because each publisher reports its own evidence and those claims belong to them.\n\n" +
    "Opinion DNA is on the list too, with a plain account of where it fits and where it does not. Individuals take it on their own, teams arrange a group rollout directly with us, and no practitioner certification is involved. Opinion DNA is not affiliated with The Myers-Briggs Company or any other publisher named here. If you want consumer-level options rather than professional ones, our broader guide to [MBTI alternatives](/alternatives/myers-briggs-alternatives) covers those.",
  whySwitch: [
    "Step II is only available through a certified professional, according to The Myers & Briggs Foundation, so a team without an MBTI-certified practitioner has to hire one or send someone through certification.",
    "All 20 Step II facets sit inside the four MBTI preference pairs, so it adds detail to type without measuring values, moral reasoning, or thinking style.",
    "Some organizations prefer continuous trait scores built on the five-factor model to a four-letter type with facets beneath it.",
    "Practitioners already accredited in another instrument, such as Hogan or the 16pf, may prefer to stay within that framework.",
    "Some teams want an assessment every member can complete on their own, without a one-to-one practitioner debrief.",
  ],
  alternatives: [
    "opinion-dna",
    {
      name: "16pf Questionnaire",
      description:
        "Raymond Cattell's factor-analytic instrument, which scores 16 primary personality factors and rolls them up into five global factors. Talogy delivers it online and states that accreditation is required to use it. In the US, Pearson sells the 185-item Fifth Edition at its Qualification Level B.",
      dimensions: "16 primary factors, 5 global factors",
      bestFor: "HR and assessment teams that want a multi-level trait profile for hiring or development, with an accredited user on staff.",
      website: "talogy.com",
    },
    {
      name: "Hogan Personality Inventory (HPI)",
      description:
        "Hogan's measure of everyday personality, based on the five-factor model, with seven primary scales broken into 42 subscales. Hogan puts completion at about 15 to 20 minutes, and its certification workshop is what qualifies professionals to administer its assessments.",
      dimensions: "7 primary scales, 42 subscales",
      bestFor: "Organizations using personality data for hiring and leadership development, with Hogan-certified practitioners.",
      website: "hoganassessments.com",
    },
    {
      name: "NEO Personality Inventory-3 (NEO-PI-3)",
      description:
        "A 240-item Big Five inventory from PAR that scores five domains and 30 facets, six facets per domain. PAR sells it at Qualification Level S, which calls for a degree, certificate, or license in a health care profession plus training in test use.",
      dimensions: "5 domains, 30 facets",
      bestFor: "Psychologists and other qualified professionals who want a facet-level Big Five profile.",
      website: "parinc.com",
    },
    {
      name: "Lumina Spark",
      description:
        "Lumina Learning's personality tool, which it says directly measures 72 personality qualities and reads them through three personas: Underlying, Everyday, and Overextended. Lumina runs a practitioner qualification, and Spark is the usual starting point for it.",
      dimensions: "72 qualities, 3 personas",
      bestFor: "L&D teams that want a workshop-friendly tool and are willing to qualify a practitioner.",
      website: "luminalearning.com",
    },
  ],
  sections: [
    {
      heading: "What MBTI Step II adds to the standard MBTI",
      content:
        "The standard MBTI assessment, which the publisher calls Step I, reports one of 16 types built from four preference pairs: Extraversion or Introversion, Sensing or Intuition, Thinking or Feeling, and Judging or Perceiving. Step II keeps that frame and breaks each preference pair into five facets, for 20 facets in all. The Myers-Briggs Company describes the current English questionnaire, MBTI Global Step II, as 143 items, and calls it a slightly longer version of the Step I questionnaire.\n\n" +
        "The facets, as named on [the publisher's own Step II page](https://www.themyersbriggs.com/en-US/Access-Resources/Articles/the-mbti-step-ii-assessment), are:\n\n" +
        "- Extraversion and Introversion: Initiating or Receiving, Expressive or Contained, Gregarious or Intimate, Active or Reflective, Enthusiastic or Quiet\n" +
        "- Sensing and Intuition: Concrete or Abstract, Realistic or Imaginative, Practical or Conceptual, Experiential or Theoretical, Traditional or Original\n" +
        "- Thinking and Feeling: Logical or Empathetic, Reasonable or Compassionate, Questioning or Accommodating, Critical or Accepting, Tough or Tender\n" +
        "- Judging and Perceiving: Systematic or Casual, Planful or Open-Ended, Early Starting or Pressure-Prompted, Scheduled or Spontaneous, Methodical or Emergent\n\n" +
        "The idea that matters most in practice is the out-of-preference facet. Someone with a clear preference for Introversion can still score on the Extraverted side of one or two facets, and Step II surfaces that. The publisher presents this as a way to explain why a type description does not fit someone exactly, and to help a person settle on a best-fit type when Step I left them unsure.\n\n" +
        "### How it is delivered\n\n" +
        "Step II is a practitioner instrument. The Myers & Briggs Foundation says it is available only through an MBTI Step II certified professional. The publisher's certification program, which runs about four days in person or virtually and ends with an exam that requires a score of 80% or higher, covers both the Step I and Step II Global assessments. Certified practitioners send the questionnaire and generate reports through Elevate, the publisher's assessment platform, which requires an Elevate license.\n\n" +
        "The publisher lists two Global Step II reports, a Profile Report and an Interpretive Report, and describes the Interpretive Report as using a graphical format to display an individual's results. Step I reports can also be produced from a Step II questionnaire. For individuals buying on their own, the publisher's consumer site, MBTIonline, sells the official assessment with a four-letter type and an interactive process to verify it. That product page does not mention Step II or facets.",
    },
    {
      heading: "What to look for in a Step II alternative",
      content:
        "Teams moving away from Step II usually still want the same thing: something more specific than a four-letter label. Four things separate the options.\n\n" +
        "### Level of detail\n\n" +
        "Step II gets its resolution from facets. Its alternatives get there in different ways. Some split a small number of broad traits into named facets (the NEO-PI-3 has six facets under each of the Big Five domains). Some build up from many narrow scales into a handful of broad ones (the 16pf scores 16 primary factors and then five global factors). Others report a moderate number of scales with subscales underneath, as the Hogan Personality Inventory does. Ask how many scores a person actually receives, and whether the report explains the narrow scores or only the broad ones.\n\n" +
        "### Types or continuous scores\n\n" +
        "Step II reports a type with facet results beneath it. The 16pf, the HPI, and the NEO-PI-3 report trait scores along a range, as does Opinion DNA. The two lead to different conversations. Types are easy to remember and easy to label people with. Continuous scores are harder to reduce to a badge and easier to compare across a team.\n\n" +
        "### Who can administer it\n\n" +
        "Every professional instrument on this page has some gate: certification, accreditation, or a purchaser qualification level. That gate is part of what you are paying for, because a trained practitioner can read a profile in context. It also means a team needs a qualified person before anyone takes the questionnaire. Check the intended use as well: Talogy and Hogan both describe hiring as well as development, and PAR describes clinical, applied, and research settings for the NEO-PI-3.\n\n" +
        "### What it measures beyond personality\n\n" +
        "Step II, the 16pf, the HPI, and the NEO-PI-3 are all personality instruments. None of them is built to measure what a person values, which moral arguments persuade them, or how they handle uncertainty and disagreement. Hogan does sell a separate values instrument, the Motives, Values, Preferences Inventory (MVPI), and its certification covers it, so organizations committed to Hogan can add one. For many team problems, values and thinking style are the variables that matter.",
    },
    {
      heading: "The professional alternatives, side by side",
      content:
        "Each instrument below is described from its publisher's own pages, read in October 2026. Delivery rules differ by region and change over time, so confirm the current terms with the publisher before you plan a rollout.\n\n" +
        "### 16pf Questionnaire\n\n" +
        "The 16pf grew out of Raymond Cattell's factor-analytic research. [Talogy's 16pf page](https://talogy.com/en/talent-management-solutions/assessments/16pf-personality-assessment/) describes it as measuring 16 primary personality factors and five global factors, taking about 30 to 40 minutes, available in more than 20 languages depending on version, and requiring accreditation. Talogy also reports scores on 20 to 25 job-related competencies.\n\n" +
        "### Hogan Personality Inventory\n\n" +
        "[Hogan's HPI page](https://www.hoganassessments.com/assessment/hogan-personality-inventory/) describes a five-factor-based inventory with seven primary scales (Adjustment, Ambition, Sociability, Interpersonal Sensitivity, Prudence, Inquisitive, and Learning Approach) and 42 subscales, taking about 15 to 20 minutes, in more than 40 languages. Hogan positions it for uses from entry-level hiring to leadership development, and its Advanced Interpretation workshop covers using the subscales.\n\n" +
        "### NEO Personality Inventory-3\n\n" +
        "[PAR's NEO-PI-3 page](https://www.parinc.com/products/NEO-PI-3-NU) describes a 240-item measure of the five personality domains (Neuroticism, Extraversion, Openness to Experience, Agreeableness, and Conscientiousness) and 30 subordinate facets, with scoring and reports through PARiConnect. Of the instruments here, it is the closest match for anyone who specifically wants a facet-level Big Five profile.\n\n" +
        "### Lumina Spark\n\n" +
        "[Lumina Learning's Spark page](https://luminalearning.com/en-us/our-products/lumina-spark/) says the tool directly measures 72 personality qualities and describes each person through three personas: Underlying (natural preferences), Everyday (how you adapt in context), and Overextended (strengths overplayed). Its practitioner qualification combines group classes, online modules, and coaching.",
      table: {
        columns: ["Instrument", "Publisher", "What it reports", "Who can administer it"],
        rows: [
          ["MBTI Step II", "The Myers-Briggs Company", "Four-letter type plus 20 facets", "MBTI-certified practitioners, through the Elevate platform"],
          ["16pf Questionnaire", "Talogy (Pearson sells the Fifth Edition in the US)", "16 primary factors, 5 global factors", "Accredited users (Talogy); Qualification Level B (Pearson)"],
          ["Hogan Personality Inventory", "Hogan Assessments", "7 primary scales, 42 subscales", "Hogan-certified practitioners"],
          ["NEO-PI-3", "PAR", "5 domains, 30 facets", "Purchasers at PAR Qualification Level S or above"],
          ["Lumina Spark", "Lumina Learning", "72 qualities across 3 personas", "Lumina practitioners and partners"],
          ["Opinion DNA", "Opinion DNA", "48 continuous dimensions across personality, values, and meta-thinking", "No certification; each person takes it on their own"],
        ],
        note: "Compiled from each publisher's own website in October 2026. Requirements vary by region and change over time.",
      },
    },
    {
      heading: "Where Opinion DNA fits",
      content:
        "Opinion DNA is a different kind of tool from the instruments above, and it is worth being exact about how. It is a consumer and team assessment that anyone can take without a practitioner. It does not come with a certification program, and it should not be presented to a leadership team as a substitute for a certified-practitioner instrument that someone in HR has been trained to interpret.\n\n" +
        "What it offers is breadth that Step II does not attempt. The assessment is 179 questions, takes about 10 to 15 minutes, and scores each person on 48 continuous dimensions from 0 to 100, benchmarked against population averages. The dimensions sit in three layers:\n\n" +
        "- Personality (12): the Big Five, the Dark Triad traits, two emotion-regulation styles, mortality concern, and life satisfaction\n" +
        "- Values (24): five moral foundations, seven cooperative virtues, ten personal values, plus social dominance and authoritarianism\n" +
        "- Meta-Thinking (12): thinking-style measures such as dogmatism and need for cognition, plus beliefs about what kind of world we live in\n\n" +
        "Step II describes personality preferences in fine detail. It does not measure the second and third layers, and that is where many team conflicts live. Two managers who share an MBTI type can still sit far apart on [social dominance](/dimensions/social-dominance), which captures how comfortable someone is with hierarchy, or on [deference](/dimensions/deference), the willingness to yield to status in everyday work. People high in [need for cognition](/dimensions/need-for-cognition) enjoy effortful thinking, so they may relish a long debate that colleagues find draining. [Intellectual humility](/dimensions/intellectual-humility) describes how readily someone accepts that a view could be wrong, and [intolerance for uncertainty](/dimensions/intolerance-for-uncertainty) tracks how much ambiguity bothers them, which can show up as pressure to decide before the data is in.\n\n" +
        "Each person gets an AI-generated personal report covering personality, values, meta-thinking, career, and relationships. The scores come from the answers; the AI writes the interpretation. For groups, the [Opinion DNA for teams](/teams) option compares members side by side, with group-level patterns and pairwise comparisons; teams set it up by contacting us. Our guide to [personality assessment for teams](/for/teams-and-leadership) explains how teams use those results. Our own hiring guidance recommends using Opinion DNA after an offer is accepted, to help a new hire and the team understand each other.\n\n" +
        "Opinion DNA was built over three years with more than 60 experts from Oxford, Cambridge, NYU, Royal Holloway, and UPenn, and it uses peer-reviewed psychometric scales. It costs $47 per person as a one-time purchase, with lifetime access and a 30-day money-back guarantee.",
    },
    {
      heading: "Using Step II and Opinion DNA together",
      content:
        "If your organization already has MBTI-certified practitioners and a shared type vocabulary, there is no need to throw that away. Step II and Opinion DNA answer different questions, and they can sit side by side.\n\n" +
        "Step II is good at the conversation about style: how someone takes in information, how they come to decisions, how they like to structure their time. The facets make that conversation more precise than a four-letter type alone. Opinion DNA adds the conversation about substance: what each person is trying to protect or achieve, which arguments they find persuasive, and how they behave when the facts are unclear.\n\n" +
        "One practical sequence:\n\n" +
        "- Run Step II with a certified practitioner for the type and facet debrief\n" +
        "- Have each person take Opinion DNA on their own and read their personal report\n" +
        "- Bring the team together around the values and meta-thinking results, where type language runs out\n\n" +
        "When a disagreement keeps recurring, the values layer can explain it better than type does. A manager high on [authority](/dimensions/authority) and a report high on [self-direction](/dimensions/self-direction) can share a type and still clash whenever a decision has to be made, because they disagree about who should be making it. Our [Opinion DNA vs Myers-Briggs comparison](/vs/opinion-dna-vs-myers-briggs) goes through the two approaches in more detail.",
    },
    {
      heading: "Which option suits which situation",
      content:
        "There is no single best Step II alternative. The right choice depends on who will administer it, what you need it to measure, and what the results are for.\n\n" +
        "- You already have MBTI-certified practitioners and want more resolution than a four-letter type: stay with Step II.\n" +
        "- You want a long-established trait profile for hiring or development and can accredit someone: look at the 16pf or the Hogan Personality Inventory.\n" +
        "- You need a facet-level Big Five profile and have a qualified psychologist involved: the NEO-PI-3 is built for that.\n" +
        "- You run workshop-based L&D and are willing to qualify a practitioner: Lumina Spark is designed around that model.\n" +
        "- You want each person to understand their values and thinking style, and you want team members to be able to take it without a practitioner: Opinion DNA fits.\n\n" +
        "If you are leading the evaluation, the simplest test is to take Opinion DNA yourself and judge the report against what you already know about how you work. You can start with [the full assessment](/personal-assessment); it takes about 10 to 15 minutes, and the 30-day money-back guarantee covers you if it is not useful.",
    },
  ],
  faq: [
    {
      question: "What is the MBTI Step II?",
      answer:
        "MBTI Step II is an extended version of the Myers-Briggs Type Indicator from The Myers-Briggs Company. It reports the familiar four-letter type and then breaks each of the four preference pairs into five facets, for 20 facets in all. The publisher describes the current English questionnaire, MBTI Global Step II, as 143 items, with results delivered in a Profile Report or an Interpretive Report.",
    },
    {
      question: "Do you need to be certified to use MBTI Step II?",
      answer:
        "Yes. The Myers & Briggs Foundation says Step II is only available through an MBTI Step II certified professional. The publisher's certification program covers both Step I and Step II, runs about four days in person or online, and requires a score of 80% or higher on the final exam. Individuals buying on their own through MBTIonline get the standard four-letter type.",
    },
    {
      question: "What is a facet-level personality assessment?",
      answer:
        "A facet-level assessment reports narrow traits beneath broad ones. Step II puts five facets under each MBTI preference pair. The NEO-PI-3 puts six facets under each Big Five domain, and the Hogan Personality Inventory breaks seven scales into 42 subscales. Facets matter because two people with the same broad score can reach it in different ways, and the difference can show up in day-to-day work.",
    },
    {
      question: "Is Opinion DNA a replacement for MBTI Step II?",
      answer:
        "Not in the sense of being a certified-practitioner instrument. Opinion DNA has no certification program, and it does not report MBTI types or facets. It measures 48 continuous dimensions across personality, values, and meta-thinking, including areas Step II does not cover, such as [social dominance](/dimensions/social-dominance) and [need for cognition](/dimensions/need-for-cognition). Teams can use the two together: Step II for the type conversation and Opinion DNA for values and thinking style. See our [Opinion DNA vs Myers-Briggs comparison](/vs/opinion-dna-vs-myers-briggs) for more.",
    },
    {
      question: "Which Step II alternatives can a team use without certification?",
      answer:
        "Of the instruments on this page, Opinion DNA is the one designed for people to take entirely on their own. Talogy states that the 16pf requires accreditation, Hogan says its certification is what qualifies professionals to administer its assessments, the NEO-PI-3 is sold to buyers at PAR's Qualification Level S or above, and Lumina runs a practitioner qualification for Spark. For group use, [Opinion DNA for teams](/teams) compares every member's results, and teams arrange it by contacting us.",
    },
  ],
  vsSlug: "opinion-dna-vs-myers-briggs",
  relatedDimensions: [
    "social-dominance",
    "deference",
    "need-for-cognition",
    "intellectual-humility",
    "intolerance-for-uncertainty",
    "self-direction",
  ],
  ctaHref: "/personal-assessment",
};
