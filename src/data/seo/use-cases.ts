export interface UseCase {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  headline: string;
  subheadline: string;
  introduction: string;
  benefits: { title: string; description: string }[];
  dimensions: string[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
  faq: { question: string; answer: string }[];
}

export const useCases: UseCase[] = [
  {
    slug: "personal-growth",
    title: "Personality Test for Personal Growth",
    metaTitle: "Personality Test for Personal Growth — 48 Dimensions",
    description: "Go beyond surface-level personality labels. Opinion DNA maps 48 dimensions of personality, values, and meta-thinking to fuel real personal growth with actionable insights.",
    headline: "A personality test built for real personal growth",
    subheadline: "Most personality tests give you a label. Opinion DNA gives you a roadmap — 48 dimensions of personality, values, and thinking patterns with actionable insights for your life.",
    introduction: "Personal growth starts with self-awareness, but most personality tests stop at surface-level labels. You're an \"INTJ\" or a \"Type 3\" — but what do you actually do with that? Opinion DNA was built with 60+ academic experts to map the dimensions that actually drive your behavior: your personality traits, your core values, your moral foundations, and the cognitive patterns that shape how you process the world. The result is a 48-dimension profile with an AI-generated report covering your life satisfaction, relationships, and career — with specific, actionable insights you can apply immediately.",
    benefits: [
      { title: "See your blind spots", description: "Measure cognitive biases, dogmatism, and intellectual humility — the meta-thinking patterns most people never examine." },
      { title: "Understand your values, not just your personality", description: "Values drive decisions more than traits do. See your moral foundations, cooperative virtues, and what you truly prioritize." },
      { title: "Get actionable insights, not labels", description: "Your AI-generated report explains what your scores mean for your life, happiness, relationships, and career — with specific recommendations." },
      { title: "Compare to the population", description: "Every score includes a population average so you can see where you stand relative to others." },
    ],
    dimensions: ["Life Satisfaction", "Need for Cognition", "Intellectual Humility", "Self-Direction", "Openness"],
    faq: [
      { question: "How is this different from other personal growth personality tests?", answer: "Most tests measure personality only. Opinion DNA measures personality (Big Five + Dark Triad), values (moral foundations + cooperative virtues), and meta-thinking (cognitive biases + world beliefs) — 48 dimensions total. Your AI-generated report translates these into actionable growth insights." },
      { question: "Will this actually help me grow, or just tell me what I already know?", answer: "The meta-thinking dimensions (dogmatism, intellectual humility, need for cognition, just world beliefs) measure patterns most people have never examined. These are the hidden drivers of your behavior — and understanding them is the first step to changing them." },
      { question: "How long does it take?", answer: "10-15 minutes for the assessment. Your results and AI-generated personal report are available immediately." },
      { question: "Why is taking a personality test important?", answer: "Self-awareness is the foundation of personal growth, and we all have blind spots that introspection alone can't reveal. A comprehensive personality test provides objective measurement of traits, values, and thinking patterns — giving you a structured starting point for genuine change rather than vague self-impressions." },
      { question: "How do personality tests work?", answer: "You answer a series of statements (e.g., 'I enjoy thinking about abstract ideas') on an agree/disagree scale. Your responses are scored against validated psychometric scales to produce continuous scores (0-100) on each dimension. Opinion DNA's 179 questions cover 48 dimensions, and AI analyzes your score combination to generate a personalized report." },
    ],
  },
  {
    slug: "life-coaching",
    title: "Personality Test for Life Coaching Clients",
    metaTitle: "Personality Assessment for Coaches — 48 Dimensions",
    description: "Give your coaching clients the deepest personality assessment available. 48 dimensions across personality, values, and meta-thinking — built with 60+ academic experts.",
    headline: "The assessment your coaching clients deserve",
    subheadline: "Give your clients a 48-dimension profile that goes beyond personality labels — covering values, moral foundations, cognitive biases, and thinking patterns that drive real behavior change.",
    introduction: "As a coach, you know that surface-level personality labels only scratch the surface. Your clients need to understand not just their traits, but their values, their cognitive biases, and the thinking patterns that keep them stuck. Opinion DNA was developed with 60+ experts from Oxford, Cambridge, NYU, and UPenn to be the most comprehensive psychographic assessment available. It maps 48 dimensions across personality, values, and meta-thinking — giving you and your clients a complete foundation for transformative coaching conversations.",
    benefits: [
      { title: "Deeper coaching conversations from session one", description: "Start with a complete map of your client's personality, values, and thinking patterns. No more weeks of exploratory questions — go deep immediately." },
      { title: "Values-based coaching backed by data", description: "See your client's moral foundations, cooperative virtues, and personal values scored and compared to population averages." },
      { title: "Identify cognitive blind spots", description: "Dogmatism, intellectual humility, just world beliefs — these meta-thinking dimensions reveal the patterns that hold clients back." },
      { title: "AI-generated report as a coaching tool", description: "Each client receives a detailed AI-generated report covering life, career, and relationships — a ready-made discussion guide for your sessions." },
    ],
    dimensions: ["Dogmatism", "Intellectual Humility", "Need for Cognition", "Moral Foundations", "Life Satisfaction"],
    faq: [
      { question: "How do coaches typically use Opinion DNA?", answer: "Coaches use Opinion DNA as an intake tool, assigning it before the first session. The 48-dimension profile and AI report provide a complete foundation for coaching conversations — covering personality, values, and the meta-thinking patterns that drive behavior change." },
      { question: "Can I get a bulk rate for my coaching practice?", answer: "Yes. We offer team and practice pricing. Contact us at hello@opiniondna.com for coaching practice rates." },
      { question: "Is this scientifically valid?", answer: "Yes. Opinion DNA was developed over three years with academic psychologists from Oxford, Cambridge, NYU, Royal Holloway, and UPenn. All 48 dimensions use peer-reviewed psychometric scales." },
    ],
  },
  {
    slug: "couples-and-relationships",
    title: "Personality Test to Improve Relationships",
    metaTitle: "Couples Personality Test — Understand Each Other Deeply",
    description: "Understand why you and your partner see the world differently. Compare 48 dimensions of personality, values, and thinking patterns to strengthen your relationship.",
    headline: "Understand each other at the deepest level",
    subheadline: "Most relationship tests measure communication styles. Opinion DNA maps the values, moral foundations, and thinking patterns that actually drive how you connect — and where you clash.",
    introduction: "The biggest relationship conflicts aren't about personality differences — they're about values differences that neither partner has ever articulated. Opinion DNA maps 48 dimensions across personality, values, and meta-thinking for each partner. When you compare profiles, you see not just that you're different, but exactly where and why. Your moral foundations, cooperative virtues, and cognitive patterns shape every conversation, every decision, every conflict. Understanding these dimensions transforms how you relate to each other.",
    benefits: [
      { title: "See the real source of conflicts", description: "Values differences (care vs. fairness, equity vs. property, authority vs. self-direction) drive most relationship friction. See them clearly for the first time." },
      { title: "Compare thinking patterns", description: "Dogmatism, intolerance for uncertainty, need for cognition — these meta-thinking differences explain why you process the same situation completely differently." },
      { title: "Move beyond personality labels", description: "You already know one of you is more introverted. Opinion DNA shows you the 48 dimensions underneath — the values, morals, and cognitive patterns that shape how you actually live together." },
      { title: "Get relationship-specific insights", description: "Your AI-generated report includes a dedicated relationships section with specific insights for your unique profile." },
    ],
    dimensions: ["Agreeableness", "Care", "Fairness", "Equity", "Emotional Reappraisal"],
    faq: [
      { question: "How does the couples comparison work?", answer: "Each partner takes the assessment independently ($47 each). From your dashboard, you can invite your partner to compare profiles. You'll see side-by-side scores across all 48 dimensions." },
      { question: "Will this tell us if we're compatible?", answer: "Opinion DNA doesn't give a simple compatible/incompatible label — because compatibility is more nuanced than that. Instead, you'll see exactly where you align and where you diverge across personality, values, and thinking patterns. This gives you specific areas to discuss and work on together." },
      { question: "My partner and I disagree about everything. Will this help?", answer: "Especially then. Most disagreements stem from unexamined values differences. When you can see that your partner scores high on Authority while you score high on Fairness, or that they have high Intolerance for Uncertainty while you have high Openness — suddenly the fights make sense, and you can address the root cause." },
    ],
  },
  {
    slug: "self-discovery",
    title: "Self-Discovery Test for Adults",
    metaTitle: "Self-Discovery Test for Adults — 48 Dimensions of You",
    description: "The most comprehensive self-discovery assessment available. 48 dimensions of personality, values, and meta-thinking — developed with experts from Oxford, Cambridge, NYU, and UPenn.",
    headline: "The self-discovery test that goes all the way",
    subheadline: "Most tests scratch the surface. Opinion DNA maps 48 dimensions of your personality, values, and thinking patterns — revealing not just who you are, but why you believe what you believe.",
    introduction: "Real self-discovery isn't finding out you're an \"INFP\" or a \"Type 4.\" It's understanding the deep structures that shape how you see the world — your personality traits, your moral foundations, your cognitive biases, your primal world beliefs. Opinion DNA was built for people who want genuine, comprehensive self-understanding. Developed over three years with 60+ experts from Oxford, Cambridge, NYU, and UPenn, it maps 48 dimensions across personality, values, and meta-thinking. Your AI-generated report doesn't just describe you — it explains you.",
    benefits: [
      { title: "48 dimensions, not 4 or 16", description: "Big Five personality, Dark Triad, moral foundations, cooperative virtues, personal values, cognitive biases, and primal world beliefs — all in one assessment." },
      { title: "Discover your meta-thinking patterns", description: "How dogmatic are you? How much do you need cognition? Do you believe the world is fundamentally safe, good, and enticing? These patterns shape everything." },
      { title: "See yourself in context", description: "Every score includes a population average. See where you sit on each dimension relative to thousands of others." },
      { title: "An AI report that actually knows you", description: "Your personalized report draws on all 48 dimensions to explain your patterns, your tendencies, and what to do about them." },
    ],
    dimensions: ["Openness", "Primal World Beliefs", "Need for Cognition", "Self-Direction", "Universalism"],
    faq: [
      { question: "What makes this different from other self-discovery tests?", answer: "Most tests measure one thing — personality types, or strengths, or values. Opinion DNA measures all three dimensions in one assessment: personality (12 elements including Big Five + Dark Triad), values (24 elements including moral foundations and cooperative virtues), and meta-thinking (12 elements including cognitive biases and primal world beliefs)." },
      { question: "I've taken a lot of personality tests. Will I learn something new?", answer: "Almost certainly. Unless you've specifically measured your moral foundations, cooperative virtues, dark triad traits, and primal world beliefs, Opinion DNA will surface patterns you've never seen before. The meta-thinking dimensions (dogmatism, teleology, anthropomorphism, just world beliefs) are rarely measured outside academic research." },
      { question: "Is this scientifically valid?", answer: "Yes. Every dimension uses peer-reviewed psychometric scales. The assessment was developed with researchers from Oxford, Cambridge, NYU, Royal Holloway, and UPenn over three years." },
      { question: "Can personality test results change over time?", answer: "Core personality traits (like the Big Five) are relatively stable in adulthood but can shift gradually with major life experiences. Values can change more noticeably with cultural exposure and deliberate reflection. Meta-thinking patterns (like Dogmatism and Intellectual Humility) are the most malleable — and understanding them is the first step to changing them. Retaking Opinion DNA annually can help you track your growth." },
      { question: "Why are personality tests important for self-discovery?", answer: "Personality tests provide structured self-knowledge that's difficult to achieve through introspection alone. We all have blind spots — biases we can't see, values we haven't articulated, thinking patterns we've never examined. A comprehensive assessment like Opinion DNA surfaces these hidden dimensions with objective measurement, giving you a foundation for genuine self-understanding." },
    ],
  },
  {
    slug: "career-development",
    title: "Personality Test for Career Development",
    metaTitle: "Career Personality Test — Values, Thinking, and Traits",
    description: "Your career should align with who you actually are — not just your skills. Map 48 dimensions of personality, values, and thinking to make better career decisions.",
    headline: "Career insight that goes beyond strengths",
    subheadline: "Skills assessments tell you what you can do. Opinion DNA reveals what drives you — 48 dimensions of personality, values, and thinking patterns that shape career satisfaction and success.",
    introduction: "Most career assessments focus on what you're good at. But career satisfaction depends more on alignment — between your work and your values, your personality and your environment, your thinking style and your role. Opinion DNA maps 48 dimensions including Achievement, Self-Direction, Power, Conformity, Need for Cognition, and Social Dominance — the psychological forces that determine whether you thrive or stagnate in any given career path. Your AI-generated report includes a dedicated career section with specific insights for your profile.",
    benefits: [
      { title: "Values-career alignment", description: "Your scores on Achievement, Self-Direction, Power, Conformity, and Security reveal what you actually need from work — not just what you're good at." },
      { title: "Understand your work style at a deeper level", description: "Conscientiousness, Need for Cognition, and Intolerance for Uncertainty shape how you work day-to-day. See your actual patterns." },
      { title: "Leadership and collaboration insights", description: "Social Dominance, Authoritarianism, Deference, and Agreeableness scores reveal your natural leadership and team dynamics." },
      { title: "AI-generated career analysis", description: "Your personalized report includes a dedicated career section analyzing what your unique 48-dimension profile means for your professional life." },
    ],
    dimensions: ["Achievement", "Self-Direction", "Power", "Conscientiousness", "Social Dominance"],
    faq: [
      { question: "Will this tell me what career to choose?", answer: "Opinion DNA doesn't prescribe careers — it reveals the values, personality traits, and thinking patterns that determine your satisfaction in any career. Armed with this self-knowledge, you can evaluate opportunities based on genuine fit rather than surface appeal." },
      { question: "How is this different from CliftonStrengths or DISC?", answer: "CliftonStrengths measures talents. DISC measures workplace behaviors. Opinion DNA measures the full picture: personality, values, moral foundations, and thinking patterns. Your career section reveals not just what you're good at, but what drives you, what you value, and how you think." },
      { question: "Can my employer use this for our team?", answer: "Yes. Opinion DNA offers team assessments and facilitated workshops. Contact us at hello@opiniondna.com for team pricing." },
      { question: "Which personality test is best for career guidance?", answer: "CliftonStrengths focuses on talents, DISC on workplace behavior, and MBTI on communication preferences. But career satisfaction depends on values alignment — not just strengths. Opinion DNA is the only assessment that measures personality traits, career-relevant values (Achievement, Self-Direction, Power, Security), and thinking patterns in one profile, with a dedicated career analysis in your AI-generated report." },
      { question: "Can a personality test tell me what job to choose?", answer: "No personality test can prescribe the 'right' career. But understanding your values, personality traits, and thinking patterns helps you evaluate opportunities based on genuine fit. When you know your Achievement, Self-Direction, and Conformity scores, you can predict which work environments will energize you and which will drain you." },
    ],
  },
  {
    slug: "teams-and-leadership",
    title: "Personality Assessment for Teams",
    metaTitle: "Team Personality Assessment — Values and Thinking Styles",
    description: "Go beyond DISC and StrengthsFinder. Map your team's personality, values, and thinking patterns across 48 dimensions to build stronger collaboration.",
    headline: "Understand your team at every level",
    subheadline: "DISC measures 4 behaviors. CliftonStrengths measures 34 talents. Opinion DNA maps 48 dimensions across personality, values, and thinking — because real team dynamics run deeper than communication styles.",
    introduction: "Team friction rarely comes from personality clashes alone. It comes from unexamined values differences, different cognitive patterns, and conflicting moral foundations. When one team member scores high on Authority and another on Self-Direction, every decision-making conversation becomes a power struggle — and neither person knows why. Opinion DNA maps all 48 dimensions for each team member, revealing the deep structures that drive team dynamics. Combined with facilitated workshops, it transforms how teams communicate, decide, and collaborate.",
    benefits: [
      { title: "Surface the real team dynamics", description: "Values differences (Equity vs. Property, Authority vs. Self-Direction, Care vs. Fairness) drive more team conflict than personality differences. See them clearly." },
      { title: "Go beyond communication styles", description: "DISC tells you how people communicate. Opinion DNA reveals what they believe, what they value, and how they think — the forces underneath communication." },
      { title: "Build cognitive diversity", description: "Teams with diverse thinking styles (Need for Cognition, Dogmatism, Intellectual Humility) make better decisions. See your team's cognitive profile." },
      { title: "Facilitated workshops available", description: "Our trained facilitators guide teams through their collective Opinion DNA results, building shared understanding and better collaboration." },
    ],
    dimensions: ["Social Dominance", "Deference", "Group", "Loyalty", "Conscientiousness"],
    faq: [
      { question: "How does team pricing work?", answer: "Contact us at hello@opiniondna.com for team pricing. We offer volume discounts and facilitated workshop packages." },
      { question: "Can team members see each other's results?", answer: "Individual results are private. Team comparisons are facilitated by our coaches, who help teams understand their collective patterns without exposing sensitive individual scores." },
      { question: "How is this better than DISC for teams?", answer: "DISC measures 4 behavioral styles. Opinion DNA maps 48 dimensions — personality, values, and thinking patterns. Team dynamics are driven by values alignment and cognitive diversity more than communication styles. Opinion DNA surfaces these deeper patterns." },
    ],
  },
  {
    slug: "values-alignment",
    title: "Values Alignment Test",
    metaTitle: "Values Alignment Test — 24 Value Dimensions",
    description: "Measure your values across 24 dimensions — moral foundations, cooperative virtues, and personal values. Understand what actually drives your decisions.",
    headline: "Finally understand what you truly value",
    subheadline: "Most people think they know their values. Opinion DNA measures 24 value dimensions — moral foundations, cooperative virtues, and personal priorities — revealing the actual forces that drive your decisions.",
    introduction: "We all say we value fairness, or family, or freedom. But what do your values actually look like when measured? How do your moral foundations (Care, Fairness, Loyalty, Authority, Purity) compare to the population? How do your cooperative virtues (Reciprocity, Heroism, Deference, Equity) shape your relationships? And do your personal values (Achievement, Hedonism, Self-Direction, Security) align with the life you're living? Opinion DNA measures 24 value dimensions using peer-reviewed psychometric scales, giving you the clearest picture of your values available anywhere.",
    benefits: [
      { title: "24 value dimensions, not vague labels", description: "Moral foundations, cooperative virtues, personal values, and social orientation — each scored and compared to population averages." },
      { title: "Understand value conflicts", description: "When your Care score is high but your Achievement score is also high, you experience specific internal conflicts. See where your values compete." },
      { title: "Values in context", description: "Your AI report explains how your specific value profile shapes your relationships, career satisfaction, and life decisions." },
      { title: "Beyond personality", description: "Personality is how you behave. Values are why. Opinion DNA measures both — giving you the complete picture." },
    ],
    dimensions: ["Care", "Fairness", "Loyalty", "Authority", "Self-Direction"],
    faq: [
      { question: "What values does Opinion DNA measure?", answer: "24 value dimensions organized into four categories: Moral Foundations (Care, Fairness, Loyalty, Authority, Purity), Cooperative Virtues (Family, Group, Reciprocity, Heroism, Deference, Equity, Property), Personal Values (Power, Achievement, Hedonism, Stimulation, Self-Direction, Universalism, Benevolence, Conformity, Tradition, Security), and Social Orientation (Social Dominance, Authoritarianism)." },
      { question: "How is this different from a generic values quiz?", answer: "Generic values quizzes ask you to rank words. Opinion DNA uses peer-reviewed psychometric scales — the same instruments used in academic research at Oxford and UPenn — to measure 24 specific value dimensions. You get continuous scores with population comparisons, not a simple ranked list." },
      { question: "Do values change over time?", answer: "Values are generally stable but can shift with major life experiences, cultural exposure, and deliberate reflection. Unlike personality traits (which are biologically embedded), values are shaped by your environment and choices. Retaking Opinion DNA annually can help you track these shifts." },
    ],
  },
  {
    slug: "hiring-and-recruitment",
    title: "Personality Test for Hiring and Recruitment",
    metaTitle: "Personality Assessment for Hiring & Team Building — 48 Dimensions",
    description: "Go beyond DISC and MBTI for workplace assessment. Map your team's personality, values, and thinking patterns across 48 dimensions to build stronger, more aligned teams.",
    headline: "Understand your team beyond workplace behavior",
    subheadline: "DISC measures 4 behaviors. MBTI gives 16 types. Opinion DNA maps 48 dimensions — personality, values, and thinking patterns — revealing why your team collaborates the way it does.",
    introduction: "Most workplace assessments tell you how people communicate. They don't tell you what they value, how they make moral judgments, or how they process ambiguity. Yet these deeper patterns drive the real dynamics on your team — the cultural clashes, the unspoken tensions, the decisions that divide the room. Opinion DNA was built with 60+ researchers to map the complete psychological landscape: personality traits, moral foundations, cooperative virtues, personal values, and cognitive patterns. For organizations, this means seeing the hidden forces that shape culture, collaboration, and conflict.",
    benefits: [
      { title: "Reveal hidden values dynamics", description: "When one team member scores high on Authority and another on Self-Direction, every decision becomes a power negotiation — and neither person knows why. See these patterns clearly for the first time." },
      { title: "Build cognitive diversity", description: "Teams with diverse thinking styles make better decisions. Measure Need for Cognition, Intellectual Humility, and Dogmatism across your team to build genuine cognitive diversity." },
      { title: "Go deeper than communication styles", description: "DISC tells you how people communicate. Opinion DNA reveals what they believe, what they value, and how they think — the forces underneath workplace behavior." },
      { title: "Facilitated workshops available", description: "Our trained facilitators guide teams through their collective Opinion DNA results, building shared understanding and actionable strategies for better collaboration." },
    ],
    dimensions: ["Social Dominance", "Authority", "Deference", "Conscientiousness", "Need for Cognition"],
    faq: [
      { question: "Should we use personality tests for hiring decisions?", answer: "We recommend using Opinion DNA for team development and understanding, not as a hiring screening tool. The deepest value comes from building shared understanding within existing teams — revealing the values and thinking patterns that drive collaboration and conflict." },
      { question: "How is this different from DISC or CliftonStrengths?", answer: "DISC measures 4 behavioral styles. CliftonStrengths measures 34 talents. Neither measures values, moral foundations, or cognitive patterns. Opinion DNA's 48 dimensions include personality traits plus the deeper layers that actually drive team dynamics — what people care about, how they make moral judgments, and how they process information." },
      { question: "What's the team pricing?", answer: "Contact us at hello@opiniondna.com for team and organization pricing. We offer volume discounts and facilitated workshop packages." },
    ],
  },
  {
    slug: "therapy-and-counseling",
    title: "Personality Test for Therapy and Counseling",
    metaTitle: "Personality Assessment for Therapy — Accelerate Client Insight",
    description: "Help therapy clients understand their personality, values, and thinking patterns. 48 non-clinical dimensions to accelerate self-understanding and guide therapeutic conversations.",
    headline: "Accelerate therapeutic insight with 48 dimensions",
    subheadline: "Give clients a comprehensive map of their personality, values, and thinking patterns from session one. 48 non-clinical dimensions that surface the patterns driving their presenting issues.",
    introduction: "Therapy often begins with weeks of exploration — uncovering a client's core values, thinking patterns, and psychological tendencies through careful conversation. Opinion DNA accelerates this process by providing a structured, comprehensive assessment from the start. With 48 dimensions covering personality (Big Five + Dark Triad), values (moral foundations + cooperative virtues + personal priorities), and meta-thinking (cognitive biases + world beliefs), therapists get a rich foundation for therapeutic work. The AI-generated report identifies patterns and connections that create natural entry points for deeper exploration.",
    benefits: [
      { title: "Accelerate the discovery phase", description: "Instead of spending multiple sessions discovering core patterns, start with a 48-dimension profile that surfaces personality traits, values, and thinking patterns immediately." },
      { title: "Surface meta-thinking patterns", description: "Dogmatism, Intellectual Humility, Just World Beliefs, Intolerance for Uncertainty — these cognitive patterns often underlie presenting issues but are rarely measured. Opinion DNA makes them visible." },
      { title: "Non-clinical complement", description: "Opinion DNA maps normal-range psychological dimensions, complementing clinical instruments like the MMPI. Use it alongside clinical tools for a fuller picture of the whole person." },
      { title: "AI report as discussion guide", description: "The AI-generated report surfaces patterns and connections clients may not have articulated, creating natural entry points for therapeutic exploration across life, career, and relationships." },
    ],
    dimensions: ["Dogmatism", "Intellectual Humility", "Intolerance for Uncertainty", "Just World", "Emotional Reappraisal"],
    faq: [
      { question: "Is Opinion DNA a clinical diagnostic tool?", answer: "No. Opinion DNA is a psychographic assessment measuring normal-range personality, values, and thinking patterns. It doesn't diagnose mental health conditions. Therapists use it as a complement to clinical instruments — providing insight into the broader psychological landscape that clinical tools don't cover." },
      { question: "How do therapists typically use the results?", answer: "Therapists use the 48-dimension profile and AI report as a foundation for therapeutic conversations. The meta-thinking dimensions (Dogmatism, Intellectual Humility, Just World Beliefs) are particularly useful for identifying cognitive patterns underlying anxiety, relationship conflict, and decision-making struggles." },
      { question: "Can clients share their results with their therapist?", answer: "Yes. Clients can share their online dashboard or download their full report as a PDF to bring to sessions. The report covers personality, values, meta-thinking, career, and relationships — providing structured material for discussion." },
      { question: "Is there practice pricing for therapists?", answer: "Yes. We offer practice pricing for therapists and counselors using Opinion DNA with multiple clients. Contact hello@opiniondna.com for details." },
    ],
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return useCases.find((u) => u.slug === slug);
}
