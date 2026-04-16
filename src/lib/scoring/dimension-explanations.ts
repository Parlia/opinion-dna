/**
 * Generate contextual explanations for score comparisons between two partners.
 *
 * Not AI-generated — deterministic logic based on score patterns.
 * Gaps aren't framed as bad; different scores can be powerful.
 * Similar scores surface what might be missing from the team.
 */

import { ELEMENTS, type ElementDefinition } from "./elements";
import { type ScoreLevel, getScoreLevel } from "./engine";

interface ComparisonExplanation {
  headline: string;
  body: string;
  tone: "strength" | "complementary" | "attention" | "neutral";
}

function levelLabel(level: ScoreLevel): string {
  switch (level) {
    case "VERY HIGH": return "very high";
    case "HIGH": return "high";
    case "MEDIUM": return "moderate";
    case "LOW": return "low";
    case "VERY LOW": return "very low";
  }
}

export function getComparisonExplanation(
  element: ElementDefinition,
  scoreA: number,
  scoreB: number,
  nameA: string,
  nameB: string,
): ComparisonExplanation {
  const gap = Math.abs(scoreA - scoreB);
  const levelA = getScoreLevel(scoreA);
  const levelB = getScoreLevel(scoreB);
  const higher = scoreA > scoreB ? nameA : nameB;
  const lower = scoreA > scoreB ? nameB : nameA;
  const highScore = Math.max(scoreA, scoreB);
  const lowScore = Math.min(scoreA, scoreB);
  const bothHigh = scoreA > 65 && scoreB > 65;
  const bothLow = scoreA < 35 && scoreB < 35;
  const aligned = gap < 15;
  const moderate = gap >= 15 && gap < 30;

  // Dimension-specific explanations
  const explanations: Record<string, () => ComparisonExplanation> = {
    // ── Big 5 ──────────────────────────────────────────
    "Openness": () => {
      if (aligned && bothHigh) return { headline: "Both highly open to new ideas", body: `You'll both push for innovation and exploration. Watch for analysis paralysis — with no one anchoring to proven approaches, you might chase novelty over execution. Designate one person as the "is this actually better?" check on new ideas.`, tone: "attention" };
      if (aligned && bothLow) return { headline: "Both prefer proven approaches", body: `You'll build on what works rather than reinventing. This is efficient, but you may miss disruptive opportunities. Consider scheduling a monthly "what if we tried something completely different?" session.`, tone: "attention" };
      if (gap > 25) return { headline: "A creative-practical balance", body: `${higher} brings creative exploration and appetite for the new, while ${lower} brings groundedness and preference for the proven. This is a powerful combination: one generates possibilities, the other filters for viability. Let ${higher} brainstorm freely before ${lower} evaluates.`, tone: "complementary" };
      return { headline: "Similar openness to experience", body: `You process novelty at a similar pace, which means fewer conflicts about when to experiment vs. when to stick with what works.`, tone: "neutral" };
    },

    "Conscientiousness": () => {
      if (aligned && bothHigh) return { headline: "Both highly disciplined", body: `You'll hit deadlines and maintain high standards. The risk: perfectionism and over-planning. Give yourselves permission to ship things that are 80% ready — you'll both want 100%, but startups reward speed.`, tone: "strength" };
      if (aligned && bothLow) return { headline: "Both flexible on structure", body: `You're adaptable and spontaneous, but deadlines and follow-through may suffer. One of you needs to own the "operations" role, even if it doesn't come naturally. Consider external accountability (advisor, board check-ins).`, tone: "attention" };
      if (gap > 25) return { headline: "Structure meets flexibility", body: `${higher} brings organization and follow-through; ${lower} brings adaptability and comfort with ambiguity. This works well if you respect the difference: ${higher} shouldn't micromanage, and ${lower} shouldn't dismiss process as bureaucracy.`, tone: "complementary" };
      return { headline: "Similar work discipline", body: `You share a similar approach to structure and follow-through, reducing friction around how work gets done.`, tone: "neutral" };
    },

    "Extraversion": () => {
      if (aligned && bothHigh) return { headline: "Both energized by people", body: `Networking, pitching, and team-building will come naturally to both of you. Make sure someone is also doing the deep, quiet work — you might both default to meetings over heads-down execution.`, tone: "strength" };
      if (aligned && bothLow) return { headline: "Both prefer focused work", body: `You'll excel at deep work and careful thinking. But someone needs to be the external face — fundraising, sales, partnerships. Decide who stretches into that role, and support them.`, tone: "attention" };
      if (gap > 25) return { headline: "Internal and external balance", body: `${higher} naturally handles the outward-facing work: pitching, networking, recruiting. ${lower} handles the inward-facing work: deep thinking, focused execution, code. This is one of the most valuable complementary patterns in co-founding teams.`, tone: "complementary" };
      return { headline: "Similar social energy", body: `You draw energy from similar environments, which means fewer conflicts about how much social interaction the workday should involve.`, tone: "neutral" };
    },

    "Agreeableness": () => {
      if (aligned && bothHigh) return { headline: "Both naturally cooperative", body: `You'll build a warm team culture and handle people well. The risk: avoiding necessary conflict. Hard conversations about performance, equity, or direction may get delayed. Agree on a protocol for raising uncomfortable topics.`, tone: "attention" };
      if (aligned && bothLow) return { headline: "Both direct and challenging", body: `You'll have honest debates and make tough calls. But your team may experience you as intimidating. Balance directness with deliberate warmth — people need to feel safe to bring you bad news.`, tone: "attention" };
      if (gap > 25) return { headline: "Warmth meets directness", body: `${higher} brings diplomacy and team cohesion; ${lower} brings willingness to have hard conversations. This is valuable: ${higher} maintains relationships while ${lower} addresses problems. Just make sure ${lower}'s directness doesn't undermine ${higher}'s people-building.`, tone: "complementary" };
      return { headline: "Similar interpersonal style", body: `You approach relationships and conflict with similar instincts, creating a consistent culture for your team.`, tone: "neutral" };
    },

    "Neuroticism": () => {
      if (aligned && bothHigh) return { headline: "Both emotionally reactive", body: `You'll pick up on problems early because you're both sensitive to things going wrong. But stress can amplify between you — when one spirals, the other may join rather than stabilize. Establish a "one person stays calm" rule during crises.`, tone: "attention" };
      if (aligned && bothLow) return { headline: "Both emotionally steady", body: `You'll stay calm under pressure, which is a major advantage in startups. The risk: you might not notice when your team is struggling because you process stress so differently from more reactive people.`, tone: "strength" };
      if (gap > 25) return { headline: "A stabilizing dynamic", body: `${higher} acts as an early warning system — they feel problems before they're visible. ${lower} acts as a stabilizer — they stay calm when things get intense. This is a powerful combination if ${lower} takes ${higher}'s concerns seriously rather than dismissing them as overreaction.`, tone: "complementary" };
      return { headline: "Similar emotional baseline", body: `You process stress at a similar intensity, which means fewer misunderstandings about whether a situation is "a big deal" or not.`, tone: "neutral" };
    },

    // ── Dark Triad ──────────────────────────────────────
    "Machiavellianism": () => {
      if (aligned && bothHigh) return { headline: "Both strategically minded", body: `You read social dynamics well and negotiate effectively. The risk: you might out-strategize each other rather than communicating directly. Commit to radical transparency between yourselves, even if you're strategic with everyone else.`, tone: "attention" };
      if (gap > 25) return { headline: "Strategic + straightforward", body: `${higher} sees the chess board — political dynamics, negotiation angles, unspoken motivations. ${lower} communicates more directly and transparently. This works well externally (deals, fundraising) if ${higher} keeps ${lower} fully informed about strategic thinking.`, tone: "complementary" };
      return { headline: "Similar strategic orientation", body: `You approach social dynamics with similar instincts, which reduces the risk of one partner feeling outmaneuvered by the other.`, tone: "neutral" };
    },

    "Narcissism": () => {
      if (aligned && bothHigh) return { headline: "Both driven by recognition", body: `You'll push each other to aim high and think big. The risk: competition for credit. Explicitly agree on how you'll share recognition — who presents to investors, who does press, who takes the stage. Don't leave this implicit.`, tone: "attention" };
      if (gap > 25) return { headline: "Different relationship with recognition", body: `${higher} draws energy from external validation and recognition; ${lower} is less driven by the spotlight. Be explicit about credit: ${higher} may naturally take more visible roles, but ${lower}'s contributions need equal acknowledgment.`, tone: "complementary" };
      return { headline: "Similar drive for recognition", body: `You have a similar relationship with status and external validation, reducing competition for the spotlight.`, tone: "neutral" };
    },

    "Psychopathy": () => {
      if (gap > 25) return { headline: "Different risk and empathy profiles", body: `${higher} is more comfortable with bold, high-stakes decisions and may be less affected by interpersonal friction. ${lower} weighs emotional impact more heavily. In a startup, you need both: the courage to make hard calls AND the empathy to bring people along.`, tone: "complementary" };
      return { headline: "Similar risk tolerance", body: `You process risk and interpersonal dynamics at a similar level, creating consistency in how you make tough calls.`, tone: "neutral" };
    },

    // ── Emotional Regulation ────────────────────────────
    "Emotional Reappraisal": () => {
      if (gap > 25) return { headline: "Different coping strategies", body: `${higher} naturally reframes setbacks as learning opportunities; ${lower} may need more time to process disappointment. Neither is wrong — ${higher} can help ${lower} find perspective, and ${lower} can help ${higher} fully feel the weight of important moments rather than immediately reframing.`, tone: "complementary" };
      return { headline: "Similar emotional processing", body: `You reframe challenges at a similar pace, creating a shared emotional language for processing setbacks.`, tone: "neutral" };
    },

    "Suppression Tendency": () => {
      if (aligned && bothHigh) return { headline: "Both internalize stress", body: `This is a significant blind spot. Neither of you naturally surfaces what's bothering you. Problems will fester. You absolutely need a structured check-in ritual — weekly, mandatory, with explicit questions like "What's one thing you're not saying?"`, tone: "attention" };
      if (gap > 25) return { headline: "Different stress expression", body: `${higher} holds things in; ${lower} processes out loud. ${lower} may interpret ${higher}'s silence as "everything's fine" when it's not. ${higher} may interpret ${lower}'s venting as panic when it's just processing. Name this pattern so neither misreads the other.`, tone: "complementary" };
      return { headline: "Similar stress expression", body: `You externalize stress at a similar level, making it easier to read each other accurately under pressure.`, tone: "neutral" };
    },

    "Mortality Concern": () => {
      if (gap > 25) return { headline: "Different time horizons", body: `${higher} carries a deeper awareness of impermanence, which can create urgency and meaning. ${lower} operates with a longer horizon. This tension can be productive: urgency + patience = sustainable ambition.`, tone: "complementary" };
      return { headline: "Similar sense of urgency", body: `You share a similar relationship with time and impermanence, aligning on how urgently to pursue goals.`, tone: "neutral" };
    },

    "Life Satisfaction": () => {
      if (gap > 25) return { headline: "Different baseline happiness", body: `${higher} brings natural optimism and satisfaction; ${lower} brings a restless drive that something could always be better. Both are useful in a startup — optimism sustains through hard times, while dissatisfaction drives improvement.`, tone: "complementary" };
      return { headline: "Similar life satisfaction", body: `You share a similar baseline contentment, which means fewer misunderstandings about whether the current state of things is "good enough" or needs changing.`, tone: "neutral" };
    },

    // ── Moral Foundations ───────────────────────────────
    "Care": () => {
      if (gap > 25) return { headline: "Different empathy intensity", body: `${higher} leads with compassion and concern for others' wellbeing; ${lower} is more detached and analytical about people decisions. In hiring and firing, you need both: care for the person AND willingness to make hard calls for the business.`, tone: "complementary" };
      return { headline: "Similar care orientation", body: `You weight concern for others' wellbeing similarly, creating consistency in people decisions.`, tone: "neutral" };
    },

    "Fairness": () => {
      if (aligned && bothHigh) return { headline: "Both deeply fairness-driven", body: `You'll build equitable systems and your team will trust you. Just be aware that "fair" can mean different things — equal outcomes vs. equal opportunity vs. proportional to contribution. Define your shared framework early.`, tone: "strength" };
      if (gap > 25) return { headline: "Different fairness frameworks", body: `This is one of the most predictive gaps for co-founder conflict. ${higher} will want precise, formula-driven equity and compensation decisions. ${lower} will weigh loyalty, relationships, and context more heavily. Neither is wrong, but you MUST have an explicit conversation about this before it comes up in a real decision.`, tone: "attention" };
      return { headline: "Similar fairness orientation", body: `You process fairness similarly, reducing the risk of conflict over equity, compensation, and resource allocation.`, tone: "neutral" };
    },

    "Loyalty": () => {
      if (gap > 25) return { headline: "Different loyalty weight", body: `${higher} prioritizes standing by people who've been there from the start; ${lower} evaluates based on current contribution. This will surface when you need to replace an early employee who's no longer the right fit. Discuss this scenario before it happens.`, tone: "complementary" };
      return { headline: "Similar loyalty orientation", body: `You weight loyalty and commitment similarly, creating alignment on how you treat long-standing relationships.`, tone: "neutral" };
    },

    "Authority": () => {
      if (gap > 25) return { headline: "Different relationship with hierarchy", body: `${higher} respects established structures and chains of command; ${lower} questions authority and prefers flat organizations. Decide early: what's your org structure philosophy? This gap will surface as you hire and create reporting lines.`, tone: "complementary" };
      return { headline: "Similar authority orientation", body: `You share a similar comfort level with hierarchy, creating alignment on organizational structure.`, tone: "neutral" };
    },

    "Purity": () => {
      if (gap > 25) return { headline: "Different moral boundaries", body: `${higher} has stronger instincts about what's "right" vs. "wrong" beyond pure logic; ${lower} is more pragmatic. This may surface in ethical gray areas — competitive tactics, data privacy tradeoffs, marketing claims.`, tone: "complementary" };
      return { headline: "Similar moral intuitions", body: `You share similar instincts about ethical boundaries, reducing conflict over gray-area decisions.`, tone: "neutral" };
    },

    // ── Personal Values ─────────────────────────────────
    "Achievement": () => {
      if (aligned && bothHigh) return { headline: "Both highly achievement-driven", body: `You'll push each other and set ambitious goals. This is a core strength for co-founders. Just ensure achievement doesn't become an end in itself — celebrate milestones, not just the next target.`, tone: "strength" };
      if (gap > 25) return { headline: "Different achievement drive", body: `${higher} is relentlessly goal-oriented; ${lower} is more balanced between achievement and other life priorities. Be explicit about expectations: hours, intensity, sacrifice level. A mismatch here breeds resentment.`, tone: "attention" };
      return { headline: "Similar achievement drive", body: `You share a similar ambition level, creating natural alignment on how hard to push and what success looks like.`, tone: "neutral" };
    },

    "Power": () => {
      if (aligned && bothHigh) return { headline: "Both drawn to influence", body: `You'll both want to shape the direction of the company and the industry. This is motivating but can create power struggles. Clearly delineate decision domains — who has final say on product, on hiring, on strategy.`, tone: "attention" };
      if (gap > 25) return { headline: "Different power orientation", body: `${higher} is more driven by control, status, and influence; ${lower} is less concerned with positional power. This can work well if ${higher} takes the CEO/external-facing role and ${lower} is genuinely comfortable with that dynamic.`, tone: "complementary" };
      return { headline: "Similar power orientation", body: `You have a similar relationship with status and control, reducing competition for positional authority.`, tone: "neutral" };
    },

    "Self-Direction": () => {
      if (aligned && bothHigh) return { headline: "Both fiercely independent", body: `You'll each want autonomy and resist being told what to do. Great for a co-founding relationship (you won't micromanage each other), but you need explicit agreements about shared decisions vs. individual authority.`, tone: "strength" };
      return { headline: "Similar independence level", body: `You share a similar need for autonomy, creating alignment on how much independence each partner gets.`, tone: "neutral" };
    },

    // ── Meta-Thinking ───────────────────────────────────
    "Dogmatism": () => {
      if (aligned && bothHigh) return { headline: "Both hold strong convictions", body: `When you agree, you'll move mountains. When you disagree, neither will budge. This is the most dangerous shared blind spot for co-founders. You NEED a tiebreaker mechanism — a trusted advisor, a decision framework, a coin flip. Something that breaks deadlocks before they become wars.`, tone: "attention" };
      if (aligned && bothLow) return { headline: "Both naturally flexible", body: `You'll adapt quickly and change course when evidence demands it. The risk: changing direction too often. Sometimes you need someone to say "we committed to this, let's see it through." Build in commitment periods before allowing pivots.`, tone: "attention" };
      if (gap > 25) return { headline: "Conviction meets flexibility", body: `${higher} provides conviction and persistence; ${lower} provides adaptability and openness to new evidence. This is productive IF ${lower}'s flexibility isn't steamrolled by ${higher}'s certainty. Establish that changing your mind is a sign of strength, not weakness.`, tone: "complementary" };
      return { headline: "Similar conviction level", body: `You hold beliefs with similar intensity, creating a balanced dynamic in debates and decisions.`, tone: "neutral" };
    },

    "Need for Cognition": () => {
      if (aligned && bothHigh) return { headline: "Both deep thinkers", body: `You'll make well-considered decisions and enjoy intellectual challenges. Watch for overthinking — sometimes a startup needs a fast decision more than a perfect one. Set time limits on analysis.`, tone: "strength" };
      if (gap > 25) return { headline: "Thinker + doer balance", body: `${higher} wants to think deeply before acting; ${lower} prefers to act and adjust. Both approaches have value. Let ${higher} think on strategic decisions, let ${lower} set the pace on execution. The tension between "let me think about this" and "let's just try it" is productive.`, tone: "complementary" };
      return { headline: "Similar cognitive engagement", body: `You enjoy thinking at a similar depth, creating alignment on how much analysis a decision deserves before acting.`, tone: "neutral" };
    },

    "Intellectual Humility": () => {
      if (aligned && bothHigh) return { headline: "Both open to being wrong", body: `You'll update your beliefs when presented with evidence and genuinely consider each other's perspectives. This is one of the strongest predictors of co-founder relationship longevity.`, tone: "strength" };
      if (aligned && bothLow) return { headline: "Both highly certain", body: `You're both confident in your views, which creates strong conviction. But when you disagree, resolution will be difficult because neither naturally yields. Get an external advisor you both respect.`, tone: "attention" };
      if (gap > 25) return { headline: "Different relationship with being wrong", body: `${higher} actively seeks disconfirming evidence; ${lower} trusts their own judgment. ${higher} may defer too often; ${lower} may dismiss valid pushback. Name this pattern so ${higher} feels permission to hold ground and ${lower} practices genuine listening.`, tone: "attention" };
      return { headline: "Similar intellectual humility", body: `You have a similar willingness to reconsider your positions, creating a balanced debate culture.`, tone: "neutral" };
    },

    "Intolerance for Uncertainty": () => {
      if (gap > 25) return { headline: "Different comfort with ambiguity", body: `${higher} needs clarity and resolution; ${lower} is comfortable navigating uncertainty. Startups are inherently ambiguous — ${lower}'s tolerance is an asset, but ${higher}'s need for clarity drives better planning. Let ${higher} create structure without over-constraining ${lower}'s exploration.`, tone: "complementary" };
      return { headline: "Similar uncertainty tolerance", body: `You handle ambiguity at a similar level, reducing conflict about how much planning vs. improvisation to do.`, tone: "neutral" };
    },

    "Subjective Numeracy": () => {
      if (gap > 25) return { headline: "Different data orientation", body: `${higher} leans heavily on numbers and quantitative reasoning; ${lower} relies more on intuition and qualitative judgment. In decisions, present both: the spreadsheet AND the narrative. The best decisions use both lenses.`, tone: "complementary" };
      return { headline: "Similar data orientation", body: `You process quantitative information at a similar level, creating alignment on how much data a decision needs.`, tone: "neutral" };
    },
  };

  // Check for dimension-specific explanation
  const specific = explanations[element.name];
  if (specific) return specific();

  // ── Generic fallback based on score patterns ──────────
  if (aligned && bothHigh) {
    return {
      headline: `Both score high on ${element.name}`,
      body: `You share this trait strongly. This creates natural alignment but also means neither of you counterbalances the other. Consider whether this shared intensity has any blind spots for your team.`,
      tone: "strength",
    };
  }

  if (aligned && bothLow) {
    return {
      headline: `Both score low on ${element.name}`,
      body: `Neither of you naturally brings this quality to the partnership. Consider whether your team or advisors can fill this gap, especially if it matters for your market or customers.`,
      tone: "attention",
    };
  }

  if (gap > 25) {
    return {
      headline: `Complementary ${element.name} profiles`,
      body: `${higher} scores ${levelLabel(getScoreLevel(highScore))} while ${lower} scores ${levelLabel(getScoreLevel(lowScore))}. This difference can be a strength if you respect what each perspective brings rather than trying to change each other.`,
      tone: "complementary",
    };
  }

  return {
    headline: `Similar ${element.name} levels`,
    body: `You're aligned on this dimension, which means fewer conflicts but also less natural diversity of perspective here.`,
    tone: "neutral",
  };
}
