/**
 * 48 Opinion DNA Element definitions
 * Ported from: parlia/newspa/src/components/DetailedReports/OpinionDNAReportCard.tsx
 */

export type Dimension = "personality" | "values" | "meta-thinking";

export interface ElementDefinition {
  index: number; // 0-47 (maps to resultGroup - 1)
  name: string;
  code: string;
  dimension: Dimension;
  category: string;
  tooltip: string;
  color: string;
}

// Color gradients from OpinionDNAReportCard.tsx
const personalityColors = [
  "#00B922", "#00BD2A", "#00C032", "#00C439", "#00C840",
  "#00CB47", "#00CF4D", "#00D354", "#00D65A", "#00DA60",
  "#00DE66", "#00E16C",
];

const valuesColors = [
  "#0054FF", "#0061FF", "#006DFF", "#0078FF", "#0082FF",
  "#008CFF", "#0095FF", "#009EFF", "#00A6FF", "#00AEFF",
  "#00B6FF", "#00BDFF", "#00C4FF", "#00CBFF", "#00D2FF",
  "#00D9FF", "#00DFFF", "#00E6FF", "#00ECFF", "#25F2FF",
  "#0054FF", "#0061FF", "#006DFF", "#0078FF",
];

const metaThinkingColors = [
  "#8A00FF", "#9200FF", "#9900FF", "#A000FF", "#A700FF",
  "#AE00FF", "#B400FF", "#BA00FF", "#C000FF", "#C603FF",
  "#CC05FF", "#D209FF",
];

export const ELEMENTS: ElementDefinition[] = [
  // ===== PERSONALITY (0-11) =====
  // The Big 5
  { index: 0, name: "Openness", code: "O", dimension: "personality", category: "The Big 5", tooltip: "Measures your propensity to explore new ideas, experiences, and aesthetics", color: personalityColors[0] },
  { index: 1, name: "Conscientiousness", code: "C", dimension: "personality", category: "The Big 5", tooltip: "Measures how organised, disciplined, and goal-directed you are", color: personalityColors[1] },
  { index: 2, name: "Extraversion", code: "E", dimension: "personality", category: "The Big 5", tooltip: "Measures where you get your energy from: people or solitude", color: personalityColors[2] },
  { index: 3, name: "Agreeableness", code: "A", dimension: "personality", category: "The Big 5", tooltip: "Measures your disposition towards cooperation and warmth", color: personalityColors[3] },
  { index: 4, name: "Neuroticism", code: "N", dimension: "personality", category: "The Big 5", tooltip: "Measures your tendency toward negative emotions and emotional reactivity", color: personalityColors[4] },
  // The Dark Triad
  { index: 5, name: "Machiavellianism", code: "X", dimension: "personality", category: "The Dark Triad", tooltip: "Measures strategic manipulation and cynical worldview", color: personalityColors[5] },
  { index: 6, name: "Narcissism", code: "Y", dimension: "personality", category: "The Dark Triad", tooltip: "Measures grandiosity, need for admiration, and sense of entitlement", color: personalityColors[6] },
  { index: 7, name: "Psychopathy", code: "Z", dimension: "personality", category: "The Dark Triad", tooltip: "Measures impulsivity, callousness, and thrill-seeking", color: personalityColors[7] },
  // Emotional Regulation, Mortality & Life Satisfaction
  { index: 8, name: "Emotional Reappraisal", code: "Er", dimension: "personality", category: "Emotional Regulation, Mortality & Life Satisfaction", tooltip: "Measures your capacity to regulate emotions by reframing situations", color: personalityColors[8] },
  { index: 9, name: "Suppression Tendency", code: "St", dimension: "personality", category: "Emotional Regulation, Mortality & Life Satisfaction", tooltip: "Measures your tendency to regulate emotions by suppressing them", color: personalityColors[9] },
  { index: 10, name: "Mortality Concern", code: "M", dimension: "personality", category: "Emotional Regulation, Mortality & Life Satisfaction", tooltip: "Measures how often you think about death and impermanence", color: personalityColors[10] },
  { index: 11, name: "Life Satisfaction", code: "Ls", dimension: "personality", category: "Emotional Regulation, Mortality & Life Satisfaction", tooltip: "Measures your overall assessment of your life quality", color: personalityColors[11] },

  // ===== VALUES (12-35) =====
  // Moral Foundations
  { index: 12, name: "Care", code: "Ca", dimension: "values", category: "Moral Foundations", tooltip: "Measures your concern with kindness, gentleness, and nurturing", color: valuesColors[0] },
  { index: 13, name: "Fairness", code: "F", dimension: "values", category: "Moral Foundations", tooltip: "Measures your concern with justice, rights, and proportional treatment", color: valuesColors[1] },
  { index: 14, name: "Loyalty", code: "L", dimension: "values", category: "Moral Foundations", tooltip: "Measures your concern with in-group solidarity and self-sacrifice", color: valuesColors[2] },
  { index: 15, name: "Authority", code: "Au", dimension: "values", category: "Moral Foundations", tooltip: "Measures your respect for hierarchy, tradition, and legitimate authority", color: valuesColors[3] },
  { index: 16, name: "Purity", code: "P", dimension: "values", category: "Moral Foundations", tooltip: "Measures how much importance you place on sanctity and moral cleanliness", color: valuesColors[4] },
  // Cooperative Virtues
  { index: 17, name: "Family", code: "Fa", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures the value you place on family bonds and obligations", color: valuesColors[5] },
  { index: 18, name: "Group", code: "G", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures the value you place on group membership and collective identity", color: valuesColors[6] },
  { index: 19, name: "Reciprocity", code: "Re", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures your belief in mutual exchange and returning favours", color: valuesColors[7] },
  { index: 20, name: "Heroism", code: "H", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures your willingness to take personal risks for others", color: valuesColors[8] },
  { index: 21, name: "Deference", code: "D", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures your willingness to submit to others' authority or status", color: valuesColors[9] },
  { index: 22, name: "Equity", code: "Eq", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures your belief that resources should be distributed fairly", color: valuesColors[10] },
  { index: 23, name: "Property", code: "Pr", dimension: "values", category: "Cooperative Virtues", tooltip: "Measures your belief in property rights and ownership norms", color: valuesColors[11] },
  // Personal Values
  { index: 24, name: "Power", code: "Po", dimension: "values", category: "Personal Values", tooltip: "Measures your desire for status, prestige, and control over resources", color: valuesColors[12] },
  { index: 25, name: "Achievement", code: "Ac", dimension: "values", category: "Personal Values", tooltip: "Measures your drive for personal success through demonstrated competence", color: valuesColors[13] },
  { index: 26, name: "Hedonism", code: "He", dimension: "values", category: "Personal Values", tooltip: "Measures your pursuit of pleasure and sensory gratification", color: valuesColors[14] },
  { index: 27, name: "Stimulation", code: "Stim", dimension: "values", category: "Personal Values", tooltip: "Measures your need for novelty, variety, and excitement", color: valuesColors[15] },
  { index: 28, name: "Self-Direction", code: "Sd", dimension: "values", category: "Personal Values", tooltip: "Measures your desire for independence in thought and action", color: valuesColors[16] },
  { index: 29, name: "Universalism", code: "U", dimension: "values", category: "Personal Values", tooltip: "Measures your concern for the welfare of all people and nature", color: valuesColors[17] },
  { index: 30, name: "Benevolence", code: "B", dimension: "values", category: "Personal Values", tooltip: "Measures your concern for the welfare of people in your immediate circle", color: valuesColors[18] },
  { index: 31, name: "Conformity", code: "Co", dimension: "values", category: "Personal Values", tooltip: "Measures your restraint of actions that might upset or harm others", color: valuesColors[19] },
  { index: 32, name: "Tradition", code: "T", dimension: "values", category: "Personal Values", tooltip: "Measures your respect for cultural customs and inherited practices", color: valuesColors[20] },
  { index: 33, name: "Security", code: "S", dimension: "values", category: "Personal Values", tooltip: "Measures your desire for safety, stability, and order", color: valuesColors[21] },
  // Social Orientation
  { index: 34, name: "Social Dominance", code: "Sdo", dimension: "values", category: "Social Orientation", tooltip: "Measures your preference for group-based hierarchy and inequality", color: valuesColors[22] },
  { index: 35, name: "Authoritarianism", code: "Aut", dimension: "values", category: "Social Orientation", tooltip: "Measures your preference for obedience, conformity, and strong leadership", color: valuesColors[23] },

  // ===== META-THINKING (36-47) =====
  { index: 36, name: "Dogmatism", code: "Do", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures rigidity of belief systems and resistance to changing views", color: metaThinkingColors[0] },
  { index: 37, name: "Need for Cognition", code: "Nfc", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your intrinsic enjoyment of thinking and intellectual effort", color: metaThinkingColors[1] },
  { index: 38, name: "Intolerance for Uncertainty", code: "Ic", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your discomfort with ambiguity and unpredictability", color: metaThinkingColors[2] },
  { index: 39, name: "Intellectual Humility", code: "Ih", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your recognition that your beliefs could be wrong", color: metaThinkingColors[3] },
  { index: 40, name: "Anthropomorphism", code: "Atm", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your tendency to attribute human qualities to non-human things", color: metaThinkingColors[4] },
  { index: 41, name: "Teleology", code: "Te", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your belief that events happen for a reason or purpose", color: metaThinkingColors[5] },
  { index: 42, name: "Subjective Numeracy", code: "Sn", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your comfort with and reliance on numerical thinking", color: metaThinkingColors[6] },
  { index: 43, name: "Just World", code: "Jw", dimension: "meta-thinking", category: "Meta-Thinking", tooltip: "Measures your belief that people generally get what they deserve", color: metaThinkingColors[7] },
  // Primal World Beliefs
  { index: 44, name: "Alive", code: "PWa", dimension: "meta-thinking", category: "Primal World Beliefs", tooltip: "Measures your belief that the world has agency, intent, and responsiveness", color: metaThinkingColors[8] },
  { index: 45, name: "Enticing", code: "PWe", dimension: "meta-thinking", category: "Primal World Beliefs", tooltip: "Measures your belief that the world is interesting and worth exploring", color: metaThinkingColors[9] },
  { index: 46, name: "Safe", code: "PWs", dimension: "meta-thinking", category: "Primal World Beliefs", tooltip: "Measures your belief that the world is generally safe and unthreatening", color: metaThinkingColors[10] },
  { index: 47, name: "Good", code: "PWg", dimension: "meta-thinking", category: "Primal World Beliefs", tooltip: "Measures your belief that the world is fundamentally good", color: metaThinkingColors[11] },
];

/**
 * Parlia population averages from a large dataset.
 * Index maps to element index (0-47). null = no average available.
 */
export const PARLIA_AVERAGES: (number | null)[] = [
  // Personality (0-11)
  78,   // 0  Openness (O)
  50,   // 1  Conscientiousness (C)
  67,   // 2  Extraversion (E)
  56,   // 3  Agreeableness (A)
  61,   // 4  Neuroticism (N)
  52,   // 5  Machiavellianism (X)
  34,   // 6  Narcissism (Y)
  61,   // 7  Psychopathy (Z)
  46,   // 8  Emotional Reappraisal (Er)
  39,   // 9  Suppression Tendency (St)
  57,   // 10 Mortality Concern (M)
  null, // 11 Life Satisfaction (Ls)
  // Values (12-35)
  57,   // 12 Care (Ca)
  40,   // 13 Fairness (F)
  47,   // 14 Loyalty (L)
  39,   // 15 Authority (Au)
  41,   // 16 Purity (P)
  68,   // 17 Family (Fa)
  71,   // 18 Group (G)
  55,   // 19 Reciprocity (Re)
  33,   // 20 Heroism (H)
  72,   // 21 Deference (D)
  50,   // 22 Equity (Eq)
  49,   // 23 Property (Pr)
  63,   // 24 Power (Po)
  66,   // 25 Achievement (Ac)
  67,   // 26 Hedonism (He)
  79,   // 27 Stimulation (Stim)
  81,   // 28 Self-Direction (Sd)
  73,   // 29 Universalism (U)
  39,   // 30 Benevolence (B)
  52,   // 31 Conformity (Co)
  60,   // 32 Tradition (T)
  31,   // 33 Security (S)
  29,   // 34 Social Dominance (Sdo)
  null, // 35 Authoritarianism (Aut)
  // Meta-Thinking (36-47)
  28,   // 36 Dogmatism (Do)
  62,   // 37 Need for Cognition (Nfc)
  52,   // 38 Intolerance for Uncertainty (Ic)
  40,   // 39 Intellectual Humility (Ih)
  63,   // 40 Anthropomorphism (Atm)
  64,   // 41 Teleology (Te)
  34,   // 42 Subjective Numeracy (Sn)
  74,   // 43 Just World (Jw)
  74,   // 44 Alive (PWa)
  35,   // 45 Enticing (PWe)
  47,   // 46 Safe (PWs)
  null, // 47 Good (PWg)
];

export function getElementByIndex(index: number): ElementDefinition {
  return ELEMENTS[index];
}

export function getElementsByDimension(dimension: Dimension): ElementDefinition[] {
  return ELEMENTS.filter((e) => e.dimension === dimension);
}

export function getElementsByCategory(category: string): ElementDefinition[] {
  return ELEMENTS.filter((e) => e.category === category);
}
