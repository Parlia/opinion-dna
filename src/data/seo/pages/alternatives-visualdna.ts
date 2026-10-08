import type { AlternativePage } from "../competitors";

// /alternatives/visualdna-alternatives
// Targets (Search Console, 3 months): visualdna who am i, visual dna who am i,
// who am i visual dna, visualdna.
//
// Sources checked on 2026-10-08 (VisualDNA facts only; nothing here is shown to users):
// - visualdna.com and www.visualdna.com: no A record (www is a CNAME to the apex,
//   which has none), so the old homepage does not load.
//   https://dns.google/resolve?name=visualdna.com&type=A
//   https://dns.google/resolve?name=www.visualdna.com&type=A
// - you.visualdna.com (older quiz host): CNAME to an AWS load balancer that returns
//   NXDOMAIN, so old you.visualdna.com quiz links do not load.
//   https://dns.google/resolve?name=you.visualdna.com&type=A
// - Live quiz, branded "The VisualDNA Who Am I? Quiz", loads (HTTP 200), consent
//   screen then "Which of these amazes you most? Pick one to start" with picture
//   answers. Page data: quiz type "Ocean", 32 personality questions, every option an
//   image, then demographic questions and an opt-in lifestyle/brand block ("helps us
//   keep the quiz free"). Privacy and cookie links go to nielsen.com.
//   https://quiz.visualdna.com/13939/2025-08-29-who-am-i-us
//   https://quiz.visualdna.com/13939/who-am-i-us
//   Also loading: .../2025-08-29-who-am-i-uk, .../2025-09-18-wai-de,
//   .../preview/13939/who-am-i-canada, .../preview/13939/2025-05-21-WAI-FR
// - Nielsen panels page, "Visual DNA" section: free Visual DNA quizzes; "Who am I?
//   Quiz" described as a personality test designed by psychologists based on the
//   OCEAN (Big 5) model; country links for AU, CA, FR, DE, HK, IT, ES, UK, US (AU, HK,
//   IT, ES point at you.visualdna.com). Also lists The Personality Quiz and The
//   Success Quiz.
//   https://panels.nielsen.com/panels-and-surveys/locations/
// - Nielsen VisualDNA Privacy Notice (US), last updated December 2025: VisualDNA is
//   a product offered by Nielsen Media Research Limited; hosts image-based
//   personality quizzes; opt-in commercial questions on lifestyle and spending;
//   tailored quiz result; data used to build profiles and segments for
//   interest-based advertising; email optional (to get results by email).
//   https://www.nielsen.com/legal/visualdna-privacy-policy/
// - Wayback Machine, VisualDNA's own pages:
//   Our Quizzes, Dec 2013: all quizzes "very visual"; Who Am I? described as the
//   most advanced personality test VisualDNA offered, drawing on five-factor theory
//   (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism); detailed
//   personalized reports at the end of every quiz.
//   https://web.archive.org/web/20131202230305/http://www.visualdna.com/our-quizzes
//   Quizzes page, Dec 2014 (same Who Am I? description):
//   https://web.archive.org/web/20141228121830/http://www.visualdna.com/quizzes/
//   Homepage, Dec 2015: big data plus psychology, profiling products for digital
//   advertising and credit scoring:
//   https://web.archive.org/web/20151223074348/http://www.visualdna.com/
//   visualdna.com 301 redirect to Nielsen panels page, Sep 2022 and Oct 2023:
//   https://web.archive.org/web/20220901162201/http://visualdna.com/
//   https://web.archive.org/web/20231026083543/http://visualdna.com/
// - Open-Source Psychometrics Project Big Five test: 50 items from the IPIP
//   Big-Five Factor Markers (Goldberg 1992), five-point agree scale, "3-8 minutes",
//   for educational or entertainment use. No price shown, so none stated.
//   https://openpsychometrics.org/tests/IPIP-BFFM/
// - 16Personalities model page: five spectrums, reworks the Big Five, 16 types with
//   Assertive/Turbulent variants: https://www.16personalities.com/articles/our-theory
// - Truity homepage test list (Big Five, Enneagram, DISC, 16 Types, Career, Love
//   Styles, Emotional Intelligence): https://www.truity.com/
// - VIA: 24 character strengths, six virtues, free survey:
//   https://www.viacharacter.org/character-strengths
// Left out (not verifiable on VisualDNA's or Nielsen's own sites): acquisition date
// and price, founding details, user counts, launch date of Who Am I?, scoring method.
export const visualDnaAlternativesPage: AlternativePage = {
  slug: "visualdna-alternatives",
  competitorName: "VisualDNA",
  title: "VisualDNA 'Who Am I?' Test Alternatives",
  seoTitle: "VisualDNA Who Am I Test: Where It Went and Alternatives",
  description:
    "VisualDNA Who Am I? quiz: where to take it now that Nielsen runs it, what it measured, and alternatives from free Big Five tests to a 48-dimension report.",
  intro:
    "If you took the VisualDNA Who Am I? quiz, you probably remember the format better than the results. Instead of rating statements about yourself, you answered with pictures: each question showed a handful of photos, and you clicked the one that felt most like you. At the end you got a personality profile.\n\nThe question most people arrive here with has a short answer: as of October 2026, a version of the quiz is still online. The old visualdna.com homepage no longer loads, which is why it can look as if the quiz vanished. VisualDNA is now a product of Nielsen, the media measurement company, and Nielsen's [panels and surveys page](https://panels.nielsen.com/panels-and-surveys/locations/) links to current versions of the Who Am I? quiz for several countries, hosted on quiz.visualdna.com.\n\nBelow we cover what the quiz measured, what happens to your answers, and which alternatives make sense depending on what you are after: the same playful picture format, the same five traits in a clearer test, or a much broader map of how you think. [Opinion DNA](/personal-assessment) is one of those options, and we will be upfront that it works differently. It is 179 written questions, with no pictures.",
  whySwitch: [
    "The visualdna.com homepage no longer loads, and older quiz links on you.visualdna.com are dead, so the quiz is hard to find (a version still runs at quiz.visualdna.com)",
    "VisualDNA is now an advertising data product from Nielsen, and its privacy notice says quiz data is used to build audience segments for interest-based advertising",
    "Alongside the personality questions, the quiz invites you to opt in to commercial questions about your lifestyle and spending habits",
    "Who Am I? reports on the Big Five traits only, so it says nothing about your values, moral intuitions, or thinking style",
  ],
  alternatives: [
    "opinion-dna",
    {
      name: "Open-Source Psychometrics Project Big Five Test",
      description:
        "A 50-item test built on the International Personality Item Pool (IPIP) Big-Five Factor Markers. You rate short written statements on a five-point agree scale, and the site says most people finish in 3 to 8 minutes. It presents itself as a tool for educational or entertainment use.",
      dimensions: "5 traits (the same OCEAN model as Who Am I?)",
      bestFor:
        "People who want the five traits the Who Am I? quiz reported, from a short test where you can see what each question asks.",
      website: "openpsychometrics.org",
    },
    "16personalities",
    "truity",
    "via",
  ],
  sections: [
    {
      heading: "What the VisualDNA Who Am I? quiz was",
      content:
        "VisualDNA built its reputation on picture quizzes. Its own quiz pages, as preserved by the Internet Archive from 2013 and 2014, describe every VisualDNA quiz as very visual by design, and list a small family of them: a general Personality Quiz, a new-year goal-setting quiz, and Who Am I?, which the company called the most advanced personality test it offered.\n\nWho Am I? drew on the five-factor model of personality, better known as the Big Five or OCEAN. The same pages say it would show how open you are to new experiences and where you land on conscientiousness, extraversion, agreeableness, and neuroticism, then connect that combination to everyday behavior, from the films you like to how you hold up under stress. Each quiz ended with a detailed report personalized to your answers.\n\nThe quiz was also the front door to a business. By 2015 the VisualDNA homepage described the company as combining big data and psychology to build profiling products for digital advertising and credit scoring. The advertising half of that business is still part of how the quiz works today (more on that below).",
    },
    {
      heading: "Can you still take the Who Am I? quiz?",
      content:
        "Yes, with some caveats about where to find it. Here is what we found when we checked in October 2026.\n\n- visualdna.com and www.visualdna.com no longer point to a website, so typing the old address gets you nothing. Archived snapshots show the domain redirecting to a Nielsen panels page in 2022 and 2023.\n- Older quiz links on you.visualdna.com no longer load either.\n- The quiz itself lives on at quiz.visualdna.com, branded The VisualDNA Who Am I? Quiz. Nielsen's panels page lists versions for the United States, United Kingdom, Canada, France, Germany, Australia, Hong Kong, Italy, and Spain. The US, UK, Canadian, French, and German links loaded for us. The others still pointed at the old you.visualdna.com address.\n\nThe current US version keeps the format people remember. After a consent screen, the first question asks which of a set of photos amazes you most, and the personality section runs to 32 questions, every one answered by picking a picture. The quiz also asks a few demographic questions and offers an opt-in section of lifestyle and brand questions, which it says helps keep the quiz free. Nielsen describes the quiz as designed by psychologists and based on the OCEAN (Big Five) model, so the results cover the same five traits as before.\n\nThe part worth reading before you start is the data use. Nielsen's [VisualDNA privacy notice](https://www.nielsen.com/legal/visualdna-privacy-policy/) says your answers are used to give you a tailored result, and also to build profiles and audience segments that its clients use for interest-based advertising. None of this is hidden; it is on the consent screen and in the notice. If you are comfortable with that trade, nothing else on this page will feel as much like the quiz you remember.",
    },
    {
      heading: "The five traits behind your Who Am I? results",
      content:
        "If you are trying to make sense of an old result, or to compare it with a new test, it helps to know what the five traits actually describe. Every Big Five test, picture-based or not, is aiming at the same five continuums.\n\n- [Openness](/dimensions/openness): appetite for new ideas, art, and experience. High scorers get restless with routine; low scorers prefer the familiar and the proven.\n- [Conscientiousness](/dimensions/conscientiousness): organization, follow-through, and self-discipline. This is the trait behind the tidy desk and the early arrival, two things the current Who Am I? quiz asks about with pictures.\n- [Extraversion](/dimensions/extraversion): how much energy you get from people and stimulation. Introversion is not the same as shyness; it is closer to a preference for quieter settings.\n- [Agreeableness](/dimensions/agreeableness): warmth, trust, and a preference for cooperation over confrontation.\n- [Neuroticism](/dimensions/neuroticism): how strongly and how often you feel negative emotions such as worry, anger, and sadness. A low score reads as calm and steady under pressure.\n\nTwo things are worth remembering when you compare results across tests. First, these are continuous traits, so a good report tells you where you sit on each scale, ideally against other people, instead of sorting you into a type. Second, different instruments ask different questions, so small differences between two tests are normal. A large gap on one trait is worth a second look: reread the questions behind it and ask which result sounds more like the person your friends would describe.",
    },
    {
      heading: "Picture quizzes versus written questionnaires",
      content:
        "Picking a photo is quick and oddly satisfying. You never have to decide whether you agree somewhat or agree strongly with a sentence about yourself, and the whole thing feels closer to a game than a form. That is a real advantage, and probably part of why people still search for this quiz years later.\n\nThe trade-off is transparency. A written item such as \"I make plans and stick to them\" tells you what it is asking, so you can judge whether your answer is honest and see why a score came out the way it did. A photo of a desk does not. The link between your click and your score lives inside the quiz's scoring, and you have to take it on trust. Some people like that, because it is harder to steer your answers toward the result you want. Others find it unsatisfying when a result surprises them and there is nothing to check it against.\n\nPictures also carry baggage. A quiet beach might read as calm to one person and as boredom to another, and the photo you pick on a given day can reflect taste or mood as much as a stable trait.\n\nThat is why most research-grade personality questionnaires, including the public-domain item pools psychologists use for the Big Five, stick to written statements rated on an agreement scale. If you want something that feels like VisualDNA, a picture quiz is the honest answer. If you want results you can understand, question by question, a statement-based test is the better fit.",
    },
    {
      heading: "Which alternative fits what you want",
      content:
        "There is no single replacement for Who Am I?, because people come back to it for different reasons. A rough guide:\n\n- You want the same experience. Take the current Who Am I? quiz through Nielsen's panels page. The same page lists two other VisualDNA quizzes, the Personality Quiz and the Success Quiz (pitched as a way to find the career path that suits you), though when we checked, only the Success Quiz links loaded.\n- You want the same five traits in a format you can check. A statement-based Big Five test does that. The Open-Source Psychometrics Project's 50-item version takes a few minutes, and our [Big Five test with a full report](/tests/big-five-test-with-report) page covers what a fuller report adds.\n- You want something quick and playful to share. 16Personalities is the obvious choice. Its own model page describes five spectrums that rework the Big Five, but results arrive as one of 16 four-letter types (with an assertive or turbulent variant), so your old Who Am I? results will not map onto it one to one. Our [16Personalities alternatives](/alternatives/16personalities-alternatives) page covers its trade-offs.\n- You want to try several frameworks. Truity offers separate tests for the Big Five, the Enneagram, DISC, a 16-type framework, careers, and more.\n- You care more about strengths than traits. The VIA Survey is free and measures 24 character strengths grouped under six virtues.\n- You want the whole picture: personality plus what you value and how you reason. That is what Opinion DNA is built for, and it is covered in the next section.\n\nOne honest caveat. We did not find a well-known, research-grade personality test for the public that uses pictures the way VisualDNA does. If the picture format is the thing you loved, VisualDNA's own quizzes remain the closest match, and everything else on this list asks you to read and rate statements.",
    },
    {
      heading: "Where Opinion DNA fits, and where it does not",
      content:
        "Opinion DNA is not a picture quiz, and it is not free, so it is not a like-for-like replacement for the Who Am I? quiz. It is for the person who took VisualDNA's quiz, enjoyed the result, and wanted more of it: more detail, more context, and a better sense of why they think the way they do.\n\nThe assessment is 179 written questions and takes about 10 to 15 minutes. It measures 48 dimensions in three layers, and each one gets a continuous score from 0 to 100, shown against the population average.\n\n- Personality (12 dimensions): the same five Big Five traits Who Am I? reported, plus the Dark Triad measured as everyday trait levels, two styles of emotional regulation, mortality concern, and life satisfaction.\n- Values (24 dimensions): what you think matters, from moral foundations such as [Care](/dimensions/care) to personal values such as [Self-Direction](/dimensions/self-direction) and social orientation.\n- Meta-Thinking (12 dimensions): how you form and hold beliefs, including [Need for Cognition](/dimensions/need-for-cognition), [Intellectual Humility](/dimensions/intellectual-humility), and primal world beliefs such as whether the world feels basically [safe](/dimensions/safe-world-belief).\n\nThe values and meta-thinking layers are the main reason to pick it over a Big Five test. Two people with near-identical Big Five scores can still disagree about almost everything, because one weighs loyalty and tradition heavily and the other weighs fairness and independence. You can browse every dimension on the [dimensions hub](/dimensions), and the [methodology page](/methodology) explains how the assessment was put together. It was built over three years with more than 60 experts from Oxford, Cambridge, NYU, Royal Holloway, and the University of Pennsylvania, using peer-reviewed psychometric scales.\n\nYour results come with an AI-generated personal report covering your personality, values, and meta-thinking, plus what they mean for your career and relationships. It costs $47, once, with lifetime access to your scores and report and a 30-day money-back guarantee. On data, our position is short: your scores are yours and we do not sell data. If you want to go further, you can compare profiles with a [partner](/couples), [friends](/friends), or a [co-founder](/co-founders), and only with both people's consent.\n\nIf that sounds like the deeper version of what you were looking for when you clicked a VisualDNA photo, [take the full assessment](/personal-assessment).",
    },
  ],
  faq: [
    {
      question: "Is the VisualDNA Who Am I? quiz still available?",
      answer:
        "Yes. As of October 2026, a version is online at quiz.visualdna.com under the name The VisualDNA Who Am I? Quiz, and Nielsen's [panels and surveys page](https://panels.nielsen.com/panels-and-surveys/locations/) links to it for several countries, including the US, UK, Canada, France, and Germany. The old visualdna.com homepage and older you.visualdna.com quiz links no longer load, which is why the quiz can seem to have disappeared.",
    },
    {
      question: "Who owns VisualDNA now?",
      answer:
        "Nielsen. According to Nielsen's VisualDNA privacy notice (last updated December 2025), VisualDNA is a product offered by Nielsen Media Research Limited, which has its registered office in London. The same notice says quiz answers, along with the optional lifestyle and spending questions, are used to build audience segments that Nielsen's clients use for interest-based advertising.",
    },
    {
      question: "Is the VisualDNA quiz free?",
      answer:
        "Yes. Nielsen describes its Visual DNA quizzes as free, and the quiz itself says its optional lifestyle and brand questions help keep it free. In exchange, Nielsen's privacy notice says your answers are also used to build advertising profiles. Opinion DNA makes the opposite trade: it costs $47 once, with a 30-day money-back guarantee, and we do not sell data.",
    },
    {
      question: "Is there another image-based personality test like VisualDNA?",
      answer:
        "Not one we could find among well-known personality tests. Research-grade questionnaires mostly use written statements rated on an agreement scale. The closest matches are VisualDNA's own quizzes: Nielsen lists the Personality Quiz and the Success Quiz alongside Who Am I?, although only the Success Quiz links loaded when we checked. If what you want is the same five traits, a statement-based Big Five test, such as the 50-item version from the Open-Source Psychometrics Project, measures them in a format where you can see what each question asks.",
    },
    {
      question: "Is Opinion DNA an image-based test like VisualDNA?",
      answer:
        "No. Opinion DNA is text-based: 179 written questions that take about 10 to 15 minutes. It includes the same five traits Who Am I? reported, from [Openness](/dimensions/openness) to [Neuroticism](/dimensions/neuroticism), as part of 48 dimensions across personality, values, and meta-thinking. Each dimension gets a 0 to 100 score shown against the population average, and you get an AI-generated report on what your profile means for your work, relationships, and the way you reason. If the picture format is what you miss, start with VisualDNA's own quiz. If you want the fuller picture, [take the full assessment](/personal-assessment).",
    },
  ],
  relatedDimensions: [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
    "need-for-cognition",
  ],
  ctaHref: "/personal-assessment",
};
