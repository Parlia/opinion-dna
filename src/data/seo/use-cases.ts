import type { ContentSection, FAQItem } from "./content-types";

export interface UseCase {
  slug: string;
  title: string;
  /** <title> (brand suffix appended by the root template) unless seoTitle is set. */
  metaTitle: string;
  /** Absolute <title>, no suffix added. Under 60 chars. Wins over metaTitle. */
  seoTitle?: string;
  /** Meta description. Plain text. */
  description: string;
  headline: string;
  subheadline: string;
  /** Prose (links allowed, see content-types.ts). */
  introduction: string;
  benefits: { title: string; description: string }[];
  /** Display names; ones matching a /dimensions page become links. */
  dimensions: string[];
  /** Long-form sections rendered after the benefits grid. */
  sections?: ContentSection[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
  faq: FAQItem[];
}

export const useCases: UseCase[] = [
  {
    slug: "personal-growth",
    title: "Personality Test for Personal Growth",
    metaTitle: "Personality Test for Personal Growth — 48 Dimensions",
    description: "Go beyond surface-level personality labels. Opinion DNA maps 48 dimensions of personality, values, and meta-thinking to fuel real personal growth with actionable insights.",
    headline: "A personality test built for real personal growth",
    subheadline: "Most personality tests give you a label. Opinion DNA gives you a roadmap — 48 dimensions of personality, values, and thinking patterns with actionable insights for your life.",
    introduction: "Personal growth starts with self-awareness, but most personality tests stop at surface-level labels. You're an \"INTJ\" or a \"Type 3,\" and then what? Opinion DNA was built with 60+ academic experts to map the dimensions that actually drive your behavior: personality traits like [Openness](/dimensions/openness), core values like [Self-Direction](/dimensions/self-direction), your moral foundations, and thinking patterns such as [Intellectual Humility](/dimensions/intellectual-humility) and [Need for Cognition](/dimensions/need-for-cognition) that shape how you process the world. The result is a 48-dimension profile with an AI-generated report covering your [life satisfaction](/dimensions/life-satisfaction), relationships, and career, with specific insights you can act on right away.",
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
    introduction: "As a coach, you know that personality labels only scratch the surface. Clients get further when they can see their traits alongside their values, their cognitive biases, and the thinking patterns that keep them stuck: how high they score on [Dogmatism](/dimensions/dogmatism), how much [Intellectual Humility](/dimensions/intellectual-humility) they bring to feedback, and how much they enjoy working through a hard problem, which is what [Need for Cognition](/dimensions/need-for-cognition) measures. Opinion DNA was developed with 60+ experts from Oxford, Cambridge, NYU, Royal Holloway, and UPenn to be the most comprehensive psychographic assessment available. It maps 48 dimensions across personality, values, and meta-thinking, which gives you and your clients a shared foundation for deeper coaching conversations from the first session.",
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
    introduction: "Many of the arguments couples keep having are rooted in values differences that neither partner has ever put into words. Opinion DNA maps 48 dimensions across personality, values, and meta-thinking for each partner. When you compare profiles, you see exactly where you differ and why. One of you may weigh [Care](/dimensions/care) above everything while the other keeps coming back to [Fairness](/dimensions/fairness). One may recover from a bad day by reframing it, which is what [Emotional Reappraisal](/dimensions/emotional-reappraisal) measures, while the other needs time. One may push for a decision fast because open questions are hard to sit with, a sign of high [Intolerance for Uncertainty](/dimensions/intolerance-for-uncertainty). These patterns shape every conversation, every decision, and every conflict, and they are much easier to talk about once both of you can see them.\n\nThe [Couples Report](/couples) puts your two profiles side by side across all 48 dimensions, showing where you align, where you differ, and what those differences mean for your relationship, with discussion prompts tailored to your combination. If you want to compare with a friend instead, the [Friends Report](/friends) uses the same assessment with a lighter framing: where you click, where you'll playfully butt heads, and conversation starters tied to your actual score gaps.",
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
    introduction: "Finding out you're an \"INFP\" or a \"Type 4\" is a start. Real self-discovery means understanding the deep structures that shape how you see the world: your personality traits, your moral foundations, your cognitive biases, and your primal world beliefs, such as whether the world feels fundamentally [safe or dangerous](/dimensions/safe-world-belief) to you. Opinion DNA was built for people who want comprehensive self-understanding. Developed over three years with 60+ experts from Oxford, Cambridge, NYU, Royal Holloway, and UPenn, it maps 48 dimensions across personality, values, and meta-thinking, from [Openness](/dimensions/openness) and [Self-Direction](/dimensions/self-direction) to [Need for Cognition](/dimensions/need-for-cognition). Your AI-generated report reads across all 48 scores to explain why you think and act the way you do.",
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
    seoTitle: "Career Personality Test for Professional Development",
    description: "A career personality test and professional personality assessment: 48 dimensions of values, traits, and thinking style, plus an AI-written career report.",
    headline: "A career personality test that maps what drives you at work",
    subheadline: "Skills assessments tell you what you can do. This personality test for career development shows what drives you: 48 dimensions of personality, values, and thinking patterns that shape career satisfaction and success.",
    introduction: "Most personality tests for career development focus on what you're good at. Career satisfaction depends at least as much on fit: between your work and your values, your personality and your environment, your thinking style and your role. Opinion DNA is a career personality test built around that idea. Its 179 questions map 48 dimensions, including [Achievement](/dimensions/achievement), [Self-Direction](/dimensions/self-direction), [Power](/dimensions/power), and [Conscientiousness](/dimensions/conscientiousness), the psychological forces that shape whether you thrive or stall in a given role. Used as a professional personality assessment, it gives you language for what you need from work, how you like to work, and where friction is likely, which helps when you're weighing an offer, a promotion, or a change of field. Your AI-generated report includes a dedicated career section with specific insights for your profile.\n\nIf your next career move is starting a company with someone, the [Co-Founders Report](/co-founders) compares the two of you across all 48 dimensions, covering values, risk tolerance, decision-making style, and how each of you handles conflict under pressure.",
    benefits: [
      { title: "Values-career alignment", description: "Your scores on Achievement, Self-Direction, Power, Conformity, and Security reveal what you actually need from work — not just what you're good at." },
      { title: "Understand your work style at a deeper level", description: "Conscientiousness, Need for Cognition, and Intolerance for Uncertainty shape how you work day-to-day. See your actual patterns." },
      { title: "Leadership and collaboration insights", description: "Social Dominance, Authoritarianism, Deference, and Agreeableness scores reveal your natural leadership and team dynamics." },
      { title: "AI-generated career analysis", description: "Your personalized report includes a dedicated career section analyzing what your unique 48-dimension profile means for your professional life." },
    ],
    dimensions: ["Achievement", "Self-Direction", "Power", "Conscientiousness", "Social Dominance"],
    sections: [
      {
        heading: "How values and thinking style relate to career fit",
        content: "Skills decide whether you can do a job. Values and thinking style have a lot to do with whether you want to keep doing it. A handful of the 48 dimensions come up again and again when people describe a role that fits, or one that slowly wears them down.\n\n### Values: what you need work to give you\n\n- Achievement is the drive for success that other people can see and measure. High scorers tend to want clear goals, visible progress, and recognition when they deliver, and a role with vague success criteria can feel like running without a finish line.\n- Self-Direction is the priority you place on choosing your own goals and methods. High scorers often chafe under close supervision and do their best work with autonomy.\n- [Security](/dimensions/security) is the priority you give to stability and avoiding loss. High scorers often weigh a steady salary, predictable structure, and an established employer more heavily than upside.\n- [Conformity](/dimensions/conformity) is the value you place on restraint: meeting expectations and not upsetting the people around you. A high score can suit roles with clear norms and process. A low score can make heavily rule-bound workplaces feel cramped.\n\n### Thinking style: how you like to work\n\n- [Need for Cognition](/dimensions/need-for-cognition) measures your appetite for effortful thinking. High scorers tend to look for complex problems and get restless in routine work. Lower scorers often prefer roles where the goal is clear and the craft is in doing it well.\n- [Intolerance for Uncertainty](/dimensions/intolerance-for-uncertainty) measures how hard it is for you to function while a big question is still open. High scorers often do better with defined responsibilities and stable plans. Lower scorers may be more at ease in startups, research, or roles where the brief keeps changing.\n\n### Reading the combinations\n\nSingle scores matter less than combinations. High Self-Direction with low Security can point toward independent or entrepreneurial work. High Achievement with high Conformity often fits structured career ladders with clear promotion criteria. High Need for Cognition with high Intolerance for Uncertainty can describe someone who loves hard problems as long as they are well defined. Treat these as prompts for better questions about a job before you take it. The career section of your report walks through what your particular combination suggests.",
      },
    ],
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
    introduction: "Team friction rarely comes from personality clashes alone. More often it comes from unexamined values differences, different cognitive patterns, and conflicting moral foundations. When one team member scores high on [Authority](/dimensions/authority) and another on [Self-Direction](/dimensions/self-direction), decision-making conversations can turn into power struggles, and neither person knows why. A team where most people score high on [Deference](/dimensions/deference) may run smooth meetings while disagreement quietly goes unsaid. Opinion DNA maps all 48 dimensions for each team member, revealing the deep structures that drive team dynamics, and our facilitated workshops help teams turn that map into better ways of communicating, deciding, and working together.\n\nThe [Teams Report](/teams) puts every member's profile into one view: group-level patterns, pairwise comparisons, and a cognitive diversity overview that shows where the team clusters and where it has blind spots. For the partnership at the very top of a company, the [Co-Founders Report](/co-founders) compares founders on values, risk tolerance, decision-making style, and how each one handles conflict under pressure. If you are comparing facet-level, professional-grade instruments for leadership development, our guide to [MBTI Step II alternatives](/alternatives/mbti-step-ii-alternatives) covers the options.",
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
    introduction: "We all say we value fairness, or family, or freedom. But what do your values actually look like when measured? How do your moral foundations ([Care](/dimensions/care), [Fairness](/dimensions/fairness), Loyalty, Authority, Purity) compare to the population? How do your cooperative virtues (Reciprocity, Heroism, Deference, [Equity](/dimensions/equity)) shape your relationships? And do your personal values ([Achievement](/dimensions/achievement), Hedonism, [Self-Direction](/dimensions/self-direction), Security) line up with the life you're living? Opinion DNA measures 24 value dimensions using peer-reviewed psychometric scales and benchmarks every score against population averages.\n\nValues alignment matters most between people who make big decisions together. The [Couples Report](/couples) compares partners across all 48 dimensions, including the moral foundations that shape how each of you decides. The [Co-Founders Report](/co-founders) does the same for business partners, showing whether you share the same moral foundations and how your risk tolerance and conflict styles line up.",
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
    seoTitle: "Workplace Personality Test for Hiring and Team Building",
    description: "Weighing a workplace personality test for hiring? See how managers use a 48-dimension professional assessment to onboard, develop, and align their teams.",
    headline: "A workplace personality test for hiring managers and their teams",
    subheadline: "DISC measures 4 behavioral styles. MBTI gives 16 types. Opinion DNA is a professional personality assessment that maps 48 dimensions of personality, values, and thinking patterns, revealing why your team works the way it does.",
    introduction: "Most workplace personality tests used for hiring tell you how people communicate. They don't tell you what people value, how they make moral judgments, or how they handle ambiguity. Yet those deeper patterns drive the real dynamics on a team: the cultural clashes, the unspoken tensions, the decisions that divide the room. Opinion DNA is a professional personality assessment built with 60+ researchers to map that fuller picture: personality traits such as [Conscientiousness](/dimensions/conscientiousness), moral foundations such as [Authority](/dimensions/authority), cooperative virtues such as [Deference](/dimensions/deference), personal values, and thinking patterns such as [Need for Cognition](/dimensions/need-for-cognition).\n\nFor a hiring manager, the most useful place for it is after the offer is accepted: helping a new hire and an existing team understand each other quickly, and showing a leader where the team has blind spots. The section below sets out where a personality test helps in hiring and team building, and where it does harm.",
    benefits: [
      { title: "Reveal hidden values dynamics", description: "When one team member scores high on Authority and another on Self-Direction, every decision becomes a power negotiation — and neither person knows why. See these patterns clearly for the first time." },
      { title: "Build cognitive diversity", description: "Teams with diverse thinking styles make better decisions. Measure Need for Cognition, Intellectual Humility, and Dogmatism across your team to build genuine cognitive diversity." },
      { title: "Go deeper than communication styles", description: "DISC tells you how people communicate. Opinion DNA reveals what they believe, what they value, and how they think — the forces underneath workplace behavior." },
      { title: "Facilitated workshops available", description: "Our trained facilitators guide teams through their collective Opinion DNA results, building shared understanding and actionable strategies for better collaboration." },
    ],
    dimensions: ["Social Dominance", "Authority", "Deference", "Conscientiousness", "Need for Cognition"],
    sections: [
      {
        heading: "What a personality test should and shouldn't do in hiring",
        content: "If you manage a team, the useful question about a workplace personality test is where it belongs in the life of that team. Our answer follows from how Opinion DNA is built: it helps people who already work together understand each other, and it is a poor instrument for deciding who gets through the door. The FAQ below says the same thing. We recommend it for team development, and we don't recommend it for screening.\n\n### Where it helps\n\n- Shared language for an existing team. When everyone has taken the same assessment, a recurring argument about process can be discussed as a difference in [Conformity](/dimensions/conformity) or [Intolerance for Uncertainty](/dimensions/intolerance-for-uncertainty) instead of a personality clash. The [Teams Report](/teams) is built for this, with group-level patterns and pairwise comparisons across the team.\n- Onboarding conversations. A new hire who takes the assessment after accepting an offer can share whatever they choose with their manager. That gives the first few one-on-ones something concrete to cover: how they like to receive feedback, how much autonomy they want, and how they handle a brief that is still changing.\n- Development. Scores on dimensions like [Intellectual Humility](/dimensions/intellectual-humility) and Need for Cognition make good starting points for coaching and growth plans, provided the person owns their own results and decides what to share.\n- Co-founder and leadership alignment. The people at the top shape a company's culture before anyone else is hired. The [Co-Founders Report](/co-founders) compares founders on values, risk tolerance, decision-making style, and how each one handles conflict under pressure, which is worth knowing before you hire your first ten people.\n\n### Where it does harm\n\n- As the only pass/fail screen. No single personality score should decide whether someone gets a job. Personality is one input among many, and it says little about skill, experience, or how someone will grow into a role.\n- Anything clinical. Instruments designed to identify mental health conditions belong with clinicians. Opinion DNA measures normal-range personality, values, and thinking patterns and does not diagnose anything, so it should never be treated as a clinical screen.\n- Anything you can't tie to the work. If you can't explain how a dimension relates to the actual job, it shouldn't influence the decision. A candidate's moral foundations, for example, are a poor basis for a hiring call, and screening on them can create real ethical and legal problems.\n\n### Be open about it\n\nWhatever you use, tell people what it is, why you are asking, who will see the results, and how they will be used, and let them see their own results. An assessment that feels like a hidden test costs trust before the first day.\n\nRules on assessments in employment vary by country, state, and sector, and they change. As a general principle, anything used in a hiring decision should be job-related, applied consistently, and checked for unfair impact on protected groups. Check your local employment law and talk to an employment lawyer or HR specialist before adding any test to a hiring process. For a broader look at how employers evaluate candidates with assessments, see our guide to the [personality test for hiring](/tests/personality-test-for-hiring).",
      },
    ],
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
    introduction: "Therapy often begins with weeks of exploration: uncovering a client's core values, thinking patterns, and psychological tendencies through careful conversation. Opinion DNA can shorten this process by providing a structured, comprehensive assessment from the start. With 48 non-clinical dimensions covering personality (Big Five and Dark Triad), values (moral foundations, cooperative virtues, and personal priorities), and meta-thinking (cognitive biases and world beliefs), therapists get a rich foundation for therapeutic work. Patterns such as high [Intolerance for Uncertainty](/dimensions/intolerance-for-uncertainty), a strong [Just World](/dimensions/just-world-belief) belief, rare use of [Emotional Reappraisal](/dimensions/emotional-reappraisal), or high [Dogmatism](/dimensions/dogmatism) can sit underneath what a client brings to the first session. The AI-generated report identifies patterns and connections that create natural entry points for deeper exploration.",
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
