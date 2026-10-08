import type { KeywordPage } from "../keywords";

// /tests/48-dimension-personality-test
// Targets: 48 personality test, 48 personalities, 48 traits test.
// Role: the "list of 48" reference. dimensionDirectory renders the full grouped
// list after the sections, so the copy frames it rather than repeating it.
// Depth-oriented sister page: /tests/deep-personality-analysis (keep linked).
export const fortyEightDimensionTestPage: KeywordPage = {
  slug: "48-dimension-personality-test",
  tier: 1,
  title: "48-Dimension Personality Test",
  metaTitle: "The 48-Dimension Personality Test",
  seoTitle: "48 Personality Test: All 48 Traits Listed and Explained",
  description:
    "The 48 personality test, explained: all 48 traits listed by layer, how each is scored 0 to 100 against the population, and how 179 questions measure them.",
  headline: "The 48-Dimension Personality Test",
  subheadline:
    "Opinion DNA measures 48 dimensions across three layers: 12 for personality, 24 for values, and 12 for meta-thinking. Here is how they are organized and scored, followed by the complete list with a one-line definition of each.",
  sections: [
    {
      heading: "Why 48 dimensions?",
      content:
        "The number came out of a question rather than a target. In 2020 the team behind Opinion DNA interviewed more than 60 experts in personality psychology, behavioral economics, evolutionary psychology, and cognition, asking what actually drives the way people see the world. The answers kept arriving in three parts: stable personality traits, the values people hold to be important, and the habits of mind that govern how they form and hold beliefs.\n\nOver the following three years, working with academic psychologists and behavioral scientists from Oxford, Cambridge, NYU, Royal Holloway, and the University of Pennsylvania, each of those three layers was filled with established constructs that already had peer-reviewed scales behind them. Nothing on the list was invented for the test. Count them up and you get 12 personality dimensions, 24 values, and 12 meta-thinking dimensions: 48 in all.\n\nThat breadth is the point. Most well-known assessments stay inside one layer: the Big Five covers five broad personality traits, and values inventories cover values. Measuring all three in one sitting lets you see how they interact, which is where most of the useful insight sits. If you are mainly interested in that depth, and how it compares with shorter tests, our page on [deep personality analysis](/tests/deep-personality-analysis) covers it. This page is the reference: what the 48 are, how they are grouped, and how they are scored.",
    },
    {
      heading: "48 dimensions, zero personality types",
      content:
        "If you searched for 48 personalities, expecting a system with 48 boxes to choose from, this test works differently. Each of the 48 dimensions is a scale, and everyone who takes the test gets a position on every one of them.\n\nType systems work by sorting. A typical one asks a set of either-or questions, assigns you to one side of each, and hands you the matching label. That is easy to remember, but it throws information away. Someone who barely leans introverted and someone who is intensely introverted get the same letter, and two people sitting either side of a cutoff get different labels despite being nearly identical.\n\nA dimensional test keeps that information. Your [Extraversion](/dimensions/extraversion) score might be 34 and your [Agreeableness](/dimensions/agreeableness) 81, and those exact positions carry into everything else in the profile. With 48 continuous scores the number of possible profiles is, for practical purposes, unlimited, which is the honest answer to how many personality types there are: as many as there are people.",
    },
    {
      heading: "How the 48 dimensions are organized",
      content:
        "The 48 sit in three layers, and each layer is split into smaller groups that come from distinct research traditions. The complete list, with a definition of every dimension, follows the sections below.\n\n### Personality: 12 dimensions\n\n- The Big Five (5): openness, conscientiousness, extraversion, agreeableness, and [neuroticism](/dimensions/neuroticism), the best-established model in trait psychology.\n- The Dark Triad (3): Machiavellianism, narcissism, and psychopathy, measured as ordinary trait levels in the general population.\n- Emotional regulation, mortality, and life satisfaction (4): how you manage emotions through reappraisal or suppression, how often you think about death, and how you rate your life overall.\n\n### Values: 24 dimensions\n\n- Moral Foundations (5): care, fairness, loyalty, authority, and purity, the intuitions behind moral judgment.\n- Cooperative Virtues (7): family, group, reciprocity, heroism, deference, equity, and property, from the morality-as-cooperation research program.\n- Personal Values (10): the values tradition founded by Shalom Schwartz, from power and achievement to [self-direction](/dimensions/self-direction), tradition, and security.\n- Social Orientation (2): social dominance and authoritarianism, your preferences about hierarchy and strong leadership.\n\n### Meta-Thinking: 12 dimensions\n\n- Meta-Thinking (8): dogmatism, need for cognition, intolerance for uncertainty, [intellectual humility](/dimensions/intellectual-humility), anthropomorphism, teleology, subjective numeracy, and just-world belief.\n- Primal World Beliefs (4): whether the world feels alive, enticing, safe, and good, from a research program at the University of Pennsylvania.\n\nEach layer answers a different question. Personality describes how you tend to act and feel. Values describe what you will defend and what you will trade away. Meta-thinking describes the machinery you use to form opinions in the first place, and it is the layer most people have never had measured.",
    },
    {
      heading: "How each dimension is scored",
      content:
        "Every dimension gets a continuous score from 0 to 100. Continuous means your exact position is kept: a 52 and a 95 on the same trait are reported as exactly that, because the gap between them is often the most useful thing to know.\n\nEach score is shown next to the population average for that dimension, drawn from other people who have taken the assessment, and those averages update as more people complete it. The comparison matters because 50 is an arbitrary midpoint. A 70 means one thing if most people land around 40 and something quite different if most land around 75, so the useful question is where you sit relative to everyone else.\n\nTwo more points are worth knowing before you read your results. First, the scores come straight from your answers. AI does not calculate them; its job starts afterward, with interpretation. Second, Opinion DNA is not a clinical instrument. A high score on [narcissism](/dimensions/narcissism) or [neuroticism](/dimensions/neuroticism) describes where you sit on a trait that everyone has to some degree, and no score on any dimension is a diagnosis. The [methodology](/methodology) page covers the scoring approach and the research behind each scale in more detail.",
    },
    {
      heading: "How 179 questions cover 48 dimensions",
      content:
        "The assessment is 179 short statements, each answered on an agree to disagree scale, and most people finish in 10 to 15 minutes. That works out to an average of between three and four statements per dimension. The number varies with the construct: each of the Big Five traits, for example, is measured with five statements, and other dimensions use more or fewer.\n\nThis is a common approach in psychometric research when many traits need measuring at once: short scales whose statements have already been tested for how well they track the construct. A long inventory devoted to a single trait will pin that trait down more finely; short validated scales let you cover far more ground in one sitting. For a profile meant to show how 48 dimensions interact, breadth is the better trade.\n\nA few practical details: some statements are worded in reverse, so that agreeing counts against the trait, which is a standard way to limit the effect of simply agreeing with everything. Your progress saves after every answer, so you can stop and come back. And because the questions are statements about you, there are no right answers to prepare for. The most useful thing you can do is answer honestly.",
    },
    {
      heading: "How to read a profile with 48 numbers",
      content:
        "Forty-eight scores is a lot to take in at once, and reading them one by one is the least useful way to do it. A better order:\n\n- Start with the outliers. The dimensions where you sit furthest from the population average are, almost by definition, the most distinctive things about your profile.\n- Read within groups. Your five moral foundations, for instance, mean more as a shape than as five separate numbers: a profile led by [care](/dimensions/care) and fairness reads very differently from one led by loyalty and authority.\n- Look for tension across layers. High openness alongside high intolerance for uncertainty describes someone drawn to new ideas but uneasy with where they lead. High [dogmatism](/dimensions/dogmatism) next to high need for cognition describes someone who thinks hard and still ends up certain.\n\nYou do not have to do this yourself. The AI-written report reads all 48 scores as a combination and turns them into a narrative covering your life and happiness, relationships, career, and Cognitive Signature, with every dimension explained in the context of your profile. If you are curious why the product is called Opinion DNA in the first place, our [DNA personality test](/tests/dna-personality-test) page explains the metaphor (no genetics involved).\n\nThe complete list of all 48 dimensions follows, grouped by layer, each linked to its own page with a fuller explanation. When you want your own scores, [take the full assessment](/personal-assessment).",
    },
  ],
  faq: [
    {
      question: "What is the 48 personality test?",
      answer:
        "The 48-dimension personality test is Opinion DNA, an assessment that scores you on 48 dimensions across three layers: 12 personality traits, 24 values, and 12 meta-thinking dimensions. It takes 179 questions and about 10 to 15 minutes, and every dimension is scored from 0 to 100 against the population average.",
    },
    {
      question: "Are there 48 personality types?",
      answer:
        "No. The 48 are dimensions, and everyone gets a score on all of them. Type systems sort people into a fixed number of categories; a dimensional profile keeps your exact position on each scale, so the number of possible profiles is effectively unlimited.",
    },
    {
      question: "What are the 48 traits?",
      answer:
        "Personality (12): the Big Five, the Dark Triad, emotional reappraisal, suppression tendency, mortality concern, and life satisfaction. Values (24): five moral foundations, seven cooperative virtues, ten Schwartz personal values, and two social orientation measures. Meta-Thinking (12): eight dimensions of cognitive style, from [dogmatism](/dimensions/dogmatism) to just-world belief, plus four primal world beliefs. Every one is listed with a definition on this page, and the [dimensions](/dimensions) hub has a full page for each.",
    },
    {
      question: "Is 48 dimensions too many to be useful?",
      answer:
        "It would be if you had to interpret them alone. The scores are grouped into three layers, each shown against the population average, and the AI-written report reads them together and turns them into a readable narrative. If depth is what you are after, our page on [deep personality analysis](/tests/deep-personality-analysis) explains what the extra dimensions add.",
    },
    {
      question: "How much does the 48-dimension test cost?",
      answer:
        "$47, one time, with lifetime access to your scores and report. There is no subscription, and a 30-day money-back guarantee applies if it is not for you. You can start from the [personal assessment](/personal-assessment) page.",
    },
  ],
  dimensionDirectory: true,
  ctaHref: "/personal-assessment",
};
