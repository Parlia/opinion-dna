export interface KeywordPage {
  slug: string;
  tier: 1 | 2 | 4;
  title: string;
  metaTitle: string;
  description: string;
  headline: string;
  subheadline: string;
  sections: { heading: string; content: string }[];
  comparisonNote?: string;
  faq: { question: string; answer: string }[];
}

export const keywordPages: KeywordPage[] = [
  // ── Tier 1: High Purchase Intent ──────────────────────────────
  {
    slug: "detailed-personality-test-with-report",
    tier: 1,
    title: "Detailed Personality Test with Report",
    metaTitle: "Detailed Personality Test with Full Report — 48 Dimensions",
    description: "Take the most detailed personality test available online. 48 dimensions across personality, values, and meta-thinking with an AI-generated personal report covering life, career, and relationships.",
    headline: "The most detailed personality test you'll ever take",
    subheadline: "48 dimensions. 179 questions. An AI-generated report that covers your personality, values, thinking patterns, career, relationships, and life satisfaction.",
    sections: [
      { heading: "What makes a personality test truly detailed?", content: "Most \"detailed\" personality tests measure 5-16 dimensions. They cover personality traits — and stop there. A truly detailed assessment measures not just how you behave, but what you value and how you think. Opinion DNA measures 48 dimensions across three categories: Personality (Big Five + Dark Triad + emotional regulation), Values (moral foundations + cooperative virtues + personal values), and Meta-Thinking (cognitive biases + primal world beliefs). Each dimension is scored on a continuous 0-100 scale with population comparison." },
      { heading: "What's in the report?", content: "Your AI-generated report is not a template with your name inserted. It's a personalized narrative written by AI that has analyzed all 48 of your dimension scores together. The report covers six areas: a guide to reading your scores, a deep dive into your personality, an analysis of your values, insights into your meta-thinking patterns, career implications, and relationship insights. Each section includes specific observations and actionable recommendations unique to your profile." },
      { heading: "The 48 dimensions explained", content: "Personality (12 elements): The Big Five traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), the Dark Triad (Machiavellianism, Narcissism, Psychopathy), plus Emotional Reappraisal, Suppression, Mortality Concern, and Life Satisfaction. Values (24 elements): Moral Foundations (Care, Fairness, Loyalty, Authority, Purity), Cooperative Virtues (Family, Group, Reciprocity, Heroism, Deference, Equity, Property), Personal Values (Power, Achievement, Hedonism, Stimulation, Self-Direction, Universalism, Benevolence, Conformity, Tradition, Security), and Social Orientation. Meta-Thinking (12 elements): Dogmatism, Need for Cognition, Intolerance for Uncertainty, Intellectual Humility, Anthropomorphism, Teleology, Subjective Numeracy, Just World beliefs, and Primal World Beliefs (Alive, Enticing, Safe, Good)." },
      { heading: "Built with 60+ world experts", content: "Opinion DNA was developed over three years with academic psychologists and behavioral scientists from Oxford, Cambridge, NYU, Royal Holloway, and the University of Pennsylvania. Every dimension uses peer-reviewed psychometric scales. This isn't a BuzzFeed quiz with a PDF attached — it's a research-grade assessment with AI-powered interpretation." },
    ],
    faq: [
      { question: "How long does the assessment take?", answer: "10-15 minutes for 179 questions. Your progress is saved automatically, so you can pause and return." },
      { question: "When do I get my report?", answer: "Your 48-dimension scores are available immediately after completing the assessment. Your AI-generated personal report is generated within minutes." },
      { question: "What format is the report in?", answer: "Your report is available online in your Opinion DNA dashboard with an option to download as PDF." },
      { question: "Is the report personalized or template-based?", answer: "Fully personalized. The AI analyzes your specific combination of 48 dimension scores to generate a narrative unique to your profile. No two reports are the same." },
      { question: "How do I take the personality test?", answer: "Sign up at opiniondna.com, then answer 179 agree/disagree questions at your own pace. The assessment auto-saves your progress, so you can pause and return anytime. Most people finish in 10-15 minutes. Your results and AI-generated report are available immediately after completion." },
      { question: "Are personality tests accurate?", answer: "Tests using validated psychometric scales (like the Big Five) have strong accuracy for measuring stable traits. Opinion DNA uses peer-reviewed scales for all 48 dimensions, with continuous 0-100 scoring that captures nuance better than binary type systems. The key to accuracy is both the quality of the scales and the breadth of measurement — which is why we measure 48 dimensions, not 4 or 5." },
    ],
  },
  {
    slug: "comprehensive-personality-values-assessment",
    tier: 1,
    title: "Comprehensive Personality and Values Assessment",
    metaTitle: "Comprehensive Personality & Values Assessment — 48 Dimensions",
    description: "The only assessment that combines personality traits, values, moral foundations, and meta-thinking in one test. 48 dimensions built with researchers from Oxford, Cambridge, and NYU.",
    headline: "Personality and values in one comprehensive assessment",
    subheadline: "Most tests measure personality or values — never both. Opinion DNA is the first assessment to combine personality traits, moral foundations, cooperative virtues, and meta-thinking into one 48-dimension profile.",
    sections: [
      { heading: "Why personality alone isn't enough", content: "Personality tests tell you how you tend to behave — whether you're introverted or extraverted, agreeable or confrontational. But they don't tell you why. Two highly conscientious people can have completely different values: one driven by Achievement and Power, the other by Tradition and Security. Understanding the values underneath your personality transforms how you understand yourself." },
      { heading: "What Opinion DNA measures", content: "12 personality elements including the Big Five and Dark Triad. 24 value dimensions covering moral foundations (Care, Fairness, Loyalty, Authority, Purity), cooperative virtues (Family, Group, Reciprocity, Heroism, Deference, Equity, Property), and personal values (Power through Security). 12 meta-thinking elements covering cognitive biases and primal world beliefs. All scored on a 0-100 scale with population averages." },
      { heading: "Who this is for", content: "Opinion DNA is for anyone who wants more than a personality label. If you've taken the Big Five, Myers-Briggs, or Enneagram and felt like something was missing — the values and thinking patterns that actually drive your behavior — this assessment fills those gaps. It's used by individuals for personal growth, coaches for client intake, couples for relationship insight, and teams for deeper collaboration." },
    ],
    faq: [
      { question: "How is this different from taking separate personality and values tests?", answer: "Separate tests give separate results. Opinion DNA generates a unified profile where your personality, values, and thinking patterns are analyzed together. Your AI report shows how these dimensions interact — for example, how your Openness score combined with your Authority score shapes your approach to new ideas." },
      { question: "What does 'comprehensive' actually mean here?", answer: "48 dimensions across three categories. For comparison, the Big Five measures 5, MBTI measures 4, Enneagram measures 1 core type, and DISC measures 4. Opinion DNA is the most dimensionally comprehensive assessment available to consumers." },
    ],
  },
  {
    slug: "personality-values-thinking-style-report",
    tier: 1,
    title: "Personality, Values, and Thinking Style Report",
    metaTitle: "Personality, Values & Thinking Style Report — AI-Generated",
    description: "Get a comprehensive report covering your personality traits, core values, and thinking patterns. 48 dimensions analyzed by AI to generate insights unique to your profile.",
    headline: "Your personality. Your values. Your thinking style. One report.",
    subheadline: "Opinion DNA is the only assessment that maps all three — and generates an AI-powered personal report showing how they interact to shape your life, career, and relationships.",
    sections: [
      { heading: "Three dimensions, one you", content: "Your personality shapes how you engage with the world. Your values determine what matters to you. Your thinking style governs how you process information and form beliefs. These three dimensions interact constantly — yet most assessments measure only one. Opinion DNA measures all three across 48 elements, then uses AI to analyze how your specific combination creates your unique psychological fingerprint." },
      { heading: "What the report covers", content: "Your AI-generated report is organized into six sections: understanding your scores, personality deep-dive, values analysis, meta-thinking insights, career implications, and relationship insights. Each section draws on your full 48-dimension profile, connecting patterns across categories that a single-dimension test could never reveal." },
      { heading: "The thinking style dimension", content: "The most unique part of Opinion DNA is the Meta-Thinking category: Dogmatism, Need for Cognition, Intolerance for Uncertainty, Intellectual Humility, Anthropomorphism, Teleology, Subjective Numeracy, Just World beliefs, and four Primal World Beliefs (Alive, Enticing, Safe, Good). These patterns shape how you process every piece of information — and most people have never measured them." },
    ],
    faq: [
      { question: "What is a 'thinking style'?", answer: "Your thinking style (what we call Meta-Thinking) includes your cognitive biases, intellectual humility, comfort with uncertainty, and fundamental beliefs about how the world works. It's the operating system underneath your personality and values." },
      { question: "How does AI generate the report?", answer: "After you complete the assessment, AI analyzes your specific combination of 48 scores to write a narrative unique to your profile. It identifies patterns, connections between dimensions, and generates insights and recommendations specific to you." },
    ],
  },
  {
    slug: "deep-personality-analysis",
    tier: 1,
    title: "Deep Personality Analysis Online",
    metaTitle: "Deep Personality Analysis Online — 48 Dimensions",
    description: "Go deeper than any other online personality test. 48 dimensions of personality, values, and meta-thinking with an AI-generated analysis covering your life, career, and relationships.",
    headline: "How deep does your personality test go?",
    subheadline: "Big Five: 5 dimensions. MBTI: 4 dichotomies. Enneagram: 1 type. Opinion DNA: 48 dimensions across personality, values, and meta-thinking. There's no comparison.",
    sections: [
      { heading: "Depth comparison", content: "The Big Five measures 5 traits. MBTI sorts you into 16 types based on 4 binary preferences. Enneagram identifies 1 core type from 9. CliftonStrengths ranks 34 talent themes. Opinion DNA measures 48 continuous dimensions across three categories — personality, values, and meta-thinking. It includes the Big Five traits, adds the Dark Triad, emotional regulation, and life satisfaction, then goes further into moral foundations, cooperative virtues, personal values, cognitive biases, and primal world beliefs." },
      { heading: "Why depth matters", content: "Surface-level tests give you a label. Deep analysis gives you understanding. When you see that your Openness is high but your Intolerance for Uncertainty is also high, you understand a specific tension in your psychology. When you see that your Care score diverges sharply from your Fairness score, you understand why certain moral arguments resonate and others don't. Depth creates insight." },
      { heading: "Academic-grade, consumer-accessible", content: "Most deep psychological assessments are locked behind academic paywalls or require practitioner administration. Opinion DNA brings academic-grade psychometrics (peer-reviewed scales from Oxford, Cambridge, NYU, UPenn) into a consumer-friendly format: 179 questions, 10-15 minutes, immediate results, and an AI-generated personal report." },
    ],
    faq: [
      { question: "Is 48 dimensions overwhelming?", answer: "Not at all. Your results are organized into three clear categories (Personality, Values, Meta-Thinking) with visual scores and population comparisons. The AI-generated report synthesizes everything into a readable narrative — you don't need to interpret 48 numbers yourself." },
      { question: "How can a 10-15 minute test measure 48 dimensions?", answer: "Each dimension is measured with 3-4 carefully validated questions using peer-reviewed psychometric scales. The 179 questions are optimized for both accuracy and efficiency — the same approach used in academic research." },
    ],
  },
  {
    slug: "full-personality-test-report",
    tier: 1,
    title: "Full Personality Test Report",
    metaTitle: "Full Personality Test with Report & PDF Download",
    description: "Get your complete psychological profile: 48 dimensions of personality, values, and meta-thinking with an AI-generated report you can view online or download as PDF.",
    headline: "Your full personality report — 48 dimensions deep",
    subheadline: "Not a summary. Not a type label. A full AI-generated report analyzing your personality, values, and thinking patterns across 48 dimensions with actionable insights for your life.",
    sections: [
      { heading: "What 'full' means at Opinion DNA", content: "A full report means all 48 dimensions scored, analyzed, and interpreted. Your AI-generated report covers six sections: personality deep-dive (Big Five + Dark Triad + emotional regulation), values analysis (moral foundations + cooperative virtues + personal values), meta-thinking insights (cognitive biases + world beliefs), life and happiness analysis, career implications, and relationship insights. Every section is personalized to your specific score combination." },
      { heading: "Online and PDF formats", content: "View your full report online in your Opinion DNA dashboard, with clear visual scores and expandable sections. Download as a PDF for offline reading, printing, or sharing with a coach or therapist." },
      { heading: "One assessment, lifetime access", content: "Your $47 one-time purchase gives you lifetime access to your 48-dimension profile, AI-generated report, and comparison tools. No subscriptions, no recurring charges." },
    ],
    faq: [
      { question: "Can I download the report as PDF?", answer: "Yes. Your full report is available as a downloadable PDF from your dashboard, in addition to the online version." },
      { question: "How detailed is the report?", answer: "The AI-generated report typically runs several thousand words, organized into six main sections. It's comprehensive enough for serious self-reflection and coaching use, while remaining readable and engaging." },
    ],
  },
  {
    slug: "personality-test-with-actionable-insights",
    tier: 1,
    title: "Personality Test with Actionable Insights",
    metaTitle: "Personality Test with Actionable Insights — Not Just Labels",
    description: "Most personality tests tell you what you are. Opinion DNA tells you what to do about it — 48 dimensions with AI-generated insights for your life, career, and relationships.",
    headline: "A personality test that tells you what to do next",
    subheadline: "You don't need another label. You need insights you can act on. Opinion DNA's AI-generated report translates 48 dimensions into specific recommendations for your life, career, and relationships.",
    sections: [
      { heading: "The insight gap in personality testing", content: "Most personality tests end where they should begin. You find out you're an INTJ, or that your Openness is high, or that you're a Type 5 — and then what? You're left to figure out the implications yourself. Opinion DNA bridges this gap with an AI-generated report that doesn't just describe your profile — it interprets it and recommends action." },
      { heading: "What 'actionable' looks like", content: "Your report doesn't say 'You scored high on Dogmatism.' It explains what your specific Dogmatism score means in combination with your Intellectual Humility and Need for Cognition scores — and what concrete steps you can take to expand your thinking. It doesn't say 'You value Achievement.' It explains how your Achievement score interacts with your Self-Direction and Conformity scores to create specific career patterns — and what to do about it." },
      { heading: "Insights across your whole life", content: "Life and happiness: How your specific combination of Life Satisfaction, Mortality Concern, and Primal World Beliefs shapes your day-to-day experience. Career: How your values and personality traits predict satisfaction in different work environments. Relationships: How your moral foundations and emotional regulation patterns affect your connections. Each section includes specific, personalized recommendations." },
    ],
    faq: [
      { question: "How is the AI able to give personalized insights?", answer: "The AI analyzes your specific combination of 48 scores — not just individual dimensions, but how they interact. High Openness + High Conscientiousness creates a different pattern than High Openness + Low Conscientiousness. The AI identifies these interactions and generates insights specific to your profile." },
      { question: "Can I use these insights with a coach?", answer: "Absolutely. Many coaches use Opinion DNA reports as the foundation for coaching conversations. The 48-dimension profile and AI insights provide a rich starting point for exploration." },
    ],
  },

  // ── Tier 2: Differentiation Keywords ──────────────────────────
  {
    slug: "personality-and-values-combined-test",
    tier: 2,
    title: "Personality and Values Combined Test",
    metaTitle: "Personality and Values Combined Test — One Assessment",
    description: "The only test that measures personality traits AND values in one assessment. 48 dimensions including Big Five, moral foundations, cooperative virtues, and thinking patterns.",
    headline: "Personality and values — measured together for the first time",
    subheadline: "No other consumer assessment combines Big Five personality, moral foundations, cooperative virtues, personal values, and cognitive patterns in one test. Until now.",
    sections: [
      { heading: "Why combining matters", content: "Personality without values is half the picture. Two people with identical Big Five profiles can have completely different values — one might score high on Authority and Tradition, the other on Self-Direction and Universalism. Their behavior looks similar on the surface, but their motivations, decisions, and life paths diverge dramatically. Opinion DNA is the first consumer assessment to measure both in a single, unified profile." },
      { heading: "What you'll discover", content: "12 personality elements (Big Five + Dark Triad + emotional regulation + life satisfaction). 24 value dimensions (moral foundations + cooperative virtues + personal values + social orientation). 12 meta-thinking elements (cognitive biases + primal world beliefs). All analyzed together in an AI-generated report that shows how your personality and values interact." },
      { heading: "Developed by the experts who study both", content: "Most personality researchers study personality. Most values researchers study values. Opinion DNA was developed with 60+ experts across personality psychology, behavioral economics, evolutionary psychology, and cognition — bridging these traditionally separate fields into one comprehensive assessment." },
    ],
    faq: [
      { question: "Why don't other tests combine personality and values?", answer: "Academic traditions tend to silo. Personality psychologists use the Big Five; moral psychologists use Moral Foundations Theory; values researchers use Schwartz's model. Opinion DNA was specifically designed to bridge these fields because understanding yourself requires seeing the whole picture." },
      { question: "Are the values measurements scientifically validated?", answer: "Yes. The moral foundations scales come from Jonathan Haidt's research, cooperative virtues from Oliver Curry's Morality as Cooperation theory, and personal values from Schwartz's Theory of Basic Human Values. All peer-reviewed." },
    ],
  },
  {
    slug: "what-opinions-reveal-about-personality",
    tier: 2,
    title: "What Your Opinions Reveal About Your Personality",
    metaTitle: "What Your Opinions Reveal About Your Personality",
    description: "Your opinions aren't random — they're shaped by deep psychological patterns. Discover the personality traits, values, and thinking styles that drive what you believe and why.",
    headline: "Your opinions are not random",
    subheadline: "Every opinion you hold is shaped by your personality traits, moral foundations, cognitive biases, and primal world beliefs. Opinion DNA reveals the hidden patterns behind what you believe — and why.",
    sections: [
      { heading: "The opinion-personality connection", content: "Why do two intelligent people look at the same evidence and reach opposite conclusions? Because opinions aren't just about information — they're shaped by personality traits (Openness, Agreeableness), moral foundations (Care vs. Authority, Fairness vs. Loyalty), cognitive biases (Dogmatism, Need for Cognition, Teleological thinking), and primal world beliefs (is the world fundamentally safe or dangerous, good or threatening?). These psychological patterns act as invisible filters on everything you encounter." },
      { heading: "What Opinion DNA reveals", content: "Opinion DNA maps the 48 psychological dimensions that shape your opinions: the Big Five personality traits that predispose how you engage with ideas, the moral foundations that determine which arguments resonate with you, the cognitive patterns that determine how you process information, and the primal world beliefs that color your fundamental outlook. The result is a map of why you believe what you believe." },
      { heading: "From self-knowledge to self-improvement", content: "Understanding the patterns behind your opinions isn't just interesting — it's transformative. When you see that your high Dogmatism score interacts with low Intellectual Humility, you understand why changing your mind feels so difficult. When you see your moral foundations clearly, you understand why certain political or ethical positions feel obviously right while others feel repugnant. This awareness is the first step to more thoughtful, intentional thinking." },
    ],
    faq: [
      { question: "Is this about political opinions?", answer: "Not exclusively. Opinion DNA measures the psychological patterns that shape all your opinions — personal, professional, political, and philosophical. Your moral foundations, cognitive biases, and personality traits influence how you think about everything from career choices to relationship decisions to ethical dilemmas." },
      { question: "Will this change my opinions?", answer: "No. Opinion DNA reveals the patterns behind your opinions — it doesn't tell you which opinions are right or wrong. What it can do is help you understand why you hold certain views so strongly, and why others see the world differently." },
    ],
  },
  {
    slug: "understand-what-drives-your-thinking",
    tier: 2,
    title: "Understand What Drives Your Thinking",
    metaTitle: "Understand What Drives Your Thinking — Meta-Thinking Assessment",
    description: "Go beyond personality to understand how you think. Measure dogmatism, intellectual humility, cognitive biases, and primal world beliefs across 12 meta-thinking dimensions.",
    headline: "What's driving your thinking?",
    subheadline: "Your thinking style shapes everything — how you process information, form beliefs, and make decisions. Opinion DNA measures 12 meta-thinking dimensions that most assessments never touch.",
    sections: [
      { heading: "The hidden layer of psychology", content: "Personality tests measure your traits. Values assessments measure your priorities. But neither measures how you think — the cognitive machinery that processes everything else. Do you enjoy thinking deeply (Need for Cognition)? Are you comfortable with ambiguity (Intolerance for Uncertainty)? Do you tend toward rigid beliefs (Dogmatism)? Do you believe things happen for a reason (Teleology)? These meta-thinking patterns shape every thought you have." },
      { heading: "The 12 meta-thinking dimensions", content: "Dogmatism: Rigidity of beliefs and resistance to updating views. Need for Cognition: How much you enjoy thinking and intellectual effort. Intolerance for Uncertainty: Discomfort with ambiguity and unknown outcomes. Intellectual Humility: Recognition that your beliefs could be wrong. Anthropomorphism: Tendency to attribute human qualities to non-human things. Teleology: Belief that events happen for a purpose. Subjective Numeracy: Comfort with numerical and statistical thinking. Just World: Belief that people get what they deserve. Plus four Primal World Beliefs: Alive, Enticing, Safe, and Good." },
      { heading: "Why meta-thinking matters", content: "Your meta-thinking patterns are the lens through which you see everything. High Dogmatism combined with low Intellectual Humility creates a very different worldview than low Dogmatism with high Intellectual Humility — even if personality and values are identical. Understanding these patterns is the key to understanding not just what you think, but how and why." },
    ],
    faq: [
      { question: "What are Primal World Beliefs?", answer: "Primal World Beliefs are your fundamental assumptions about the nature of reality. Do you believe the world is Alive (has agency and responsiveness), Enticing (interesting and worth exploring), Safe (generally unthreatening), and Good (fundamentally positive)? These deep beliefs color everything else." },
      { question: "Can meta-thinking patterns change?", answer: "Yes, though they tend to be more stable than opinions. Intellectual Humility can be cultivated. Dogmatism can be reduced through deliberate practice. Understanding your baseline is the first step." },
    ],
  },
  {
    slug: "personality-bias-test",
    tier: 2,
    title: "Personality Bias Test",
    metaTitle: "Personality Bias Test — Measure Your Cognitive Patterns",
    description: "Discover the cognitive biases wired into your thinking. Measure dogmatism, just world beliefs, teleological thinking, and intellectual humility across 12 meta-thinking dimensions.",
    headline: "What biases are built into your thinking?",
    subheadline: "Everyone has cognitive biases. The question is: which ones? Opinion DNA measures 12 meta-thinking dimensions that reveal the specific patterns shaping how you process information and form beliefs.",
    sections: [
      { heading: "Beyond generic bias lists", content: "You've probably seen lists of cognitive biases — confirmation bias, anchoring, availability heuristic. But knowing biases exist is different from measuring your specific patterns. Opinion DNA doesn't just tell you that biases exist. It measures your actual levels of Dogmatism, Just World belief, Teleological thinking, and more — giving you a personal cognitive fingerprint." },
      { heading: "The biases Opinion DNA measures", content: "Dogmatism: How rigidly you hold beliefs and how resistant you are to updating them. Just World belief: How strongly you believe people get what they deserve. Teleological thinking: How much you believe things happen for a purpose or reason. Intellectual Humility: How open you are to the possibility that you're wrong. Intolerance for Uncertainty: How uncomfortable you are with ambiguity. Anthropomorphism: How much you attribute human intentions to non-human things. Plus Subjective Numeracy and four Primal World Beliefs." },
      { heading: "What to do with this knowledge", content: "Your AI-generated report doesn't just list your bias scores — it explains how they interact and what they mean for your daily life. High Dogmatism + Low Intellectual Humility creates a very different pattern than Low Dogmatism + High Need for Cognition. Understanding your specific combination helps you think more clearly and make better decisions." },
    ],
    faq: [
      { question: "Will this make me feel bad about my biases?", answer: "No. Everyone has cognitive biases — they're features of human cognition, not character flaws. Opinion DNA presents your patterns neutrally and helps you understand them. The goal is awareness, not judgment." },
      { question: "How accurate is self-reported bias measurement?", answer: "The scales used in Opinion DNA (Dogmatism Scale, Need for Cognition Scale, etc.) are peer-reviewed psychometric instruments validated in academic research. They measure cognitive tendencies through behavioral indicators, not just self-assessment of bias." },
    ],
  },
  {
    slug: "cognitive-bias-assessment",
    tier: 2,
    title: "Cognitive Bias Assessment",
    metaTitle: "Cognitive Bias Assessment — Measure Your Thinking Patterns",
    description: "Measure the cognitive biases that shape your decisions. Dogmatism, intellectual humility, just world beliefs, and 9 more meta-thinking dimensions — scientifically validated.",
    headline: "A scientific assessment of your cognitive biases",
    subheadline: "Not a quiz about bias names. A validated psychometric assessment measuring your actual cognitive patterns — dogmatism, intellectual humility, just world beliefs, and more.",
    sections: [
      { heading: "Real measurement, not trivia", content: "Most 'cognitive bias tests' online are quizzes that test whether you can identify biases by name. That's trivia, not assessment. Opinion DNA uses peer-reviewed psychometric scales to measure your actual cognitive patterns — how dogmatic your thinking tends to be, how much you need cognitive engagement, how comfortable you are with uncertainty, and whether you believe the world is fundamentally just." },
      { heading: "12 meta-thinking dimensions", content: "Opinion DNA measures 12 meta-thinking elements as part of its 48-dimension assessment. These include classical cognitive pattern measures (Dogmatism, Need for Cognition, Intellectual Humility) and deeper belief structures (Just World, Teleology, Primal World Beliefs). Together, they create a comprehensive map of how your mind processes information." },
      { heading: "Part of the complete picture", content: "Cognitive biases don't operate in isolation. Your personality traits and values interact with your thinking patterns. Opinion DNA measures all three — 48 dimensions total — and your AI-generated report analyzes how they work together. A highly open person with high dogmatism experiences a very different internal landscape than a highly open person with low dogmatism." },
    ],
    faq: [
      { question: "Which cognitive biases does this measure?", answer: "Opinion DNA measures cognitive patterns including Dogmatism, Need for Cognition, Intolerance for Uncertainty, Intellectual Humility, Anthropomorphism, Teleology, Subjective Numeracy, Just World beliefs, and four Primal World Beliefs (Alive, Enticing, Safe, Good)." },
      { question: "Is this used in academic research?", answer: "The individual scales used in Opinion DNA are widely used in academic research. The assessment itself was developed with researchers from Oxford, Cambridge, NYU, Royal Holloway, and UPenn." },
    ],
  },
  {
    slug: "opinion-personality-correlation",
    tier: 2,
    title: "Opinion and Personality Correlation",
    metaTitle: "How Opinions and Personality Are Connected",
    description: "Discover the scientific connection between your opinions and your personality. Map the traits, values, and cognitive patterns that predict what you believe and why.",
    headline: "The science of why you believe what you believe",
    subheadline: "Your opinions aren't formed in a vacuum. They're systematically shaped by personality traits, moral foundations, and cognitive biases. Opinion DNA maps these connections across 48 dimensions.",
    sections: [
      { heading: "Opinions are psychological predictions", content: "Decades of research show that personality traits predict opinions with surprising accuracy. High Openness correlates with progressive views. High Conscientiousness correlates with traditional values. Moral Foundations — Care, Fairness, Loyalty, Authority, Purity — predict political and ethical positions. Cognitive patterns like Dogmatism and Need for Cognition determine how strongly you hold opinions and how willing you are to revise them." },
      { heading: "What Opinion DNA reveals about this connection", content: "Opinion DNA maps 48 dimensions that research shows are connected to opinion formation: the Big Five personality traits that predispose certain worldviews, the moral foundations that determine which ethical arguments resonate, the values that guide your priorities, and the meta-thinking patterns that determine how you process competing claims. The result is a comprehensive map of your opinion-forming psychology." },
      { heading: "Understanding, not judgment", content: "The goal isn't to categorize your opinions as right or wrong. It's to help you understand the deep structures that shape why you see the world the way you do — and why others see it differently. When you understand that moral foundation differences drive most political disagreements, you can engage with opposing views more productively." },
    ],
    faq: [
      { question: "Is this a political compass test?", answer: "No. Opinion DNA doesn't measure your political positions. It measures the psychological dimensions — personality, values, moral foundations, cognitive biases — that research shows are correlated with opinion formation across all domains, not just politics." },
      { question: "Can understanding these correlations change my opinions?", answer: "Understanding doesn't necessarily change opinions, but it often increases empathy and reduces the intensity of disagreement. When you see that your opponent's view is rooted in genuinely different moral foundations (not stupidity or malice), productive dialogue becomes possible." },
    ],
  },
  {
    slug: "values-worldview-assessment",
    tier: 2,
    title: "Values and Worldview Assessment",
    metaTitle: "Values and Worldview Assessment — 36 Dimensions",
    description: "Map your values and worldview across 36 dimensions — moral foundations, cooperative virtues, personal values, and primal world beliefs. Understand the forces that shape your perspective.",
    headline: "Map your values and worldview",
    subheadline: "24 value dimensions plus 12 meta-thinking dimensions — including moral foundations, cooperative virtues, and primal world beliefs. The most comprehensive values and worldview assessment available.",
    sections: [
      { heading: "Values shape everything", content: "Your values determine your priorities, your decisions, and your sense of right and wrong. But most people have never measured their values with precision. Opinion DNA maps 24 value dimensions using peer-reviewed scales: 5 moral foundations (Care, Fairness, Loyalty, Authority, Purity), 7 cooperative virtues (Family, Group, Reciprocity, Heroism, Deference, Equity, Property), 10 personal values (Power through Security), and 2 social orientation measures (Social Dominance, Authoritarianism)." },
      { heading: "Worldview: your primal beliefs", content: "Underneath your values sit even deeper structures: your primal world beliefs. Do you believe the world is Alive (responsive and intentional)? Enticing (interesting and worth exploring)? Safe (generally unthreatening)? Good (fundamentally positive)? These four primal beliefs, researched at UPenn, color everything you experience and believe." },
      { heading: "Values + worldview = understanding", content: "When you see your values and worldview mapped together, patterns emerge. Someone who believes the world is fundamentally unsafe and values Security and Authority highly will approach life very differently from someone who believes the world is enticing and values Self-Direction and Stimulation. Opinion DNA makes these patterns visible." },
    ],
    faq: [
      { question: "What are moral foundations?", answer: "Moral Foundations Theory, developed by Jonathan Haidt, identifies five core moral intuitions: Care/Harm, Fairness/Cheating, Loyalty/Betrayal, Authority/Subversion, and Purity/Degradation. Different people weight these foundations differently, which predicts moral and political views." },
      { question: "What are primal world beliefs?", answer: "Primal World Beliefs, researched at the University of Pennsylvania, are your fundamental assumptions about reality: whether the world is Alive (has agency), Enticing (worth exploring), Safe (unthreatening), and Good (fundamentally positive). These beliefs are remarkably stable and influence well-being, relationships, and life choices." },
    ],
  },
  {
    slug: "thinking-style-test",
    tier: 2,
    title: "Thinking Style Test",
    metaTitle: "Thinking Style Test — 12 Cognitive Dimensions",
    description: "Discover your thinking style across 12 dimensions. Measure how dogmatic, intellectually humble, and cognitively engaged you are — with primal world beliefs included.",
    headline: "What's your thinking style?",
    subheadline: "Not a learning style quiz. A scientific assessment of 12 meta-thinking dimensions — dogmatism, intellectual humility, need for cognition, and primal world beliefs — that reveal how your mind actually works.",
    sections: [
      { heading: "Thinking style ≠ learning style", content: "Learning style tests (visual, auditory, kinesthetic) have been largely debunked by research. Thinking style is different — it's about the cognitive patterns that shape how you process information, form beliefs, and make decisions. Opinion DNA measures 12 validated meta-thinking dimensions that determine whether you enjoy thinking deeply, tolerate ambiguity, update beliefs easily, or tend toward rigid certainty." },
      { heading: "The 12 thinking dimensions", content: "Need for Cognition: Do you enjoy thinking deeply, or prefer simpler processing? Dogmatism: How rigidly do you hold your beliefs? Intellectual Humility: How open are you to being wrong? Intolerance for Uncertainty: How uncomfortable does ambiguity make you? Subjective Numeracy: How comfortable are you with numbers and statistics? Just World: Do you believe people get what they deserve? Teleology: Do you believe things happen for a purpose? Anthropomorphism: Do you attribute human intentions to non-human things? Plus four Primal World Beliefs: Alive, Enticing, Safe, Good." },
      { heading: "Part of the complete picture", content: "Thinking style is one of three dimensions measured by Opinion DNA (alongside personality and values). Your AI-generated report shows how all three interact — because a high-Need-for-Cognition thinker with high Care values processes ethical dilemmas differently than a high-Need-for-Cognition thinker with high Authority values." },
    ],
    faq: [
      { question: "How is this different from a cognitive ability test?", answer: "This is not an IQ or ability test. It measures your thinking tendencies and preferences — not how smart you are, but how your mind naturally processes information and forms beliefs." },
      { question: "Can thinking styles change?", answer: "Yes, though they tend to be stable. Intellectual Humility can be cultivated through practice. Dogmatism can decrease with exposure to diverse perspectives. Understanding your baseline is the first step toward intentional cognitive growth." },
    ],
  },

  // ── Tier 4: Competitor Gap Keywords ───────────────────────────
  {
    slug: "better-than-16personalities",
    tier: 4,
    title: "Looking for Something Better Than 16Personalities?",
    metaTitle: "Better Than 16Personalities — 48 Dimensions vs. 16 Types",
    description: "16Personalities is fun but limited. Discover a personality assessment with 48 research-backed dimensions, values measurement, and an AI-generated personal report.",
    headline: "You've outgrown 16 types",
    subheadline: "16Personalities gives you a fun label. Opinion DNA gives you 48 research-backed dimensions across personality, values, and meta-thinking — because you're more complex than four letters.",
    sections: [
      { heading: "What 16Personalities gets right", content: "16Personalities is engaging, well-designed, and accessible. It's the world's most popular personality test for good reason — it makes psychology approachable. If you've never taken a personality test before, it's a great starting point." },
      { heading: "Where 16Personalities falls short", content: "Scientific validity: MBTI-based typing has limited support in peer-reviewed research. Up to 50% of people get a different type on retake. Binary categories: You're either Thinking or Feeling, never a nuanced blend. No values: It doesn't measure moral foundations, cooperative virtues, or personal values. No meta-thinking: Cognitive biases, intellectual humility, and world beliefs are completely absent. Depth: 4 dichotomies vs. 48 continuous dimensions." },
      { heading: "The next level: Opinion DNA", content: "Opinion DNA includes Big Five personality traits (the scientifically validated model underneath 16Personalities), plus the Dark Triad, emotional regulation, 24 value dimensions, and 12 meta-thinking elements. You get continuous scores (not binary types), population comparisons, and an AI-generated report covering your life, career, and relationships. It's what personality testing looks like when built by academic researchers, not adapted from a 1940s framework." },
    ],
    comparisonNote: "16Personalities: 4 binary preferences → 16 types. Opinion DNA: 48 continuous dimensions → unique profile.",
    faq: [
      { question: "Is Opinion DNA harder to understand than 16Personalities?", answer: "No. Your results are organized into three clear categories with visual scores and an AI-generated narrative report. You don't need to memorize a type — you get a complete, readable analysis of your 48-dimension profile." },
      { question: "I already know my 16Personalities type. Will I learn something new?", answer: "Almost certainly. Opinion DNA measures 44 dimensions that 16Personalities doesn't touch — including moral foundations, cooperative virtues, cognitive biases, and primal world beliefs. Most people are surprised by their meta-thinking scores." },
    ],
  },
  {
    slug: "beyond-myers-briggs",
    tier: 4,
    title: "Beyond Myers-Briggs: Modern Personality Assessment",
    metaTitle: "Beyond Myers-Briggs — 48-Dimension Modern Assessment",
    description: "MBTI was designed in the 1940s. Opinion DNA was built with 60+ modern researchers. 48 dimensions. Continuous scores. Values and meta-thinking included. Welcome to modern personality assessment.",
    headline: "Personality science has moved beyond Myers-Briggs",
    subheadline: "MBTI was groundbreaking in the 1940s. But psychology has advanced enormously since then. Opinion DNA represents what modern personality assessment looks like: 48 dimensions, continuous scores, and AI-powered insights.",
    sections: [
      { heading: "The MBTI legacy", content: "Myers-Briggs made personality accessible to millions. That's a genuine achievement. But the science underneath has significant limitations: binary categorization that doesn't reflect psychological reality, low test-retest reliability, and a framework that predates most of modern personality science. Psychology has moved on — from typing to trait-based measurement, from personality-only to multi-dimensional profiling." },
      { heading: "What modern assessment looks like", content: "Modern personality science is built on: continuous traits (not binary types) — you're 73% on Extraversion, not 'an Extravert.' Validated scales — the Big Five model has decades of cross-cultural validation. Multi-dimensional measurement — personality alone is incomplete without values and cognitive patterns. Population-normed scores — comparison to representative samples, not just categories. AI-powered interpretation — personalized analysis of your unique score combination." },
      { heading: "Opinion DNA: built for 2026", content: "Opinion DNA incorporates everything modern psychology has learned. 48 dimensions covering personality (Big Five + Dark Triad), values (moral foundations + cooperative virtues + personal values), and meta-thinking (cognitive biases + primal world beliefs). Developed with 60+ researchers from Oxford, Cambridge, NYU, and UPenn. AI-generated reports that analyze your specific combination of scores, not template text." },
    ],
    faq: [
      { question: "Is MBTI completely invalid?", answer: "MBTI captures real patterns — but in an imprecise way. The underlying preferences (Introversion/Extraversion, etc.) are real dimensions, but forcing them into binary categories loses important information. Modern trait models like the Big Five (included in Opinion DNA) measure these same dimensions on continuous scales, which is more accurate and reliable." },
      { question: "My company uses MBTI. Should I suggest switching?", answer: "Opinion DNA offers team assessments that provide much richer data for team dynamics, communication, and collaboration. The 48-dimension profiles reveal values differences and cognitive diversity that MBTI cannot detect. Contact us for team pricing." },
    ],
  },
  {
    slug: "most-accurate-personality-test",
    tier: 4,
    title: "Most Accurate Personality Test Online",
    metaTitle: "Most Accurate Personality Test Online — 48 Dimensions",
    description: "Accuracy requires validated science and sufficient dimensions. Opinion DNA uses peer-reviewed scales from Oxford, Cambridge, and NYU to measure 48 dimensions — the most accurate assessment available online.",
    headline: "What makes a personality test accurate?",
    subheadline: "Accuracy isn't about having more questions. It's about validated science, continuous measurement, and enough dimensions to capture human complexity. Opinion DNA delivers all three.",
    sections: [
      { heading: "Three pillars of accuracy", content: "1. Validated scales: Every dimension in Opinion DNA uses peer-reviewed psychometric scales — the same instruments used in academic research at Oxford, Cambridge, NYU, and UPenn. 2. Continuous measurement: Binary types (like MBTI) lose accuracy by forcing spectrums into categories. Opinion DNA scores every dimension on a continuous 0-100 scale. 3. Sufficient dimensions: Human psychology can't be accurately captured in 4-5 dimensions. Opinion DNA measures 48, covering personality, values, and meta-thinking." },
      { heading: "What accuracy means in practice", content: "An accurate personality test should: produce similar results when retaken (test-retest reliability), measure what it claims to measure (construct validity), predict real-world behavior (predictive validity), and capture meaningful differences between people (discriminant validity). The Big Five scales in Opinion DNA have decades of validation research supporting all four criteria. The values and meta-thinking scales have similarly strong psychometric properties." },
      { heading: "The Opinion DNA approach", content: "179 questions, carefully selected from peer-reviewed instruments, measuring 48 dimensions with 3-4 items per dimension. Each dimension scored on a 0-100 continuous scale. Population averages calculated from thousands of respondents. AI-generated interpretation that accounts for the interactions between all 48 dimensions. Developed over three years with 60+ academic researchers." },
    ],
    faq: [
      { question: "Why 3-4 questions per dimension?", answer: "This is standard in validated psychometric assessment. Each question is carefully selected to maximize measurement reliability with minimum respondent burden. The individual questions were developed and validated by academic researchers." },
      { question: "How does accuracy compare to, say, 16Personalities?", answer: "16Personalities uses the MBTI framework, which has well-documented issues with test-retest reliability (up to 50% type change on retake). Opinion DNA uses Big Five-based scales, which have much stronger reliability, plus adds 43 additional validated dimensions." },
    ],
  },
  {
    slug: "enneagram-alternative-test",
    tier: 4,
    title: "Enneagram Alternative: A Deeper Assessment",
    metaTitle: "Enneagram Alternative — 48 Dimensions Beyond 9 Types",
    description: "Love the Enneagram's focus on motivation? Go deeper with 48 dimensions covering personality, values, and thinking patterns — research-backed and AI-interpreted.",
    headline: "Everything you love about the Enneagram, plus 39 more dimensions",
    subheadline: "The Enneagram focuses on core motivations. Opinion DNA maps your complete psychology — personality traits, moral foundations, cooperative virtues, cognitive biases, and primal world beliefs — across 48 research-backed dimensions.",
    sections: [
      { heading: "What the Enneagram does well", content: "The Enneagram's focus on core motivations and fears provides genuine psychological insight. Its growth paths and stress lines offer practical development guidance. And its community is passionate and supportive. These are real strengths." },
      { heading: "What's missing", content: "The Enneagram has limited peer-reviewed validation. Nine types for all of human personality is necessarily reductive. And critically, it doesn't measure values (moral foundations, cooperative virtues), cognitive biases (dogmatism, intellectual humility), or primal world beliefs — dimensions that research shows are central to understanding behavior and decision-making." },
      { heading: "Opinion DNA as complement or upgrade", content: "If you're an Enneagram enthusiast, Opinion DNA doesn't replace your type knowledge — it expands it. Your Type 5's 'need for understanding' maps onto high Need for Cognition. Your Type 8's assertiveness maps onto Social Dominance and low Deference. But Opinion DNA adds 48 precise, research-backed dimensions that the Enneagram framework can't capture, with an AI report that synthesizes everything." },
    ],
    faq: [
      { question: "Can I use Opinion DNA alongside the Enneagram?", answer: "Absolutely. Many people find that Opinion DNA provides the scientific depth and specificity that complements the Enneagram's intuitive, motivation-focused framework." },
      { question: "Does Opinion DNA measure core motivations like the Enneagram?", answer: "Not directly. But your values scores (24 dimensions including Power, Achievement, Security, Self-Direction) and personality scores reveal the forces that drive your behavior — from a research-validated perspective." },
    ],
  },
  {
    slug: "big-five-test-with-report",
    tier: 4,
    title: "Big Five Test with Full Report",
    metaTitle: "Big Five Test with Full Report — Plus 43 More Dimensions",
    description: "Get your Big Five personality scores plus 43 additional dimensions — values, moral foundations, and meta-thinking — with an AI-generated personal report.",
    headline: "The Big Five — and 43 dimensions beyond",
    subheadline: "Get your Big Five scores plus the Dark Triad, moral foundations, cooperative virtues, personal values, and cognitive biases. All with an AI-generated report that ties everything together.",
    sections: [
      { heading: "The Big Five is a great start", content: "The Big Five personality model (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) is the most scientifically validated framework in personality psychology. It's a genuine achievement of psychological science. Opinion DNA includes all five traits — and then keeps going." },
      { heading: "What comes after the Big Five", content: "Opinion DNA adds: Dark Triad traits (Machiavellianism, Narcissism, Psychopathy) — the shadow side of personality. Emotional regulation and life satisfaction. 5 moral foundations (Care, Fairness, Loyalty, Authority, Purity). 7 cooperative virtues (Family, Group, Reciprocity, Heroism, Deference, Equity, Property). 10 personal values (Power through Security). 12 meta-thinking elements including cognitive biases and primal world beliefs. That's 48 dimensions total — the Big Five plus 43 more." },
      { heading: "The AI report difference", content: "Free Big Five tests give you five scores and maybe a paragraph each. Opinion DNA's AI-generated report analyzes all 48 dimensions together — showing how your Big Five traits interact with your values and thinking patterns to create your unique psychology. It covers your life, career, and relationships with specific, personalized insights." },
    ],
    faq: [
      { question: "If the Big Five is so good, why do I need more?", answer: "The Big Five tells you how you tend to behave. It doesn't tell you what you value, what moral foundations you prioritize, or how you process information. Two people with identical Big Five profiles can have radically different values and cognitive patterns. The Big Five is necessary but not sufficient for comprehensive self-understanding." },
      { question: "Are your Big Five scores compatible with other Big Five tests?", answer: "Yes. Opinion DNA uses validated Big Five scales, so your scores are comparable to other Big Five implementations. You'll just get 43 additional dimensions on top." },
    ],
  },
  {
    slug: "most-detailed-personality-test",
    tier: 4,
    title: "The Most Detailed Personality Test Online",
    metaTitle: "Most Detailed Personality Test — 48 Dimensions, AI Report",
    description: "Looking for the most detailed personality test available? 48 dimensions across personality, values, and meta-thinking. AI-generated report. Built with Oxford, Cambridge, NYU experts.",
    headline: "48 dimensions. The most detailed personality test you can take.",
    subheadline: "Big Five: 5. MBTI: 4. Enneagram: 9. CliftonStrengths: 34. Opinion DNA: 48 dimensions across personality, values, and meta-thinking — with an AI-generated personal report.",
    sections: [
      { heading: "Detail by the numbers", content: "Here's how Opinion DNA compares to every major personality assessment on dimensionality: MBTI: 4 binary preferences → 16 types. DISC: 4 behavioral styles. Big Five: 5 personality traits. Enneagram: 9 types with wings. VIA Character Strengths: 24 strengths. CliftonStrengths: 34 talent themes. Opinion DNA: 48 continuous dimensions across personality, values, and meta-thinking. It's not close." },
      { heading: "More dimensions, more insight", content: "More dimensions isn't better for its own sake — it's better because human psychology is complex. If you only measure personality, you miss values. If you only measure values, you miss cognitive patterns. If you only measure strengths, you miss the dark triad and biases. Opinion DNA is detailed because your psychology is detailed. 48 dimensions is what it takes to map the complete picture." },
      { heading: "Made comprehensible by AI", content: "48 dimensions could be overwhelming — if you had to interpret them yourself. Opinion DNA's AI-generated report does the synthesis for you, analyzing how your specific combination of scores across all 48 dimensions creates your unique psychological profile. You get the depth of a comprehensive assessment with the readability of a personal narrative." },
    ],
    faq: [
      { question: "Is more always better in personality testing?", answer: "No — more must be meaningful. Random extra dimensions add noise, not signal. Opinion DNA's 48 dimensions each represent a validated, research-backed psychological construct. They were selected by 60+ academic experts as the dimensions that matter most for comprehensive self-understanding." },
      { question: "How long does a 48-dimension assessment take?", answer: "10-15 minutes. Despite measuring 48 dimensions, the 179 questions are efficiently designed using validated psychometric methods. Your progress saves automatically if you need to pause." },
      { question: "Are there personality tests with 500+ questions?", answer: "Yes — the NEO-PI-R (240 items), MMPI-2 (567 items), and some academic inventories exceed 500 questions. But more questions doesn't always mean more insight. Opinion DNA's 179 questions measure 48 dimensions using validated short-form scales — the same approach used in modern psychometric research. The result is maximum breadth and accuracy in 10-15 minutes, rather than hours of testing." },
      { question: "Is Opinion DNA a subscription or one-time purchase?", answer: "One-time purchase of $47. You get lifetime access to your 48-dimension profile, AI-generated report, and comparison tools. No subscriptions, no recurring charges, no paywalls on your results." },
    ],
  },

  // ── Gap-Fill Pages (from Answer the Public data) ────────────
  {
    slug: "free-personality-test-online",
    tier: 2,
    title: "Free Personality Tests vs. Paid — What You Actually Get",
    metaTitle: "Free Personality Test Online — What's Free vs. What's Worth Paying For",
    description: "Comparing free personality tests to paid assessments. Understand what free tests measure, where they fall short, and when a comprehensive paid assessment like Opinion DNA is worth it.",
    headline: "Free personality tests: what you get and what you miss",
    subheadline: "Free personality tests are great for curiosity. But if you want real self-understanding — 48 dimensions, AI-generated insights, values, and thinking patterns — here's why the depth matters.",
    sections: [
      { heading: "What free personality tests actually measure", content: "Most free personality tests online measure a narrow slice of who you are. Free MBTI-style tests (like 16Personalities) sort you into 16 types based on 4 preferences. Free Big Five tests give you 5 trait scores. Free Enneagram quizzes identify 1 of 9 types. These are legitimate starting points — but they leave out your values, moral foundations, cognitive biases, and the thinking patterns that drive your behavior. You get a label, not a map." },
      { heading: "Where free tests fall short", content: "Free tests have three common limitations. First, they measure fewer dimensions — typically 4-9 vs. Opinion DNA's 48. Second, they rarely include personalized interpretation — you get generic descriptions for your type, not AI-generated analysis of your unique score combination. Third, they don't measure values or meta-thinking, which research shows are often more predictive of life satisfaction and decision-making than personality traits alone." },
      { heading: "When is a paid assessment worth it?", content: "If you're casually curious about your personality type, a free test is fine. But if you're using results for personal growth, coaching, career decisions, or relationship insight, the depth matters. Opinion DNA costs $47 one-time and measures 48 dimensions across personality, values, and meta-thinking with an AI-generated report. That's less than a single therapy session — and gives you a foundation for dozens of meaningful conversations about who you are." },
      { heading: "Free resources from Opinion DNA", content: "While the full 48-dimension assessment is $47, Opinion DNA publishes free content comparing personality tests, explaining psychometric concepts, and helping you understand what different assessments measure. Explore our comparison pages to see how major tests stack up before deciding what's right for you." },
    ],
    faq: [
      { question: "Is there a free version of Opinion DNA?", answer: "Opinion DNA is $47 one-time for the full 48-dimension assessment and AI-generated report. There's no free tier, because the depth and personalization of the assessment require significant computation and expert-developed scales. For free personality exploration, we recommend starting with a Big Five test, then upgrading to Opinion DNA when you're ready for comprehensive self-understanding." },
      { question: "Why do some personality tests charge money?", answer: "Free tests are typically funded by ads and use basic scoring. Paid assessments like Opinion DNA invest in peer-reviewed psychometric scales (licensed from academic researchers), AI-generated personalization, and broader measurement. The $47 covers 48 dimensions developed with 60+ experts from Oxford, Cambridge, NYU, and UPenn — a fundamentally different product than a free 4-dimension quiz." },
      { question: "What's the best free personality test?", answer: "For scientifically validated free options, the IPIP Big Five test is strong for personality traits. But no free test measures values, moral foundations, or cognitive biases. If you want the complete picture — personality, values, and meta-thinking — Opinion DNA is the most comprehensive option available." },
      { question: "Are free personality tests accurate?", answer: "Some free tests use validated scales (like the Big Five) and are reasonably accurate for what they measure. The issue isn't accuracy — it's completeness. A free Big Five test accurately measures 5 traits, but that's like accurately measuring 5 of 48 ingredients in a recipe. You need the whole picture for real self-understanding." },
    ],
  },
  {
    slug: "scientific-personality-test",
    tier: 2,
    title: "Scientific Personality Test — Peer-Reviewed Scales",
    metaTitle: "Scientific Personality Test — Peer-Reviewed, 48 Dimensions",
    description: "Looking for a scientifically valid personality test? Opinion DNA uses peer-reviewed psychometric scales from Oxford, Cambridge, and NYU across 48 dimensions of personality, values, and thinking.",
    headline: "A personality test backed by real science",
    subheadline: "Not all personality tests are created equal. Opinion DNA uses peer-reviewed psychometric scales developed by researchers from Oxford, Cambridge, NYU, and UPenn — measuring 48 dimensions with genuine scientific rigor.",
    sections: [
      { heading: "What makes a personality test 'scientific'?", content: "A scientifically valid personality test meets three criteria: reliability (consistent results over time), validity (measures what it claims to measure), and peer review (methods published and scrutinized by independent researchers). Many popular tests — including MBTI and Enneagram — don't meet all three criteria. The Big Five does. Opinion DNA uses Big Five scales plus additional peer-reviewed instruments for all 48 dimensions." },
      { heading: "The science behind Opinion DNA", content: "Every one of Opinion DNA's 48 dimensions uses a validated psychometric scale from published academic research. The Big Five traits use established IPIP scales. Moral Foundations come from Jonathan Haidt's peer-reviewed research at NYU. Cooperative Virtues use Oliver Curry's Morality as Cooperation scales from Oxford. Personal Values draw from Schwartz's Theory of Basic Human Values. Meta-Thinking dimensions use scales for Dogmatism, Need for Cognition, Intellectual Humility, and Primal World Beliefs — all from published, peer-reviewed studies." },
      { heading: "Which personality tests are scientifically valid?", content: "The Big Five (OCEAN) model has the strongest scientific backing — decades of cross-cultural research and robust test-retest reliability. VIA Character Strengths has solid positive psychology research. CliftonStrengths has Gallup's research behind it. MBTI and Enneagram have weaker scientific support despite their popularity. Opinion DNA builds on the Big Five foundation and extends it with additional validated instruments across values and cognition." },
      { heading: "Are personality tests accurate?", content: "Well-constructed personality tests using validated scales are reasonably accurate for measuring stable psychological traits. The key factors affecting accuracy are: the quality of the scales used (peer-reviewed vs. made-up), continuous scoring vs. binary types (continuous is more accurate), and test length (more questions generally means more precision). Opinion DNA uses 179 questions across validated scales with continuous 0-100 scoring — maximizing accuracy within a 10-15 minute timeframe." },
    ],
    faq: [
      { question: "Are personality tests scientifically proven?", answer: "Some are, some aren't. Tests based on the Big Five model have strong scientific support. MBTI has poor test-retest reliability (up to 50% get a different type on retake). Enneagram has limited peer-reviewed validation. Opinion DNA uses peer-reviewed scales for all 48 dimensions, combining the most scientifically validated approaches across personality, values, and cognition research." },
      { question: "Which personality test do psychologists use?", answer: "Research psychologists most commonly use Big Five inventories (NEO-PI-R, IPIP). Clinical psychologists use instruments like the MMPI for diagnosis. For comprehensive non-clinical assessment, Opinion DNA combines multiple peer-reviewed scales used in academic research — Big Five, Moral Foundations, Schwartz Values, and validated cognition measures — into one consumer-accessible test." },
      { question: "What personality test is the most accurate?", answer: "For personality traits specifically, the Big Five model has the strongest accuracy (reliability and validity). But 'accuracy' also means completeness. The Big Five accurately measures 5 traits but says nothing about your values or thinking patterns. Opinion DNA includes the Big Five and extends to 48 dimensions — all using validated scales — giving you the most accurate and complete psychological profile available." },
      { question: "Why is the MBTI not considered scientific?", answer: "MBTI has three main scientific issues: poor test-retest reliability (people often get different types on retake), forced binary categories that don't reflect how traits are actually distributed (most people are near the middle, not at extremes), and limited predictive validity compared to the Big Five model. It's popular and can be fun, but it doesn't meet modern psychometric standards." },
    ],
  },
  {
    slug: "personality-test-for-hiring",
    tier: 2,
    title: "Personality Tests for Hiring and Recruitment",
    metaTitle: "Personality Tests for Hiring — What Employers Should Know",
    description: "Should companies use personality tests for hiring? Understand what workplace assessments measure, their limitations, and how comprehensive psychographic assessment can improve team building.",
    headline: "Personality tests for hiring: what works and what doesn't",
    subheadline: "Companies spend billions on personality assessments for hiring. Most measure 4-16 dimensions of workplace behavior. Here's what they miss — and why understanding the whole person leads to better teams.",
    sections: [
      { heading: "How companies use personality tests today", content: "The most common workplace personality assessments are DISC (4 behavioral styles), CliftonStrengths (34 talent themes), and MBTI (16 types). Companies use them for hiring decisions, team composition, management training, and conflict resolution. These tools provide useful frameworks for workplace communication — but they measure a narrow slice of who people actually are." },
      { heading: "What hiring assessments miss", content: "Traditional workplace assessments focus on behavior and talents. They don't measure values (what people care about), moral foundations (how they make ethical judgments), or cognitive patterns (how they process information). Yet these hidden dimensions drive the conflicts, cultural mismatches, and team dysfunction that behavioral assessments can't predict. When a new hire's values clash with the team's values, no amount of DISC training will fix it." },
      { heading: "A deeper approach to team understanding", content: "Opinion DNA measures 48 dimensions including personality traits, values (moral foundations, cooperative virtues, personal priorities), and meta-thinking (cognitive biases, intellectual humility, thinking styles). For teams and organizations, this reveals the deep structures that drive collaboration, conflict, and culture — not just communication preferences. Our facilitated team workshops help organizations build on this understanding." },
      { heading: "Important considerations for employers", content: "If you're using personality tests in hiring, remember: no personality test should be the sole basis for hiring decisions. Use assessments to understand team dynamics and development, not to screen candidates in or out. Ensure any assessment you use has demonstrated validity for the specific purpose. And consider that understanding the whole person — personality, values, and thinking patterns — leads to better team outcomes than surface-level behavioral typing." },
    ],
    faq: [
      { question: "Can Opinion DNA be used for hiring?", answer: "Opinion DNA is designed for self-understanding, team development, and coaching — not as a hiring screening tool. We believe personality assessments are most valuable when used to build understanding and collaboration within existing teams, rather than as gatekeepers in hiring processes." },
      { question: "What personality test do companies use for hiring?", answer: "The most common are DISC, CliftonStrengths, MBTI, and Hogan Assessments. Each measures different aspects: DISC focuses on 4 behavioral styles, CliftonStrengths on 34 talents, MBTI on 16 types, and Hogan on workplace performance risks. For deeper team understanding beyond hiring, Opinion DNA's 48-dimension assessment provides a more comprehensive view." },
      { question: "Are personality tests legal in hiring?", answer: "In the US, personality tests can be used in hiring if they don't discriminate against protected classes and have demonstrated validity for the role. The EEOC requires that assessments be job-related and consistent with business necessity. Clinical instruments (like the MMPI) generally cannot be used in hiring. Always consult legal counsel before implementing any assessment in your hiring process." },
      { question: "What's the best personality test for team building?", answer: "For team building specifically, you want an assessment that reveals the deep dynamics driving collaboration and conflict. DISC is popular for communication styles. CliftonStrengths works for talent-based team composition. Opinion DNA goes deepest — measuring values alignment, moral foundations, and cognitive diversity across 48 dimensions, with facilitated workshops available." },
    ],
  },
  {
    slug: "personality-test-for-therapy",
    tier: 2,
    title: "Personality Assessment for Therapy and Counseling",
    metaTitle: "Personality Assessment for Therapy — 48 Dimensions for Deeper Insight",
    description: "How therapists and counselors use personality assessments to accelerate client insight. 48 dimensions of personality, values, and thinking patterns for deeper therapeutic conversations.",
    headline: "A personality assessment that deepens therapeutic work",
    subheadline: "Give therapy clients a comprehensive map of their personality, values, and thinking patterns. 48 dimensions of insight to accelerate self-understanding and guide meaningful conversations.",
    sections: [
      { heading: "How therapists use personality assessments", content: "Therapists and counselors use personality assessments to establish baselines, identify patterns, and accelerate the therapeutic process. Rather than spending weeks uncovering a client's core values and thinking patterns through conversation alone, a comprehensive assessment provides a structured foundation for deeper exploration from the very first session." },
      { heading: "Beyond clinical instruments", content: "Clinical tools like the MMPI focus on pathology — identifying disorders and dysfunction. Opinion DNA takes a different approach: mapping the normal-range psychological landscape across 48 dimensions. This includes personality traits (Big Five + Dark Triad), values (moral foundations + cooperative virtues + personal priorities), and meta-thinking (cognitive biases + world beliefs). For therapists working on personal growth, relationships, and life transitions, this comprehensive non-clinical profile provides richer material than clinical instruments." },
      { heading: "Dimensions therapists find most valuable", content: "Therapists report that the meta-thinking dimensions are particularly useful: Dogmatism (rigidity of beliefs), Intellectual Humility (openness to being wrong), Intolerance for Uncertainty (anxiety around ambiguity), and Just World Beliefs (tendency to blame victims). These cognitive patterns often underlie the presenting issues clients bring to therapy — anxiety, relationship conflict, career dissatisfaction — but are rarely measured by standard assessments." },
      { heading: "The AI report as a therapeutic tool", content: "Opinion DNA's AI-generated report provides a detailed narrative covering personality, values, thinking patterns, career, and relationships. Therapists use this report as a discussion guide — it surfaces patterns and connections the client may not have articulated, creating natural entry points for therapeutic exploration. The report is available online and as a downloadable PDF that clients can share with their therapist." },
    ],
    faq: [
      { question: "Is Opinion DNA a clinical assessment?", answer: "No. Opinion DNA is a psychographic assessment measuring normal-range personality, values, and thinking patterns. It's not designed to diagnose mental health conditions. Therapists use it alongside clinical tools as a complement — providing rich insight into the client's psychological landscape that clinical instruments don't cover." },
      { question: "Can therapists get bulk pricing?", answer: "Yes. We offer practice pricing for therapists and counselors who want to use Opinion DNA with multiple clients. Contact us at hello@opiniondna.com for practice rates." },
      { question: "How do personality assessments help in therapy?", answer: "Personality assessments accelerate the therapeutic process by providing structured data about a client's traits, values, and thinking patterns. Instead of spending multiple sessions discovering that a client has high Dogmatism and low Intellectual Humility — a combination that creates rigid thinking patterns — the assessment surfaces this in session one, allowing the therapist to address root patterns immediately." },
      { question: "Are there personality assessment tools recommended for therapists?", answer: "Common therapeutic assessments include the NEO-PI-R (Big Five), MMPI (clinical), and various projective tests. For non-clinical, growth-oriented therapy, Opinion DNA offers the most comprehensive profile — 48 dimensions covering personality, values, and meta-thinking, all with peer-reviewed scales. It's particularly useful for therapists working on personal development, relationship issues, and life transitions." },
    ],
  },
];

export function getKeywordPage(slug: string): KeywordPage | undefined {
  return keywordPages.find((p) => p.slug === slug);
}
