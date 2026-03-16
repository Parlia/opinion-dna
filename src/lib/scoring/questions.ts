/**
 * 179 Opinion DNA questions mapped from Go: parlia/go/assessment/opinion_dna.go
 *
 * Each question has:
 * - index: position (0-178)
 * - uid: legacy Dgraph UID (for reference/extraction)
 * - resultGroup: which of the 48 elements this question contributes to (1-indexed)
 * - direction: 1 = normal scoring, -1 = inverted scoring
 * - text: the question statement (to be populated from Dgraph)
 */

import { Question } from "./engine";

export const QUESTIONS: (Question & { text: string })[] = [
  // ===== PERSONALITY =====

  // Openness (O) - ResultGroup 1
  { index: 0, uid: "0x4f6e", resultGroup: 1, direction: 1, text: "I have a rich vocabulary" },
  { index: 1, uid: "0x4f73", resultGroup: 1, direction: -1, text: "I have difficulty understanding abstract ideas" },
  { index: 2, uid: "0x63ba", resultGroup: 1, direction: -1, text: "I do not have a good imagination" },
  { index: 3, uid: "0x63c7", resultGroup: 1, direction: 1, text: "I spent time reflecting on things" },
  { index: 4, uid: "0x63cc", resultGroup: 1, direction: 1, text: "I am full of ideas" },

  // Conscientiousness (C) - ResultGroup 2
  { index: 5, uid: "0x4f6c", resultGroup: 2, direction: 1, text: "I am always prepared" },
  { index: 6, uid: "0x4f77", resultGroup: 2, direction: 1, text: "I pay attention to details" },
  { index: 7, uid: "0x63b3", resultGroup: 2, direction: 1, text: "I get chores done right away" },
  { index: 8, uid: "0x63b8", resultGroup: 2, direction: -1, text: "I often forget to put things back in their proper place" },
  { index: 9, uid: "0x63cd", resultGroup: 2, direction: 1, text: "I follow a schedule" },

  // Extraversion (E) - ResultGroup 3
  { index: 10, uid: "0x4f6a", resultGroup: 3, direction: 1, text: "I am the life of the party" },
  { index: 11, uid: "0x4f6f", resultGroup: 3, direction: -1, text: "I don't talk a lot" },
  { index: 12, uid: "0x4f75", resultGroup: 3, direction: 1, text: "I feel comfortable around people" },
  { index: 13, uid: "0x4f7a", resultGroup: 3, direction: -1, text: "I keep in the background" },
  { index: 14, uid: "0x63b0", resultGroup: 3, direction: 1, text: "I start conversations" },

  // Agreeableness (A) - ResultGroup 4
  { index: 15, uid: "0x4f76", resultGroup: 4, direction: -1, text: "I insult people" },
  { index: 16, uid: "0x4f7b", resultGroup: 4, direction: 1, text: "I sympathize with others' feelings" },
  { index: 17, uid: "0x63ce", resultGroup: 4, direction: 1, text: "I feel others' emotions" },
  { index: 18, uid: "0x63c9", resultGroup: 4, direction: 1, text: "I make people feel at ease" },
  { index: 19, uid: "0x63b1", resultGroup: 4, direction: -1, text: "I am not interested in other people's problems" },

  // Neuroticism (N) - ResultGroup 5
  { index: 20, uid: "0x63c3", resultGroup: 5, direction: 1, text: "I have frequent mood swings" },
  { index: 21, uid: "0x4f72", resultGroup: 5, direction: -1, text: "I am relaxed most of the time" },
  { index: 22, uid: "0x4f78", resultGroup: 5, direction: 1, text: "I worry about things" },
  { index: 23, uid: "0x4f7d", resultGroup: 5, direction: -1, text: "I seldom feel blue" },
  { index: 24, uid: "0x63b4", resultGroup: 5, direction: 1, text: "I am easily disturbed" },

  // Machiavellianism (X) - ResultGroup 6
  { index: 25, uid: "0xdbb37", resultGroup: 6, direction: 1, text: "It’s not wise to tell your secrets" },
  { index: 26, uid: "0xdbb39", resultGroup: 6, direction: 1, text: "Whatever it takes, you must get the important people on your side" },
  { index: 27, uid: "0xdbb3a", resultGroup: 6, direction: 1, text: "Avoid direct conflict with others because they may be useful in the future" },
  { index: 28, uid: "0xdbb3f", resultGroup: 6, direction: 1, text: "Most people can be manipulated" },
  { index: 29, uid: "0xdbb3c", resultGroup: 6, direction: 1, text: "You should wait for the right time to get back at people" },

  // Narcissism (Y) - ResultGroup 7
  { index: 30, uid: "0xdbb43", resultGroup: 7, direction: 1, text: "I like to get to know important people" },
  { index: 31, uid: "0xdbb40", resultGroup: 7, direction: 1, text: "People see me as a natural leader" },
  { index: 32, uid: "0x63c0", resultGroup: 7, direction: -1, text: "I don't like to draw attention to myself" },
  { index: 33, uid: "0xdbb46", resultGroup: 7, direction: -1, text: "I am an average person" },
  { index: 34, uid: "0xdbb47", resultGroup: 7, direction: 1, text: "I insist on getting the respect I deserve" },

  // Psychopathy (Z) - ResultGroup 8
  { index: 35, uid: "0xdbb4f", resultGroup: 8, direction: 1, text: "I enjoy having sex with people I hardly know" },
  { index: 36, uid: "0xdbb4d", resultGroup: 8, direction: 1, text: "People who mess with me always regret it" },
  { index: 37, uid: "0xdbb48", resultGroup: 8, direction: 1, text: "I like to get revenge on authorities" },
  { index: 38, uid: "0xdbb49", resultGroup: 8, direction: -1, text: "I avoid dangerous situations" },
  { index: 39, uid: "0xdbb50", resultGroup: 8, direction: 1, text: "I’ll say anything to get what I want" },

  // Emotional Reappraisal (Er) - ResultGroup 9
  { index: 40, uid: "0xdbaae", resultGroup: 9, direction: 1, text: "When I want to feel more positive emotion (such as joy or amusement), I change what I’m thinking about" },
  { index: 41, uid: "0xdbab0", resultGroup: 9, direction: 1, text: "When I want to feel less negative emotion (such as sadness or anger), I change what I’m thinking about" },
  { index: 42, uid: "0xdbab2", resultGroup: 9, direction: 1, text: "When I’m faced with a stressful situation, I make myself think about it in a way that helps me stay calm" },
  { index: 43, uid: "0xdbab4", resultGroup: 9, direction: 1, text: "I control my emotions by changing the way I think about the situation I’m in" },

  // Suppression Tendency (St) - ResultGroup 10
  { index: 44, uid: "0xdbab5", resultGroup: 10, direction: 1, text: "I keep my emotions to myself" },
  { index: 45, uid: "0xdbab3", resultGroup: 10, direction: 1, text: "When I am feeling positive emotions, I am careful not to express them" },
  { index: 46, uid: "0xdbab1", resultGroup: 10, direction: 1, text: "I control my emotions by not expressing them" },
  { index: 47, uid: "0xdbaaf", resultGroup: 10, direction: 1, text: "When I am feeling negative emotions, I make sure not to express them" },

  // Mortality Concern (M) - ResultGroup 11
  { index: 48, uid: "0xdba6d", resultGroup: 11, direction: 1, text: "The thought of my own death frightens me" },
  { index: 49, uid: "0xdba6e", resultGroup: 11, direction: 1, text: "My mortality troubles me" },
  { index: 50, uid: "0xdba6f", resultGroup: 11, direction: 1, text: "Never feeling anything again after I die upsets me" },
  { index: 51, uid: "0xdba70", resultGroup: 11, direction: 1, text: "I am scared that death will be the end of \"me\"" },

  // Life Satisfaction (Ls) - ResultGroup 12
  { index: 52, uid: "0xdba6b", resultGroup: 12, direction: 1, text: "All things considered, I am very satisfied with my life as a whole these days" },

  // ===== VALUES =====

  // Care (Ca) - ResultGroup 13
  { index: 53, uid: "0x2dae0", resultGroup: 13, direction: 1, text: "It can never be right to kill a human being" },
  { index: 54, uid: "0x2d9c8", resultGroup: 13, direction: 1, text: "There are few things worse than hurting a defenceless animal" },
  { index: 55, uid: "0x2d9c7", resultGroup: 13, direction: 1, text: "Compassion for those who are suffering is the most important virtue" },

  // Fairness (F) - ResultGroup 14
  { index: 56, uid: "0x2d9cb", resultGroup: 14, direction: 1, text: "When governments make laws, the number one principle should be ensuring everyone is treated fairly" },
  { index: 57, uid: "0x2dada", resultGroup: 14, direction: 1, text: "It is morally wrong that rich kids inherit a lot of money while poor children inherit nothing" },
  { index: 58, uid: "0x2d9ca", resultGroup: 14, direction: 1, text: "Justice is the most important requirement for society" },

  // Loyalty (L) - ResultGroup 15
  { index: 59, uid: "0x2dade", resultGroup: 15, direction: 1, text: "If I were a soldier and disagreed with my commanding officer's orders, I would obey anyway because that is my duty" },
  { index: 60, uid: "0x2dad6", resultGroup: 15, direction: 1, text: "You should always be loyal to your family, regardless of what they have done" },
  { index: 61, uid: "0x2d9cf", resultGroup: 15, direction: 1, text: "I am proud of my country’s history" },

  // Authority (Au) - ResultGroup 16
  { index: 62, uid: "0x2dadc", resultGroup: 16, direction: 1, text: "It is more important to be a team player than to express oneself" },
  { index: 63, uid: "0x2d9ce", resultGroup: 16, direction: 1, text: "Men and women each have different roles to play in society" },
  { index: 64, uid: "0x2d9cd", resultGroup: 16, direction: 1, text: "Children need to learn respect for authority" },

  // Purity (P) - ResultGroup 17
  { index: 65, uid: "0x2dadb", resultGroup: 17, direction: 1, text: "Chastity is an important and valuable virtue" },
  { index: 66, uid: "0x2dad8", resultGroup: 17, direction: 1, text: "Some acts are wrong because they are unnatural" },
  { index: 67, uid: "0x2dad7", resultGroup: 17, direction: 1, text: "You should not do things that are disgusting, even if no one is harmed" },

  // Family (Fa) - ResultGroup 18
  { index: 68, uid: "0x2ffd", resultGroup: 18, direction: 1, text: "People should be willing to do anything to help a member of their family" },
  { index: 69, uid: "0x3000", resultGroup: 18, direction: 1, text: "You should always be loyal to your family" },
  { index: 70, uid: "0x3001", resultGroup: 18, direction: 1, text: "You should always put the interests of your family first" },

  // Group (G) - ResultGroup 19
  { index: 71, uid: "0x3002", resultGroup: 19, direction: 1, text: "People have an obligation to help members of their community" },
  { index: 72, uid: "0x3003", resultGroup: 19, direction: 1, text: "It's important for individuals to play an active role in their communities" },
  { index: 73, uid: "0x3004", resultGroup: 19, direction: 1, text: "You should try to be a useful member of society" },

  // Reciprocity (Re) - ResultGroup 20
  { index: 74, uid: "0x3005", resultGroup: 20, direction: 1, text: "You have an obligation to help those who have helped you" },
  { index: 75, uid: "0x3006", resultGroup: 20, direction: 1, text: "You should always make amends for the things you have done wrong" },
  { index: 76, uid: "0x3007", resultGroup: 20, direction: 1, text: "You should always return a favour if you can" },

  // Heroism (H) - ResultGroup 21
  { index: 77, uid: "0x3008", resultGroup: 21, direction: 1, text: "Courage in the face of adversity is the most admirable trait" },
  { index: 78, uid: "0x3009", resultGroup: 21, direction: 1, text: "Society should do more to honour its heroes" },
  { index: 79, uid: "0x300a", resultGroup: 21, direction: 1, text: "To be willing to lay down your life for your country is the height of bravery" },

  // Deference (D) - ResultGroup 22
  { index: 80, uid: "0x300b", resultGroup: 22, direction: 1, text: "People should always defer to their superiors" },
  { index: 81, uid: "0x300c", resultGroup: 22, direction: 1, text: "Society would be better if people were more obedient to authority" },
  { index: 82, uid: "0x300d", resultGroup: 22, direction: 1, text: "You should respect people who are older than you" },

  // Equity (Eq) - ResultGroup 23
  { index: 83, uid: "0x300e", resultGroup: 23, direction: 1, text: "Everyone should be treated the same" },
  { index: 84, uid: "0x300f", resultGroup: 23, direction: 1, text: "Everyone's rights are equally important" },
  { index: 85, uid: "0x3010", resultGroup: 23, direction: 1, text: "The current levels of inequality in society are unfair" },

  // Property (Pr) - ResultGroup 24
  { index: 86, uid: "0x3011", resultGroup: 24, direction: -1, text: "It’s acceptable to steal food if you are starving" },
  { index: 87, uid: "0x3012", resultGroup: 24, direction: -1, text: "It’s ok to keep valuable items that you find, rather than try to locate the rightful owner" },
  { index: 88, uid: "0x3013", resultGroup: 24, direction: -1, text: "Sometimes you are entitled to take things you need from other people" },

  // Power (Po) - ResultGroup 25
  { index: 89, uid: "0xdba88", resultGroup: 25, direction: 1, text: "It is important to me to be rich: I want to have a lot of money and expensive things" },
  { index: 90, uid: "0xdba97", resultGroup: 25, direction: 1, text: "It is important to me to get respect from others: I want people to do what I say" },

  // Achievement (Ac) - ResultGroup 26
  { index: 91, uid: "0xdba8a", resultGroup: 26, direction: 1, text: "It's important to me to show my abilities: I want people to admire what I do" },
  { index: 92, uid: "0xdba93", resultGroup: 26, direction: 1, text: "Being very successful is important to me: I hope people will recognize my achievements" },

  // Hedonism (He) - ResultGroup 27
  { index: 93, uid: "0xdba9b", resultGroup: 27, direction: 1, text: "I seek every chance I can to have fun: it is important to me to do things that give me pleasure" },
  { index: 94, uid: "0xdba90", resultGroup: 27, direction: 1, text: "Having a good time is important to me: I like to “spoil” myself" },

  // Stimulation (Stim) - ResultGroup 28
  { index: 95, uid: "0xdba8c", resultGroup: 28, direction: 1, text: "I like surprises and am always looking for new things to do: I think it is important to do lots of different things in life" },
  { index: 96, uid: "0xdba95", resultGroup: 28, direction: 1, text: "I look for adventures and like to take risks: I want to have an exciting life" },

  // Self-Direction (Sd) - ResultGroup 29
  { index: 97, uid: "0xdba86", resultGroup: 29, direction: 1, text: "Thinking up new ideas and being creative is important to me: I like to do things in my own original way" },
  { index: 98, uid: "0xdba91", resultGroup: 29, direction: 1, text: "It is important to me to make my own decisions about what I do: I like to be free to plan and not depend on others" },

  // Universalism (U) - ResultGroup 30
  { index: 99, uid: "0xdba89", resultGroup: 30, direction: 1, text: "I think it is important that every person in the world be treated equally: I believe everyone should have equal opportunities in life" },
  { index: 100, uid: "0xdba99", resultGroup: 30, direction: 1, text: "I strongly believe that people should care for nature: looking after the environment is important to me." },
  { index: 101, uid: "0xdba8e", resultGroup: 30, direction: 1, text: "It is important to me to listen to people who are different from me: even when I disagree with them, I still want to understand them" },

  // Benevolence (B) - ResultGroup 31
  { index: 102, uid: "0xdba92", resultGroup: 31, direction: 1, text: "It's very important to me to help the people around me: I want to care for their well-being" },
  { index: 103, uid: "0xdba98", resultGroup: 31, direction: 1, text: "It is important to me to be loyal to my friends: I want to devote myself to people close to me" },

  // Conformity (Co) - ResultGroup 32
  { index: 104, uid: "0xdba96", resultGroup: 32, direction: 1, text: "It is important to me always to behave properly: I want to avoid doing anything people would say is wrong" },
  { index: 105, uid: "0xdba8d", resultGroup: 32, direction: 1, text: "I believe that people should do what they're told: I think people should follow rules at all times, even when no-one is watching" },

  // Tradition (T) - ResultGroup 33
  { index: 106, uid: "0xdba8f", resultGroup: 33, direction: 1, text: "It is important to me to be humble and modest: I try not to draw attention to myself" },
  { index: 107, uid: "0xdba9a", resultGroup: 33, direction: 1, text: "Tradition is important to me: I try to follow the customs handed down by my religion or my family" },

  // Security (S) - ResultGroup 34
  { index: 108, uid: "0xdba8b", resultGroup: 34, direction: 1, text: "It is important to me to live in secure surroundings: I avoid anything that might endanger my safety" },
  { index: 109, uid: "0xdba94", resultGroup: 34, direction: 1, text: "It is important to me that the government insure my safety against all threats: I want the state to be strong so it can defend its citizens" },

  // Social Dominance (Sdo) - ResultGroup 35
  { index: 110, uid: "0xdba72", resultGroup: 35, direction: 1, text: "An ideal society requires some groups to be on top and others to be on the bottom" },
  { index: 111, uid: "0xdba73", resultGroup: 35, direction: 1, text: "Some groups of people are simply inferior to other groups" },
  { index: 112, uid: "0x5ff6c", resultGroup: 35, direction: -1, text: "No one group should dominate in society" },
  { index: 113, uid: "0xdba74", resultGroup: 35, direction: -1, text: "Groups at the bottom of society are just as deserving as groups at the top" },
  { index: 114, uid: "0xdba75", resultGroup: 35, direction: 1, text: "Group equality in society should not be our primary goal" },
  { index: 115, uid: "0xdba76", resultGroup: 35, direction: 1, text: "It is unjust to try to make social groups equal" },
  { index: 116, uid: "0x66d73", resultGroup: 35, direction: -1, text: "We should strive to make all groups equal in society" },
  { index: 117, uid: "0xdba77", resultGroup: 35, direction: -1, text: "We should work to give all groups an equal chance to succeed" },

  // Authoritarianism (Aut) - ResultGroup 36
  { index: 118, uid: "0xdba7c", resultGroup: 36, direction: -1, text: "It is better for a child to be considerate rather than well-behaved" },
  { index: 119, uid: "0xdba7b", resultGroup: 36, direction: 1, text: "It is better for a child to be obedient rather than self-reliant" },
  { index: 120, uid: "0xdba7a", resultGroup: 36, direction: -1, text: "It is better for a child to be curious rather than well-mannered" },
  { index: 121, uid: "0xdba79", resultGroup: 36, direction: 1, text: "It is better for a child to be respectful rather than independent" },

  // ===== META-THINKING =====

  // Dogmatism (Do) - ResultGroup 37
  { index: 122, uid: "0xdba85", resultGroup: 37, direction: -1, text: "There are often many different acceptable ways to solve a problem" },
  { index: 123, uid: "0xdba84", resultGroup: 37, direction: 1, text: "People who disagree with me are usually wrong" },
  { index: 124, uid: "0xdba83", resultGroup: 37, direction: -1, text: "Different points of views should be encouraged" },
  { index: 125, uid: "0xdba82", resultGroup: 37, direction: 1, text: "I am pretty ‘‘set in my ways\"" },
  { index: 126, uid: "0xdba81", resultGroup: 37, direction: 1, text: "There is a single correct way to do most things" },
  { index: 127, uid: "0xdba80", resultGroup: 37, direction: -1, text: "Having multiple perspectives on an issue is usually desirable" },

  // Need for Cognition (Nfc) - ResultGroup 38
  { index: 128, uid: "0xdbaaa", resultGroup: 38, direction: -1, text: "I feel relief rather than satisfaction after completing a task that required a lot of mental effort" },
  { index: 129, uid: "0xdbaa9", resultGroup: 38, direction: 1, text: "The notion of thinking abstractly is appealing to me" },
  { index: 130, uid: "0xdbaa8", resultGroup: 38, direction: -1, text: "It’s enough for me that something gets the job done; I don’t care how or why it works" },
  { index: 131, uid: "0xdbaa7", resultGroup: 38, direction: 1, text: "The idea of relying on thought to make my way to the top appeals to me" },
  { index: 132, uid: "0xdbaa6", resultGroup: 38, direction: -1, text: "I prefer to think about small, daily projects to long-term ones" },
  { index: 133, uid: "0xdbaa5", resultGroup: 38, direction: 1, text: "I really enjoy a task that involves coming up with new solutions to problems" },
  { index: 134, uid: "0xdbaa4", resultGroup: 38, direction: -1, text: "I only think as hard as I have to" },
  { index: 135, uid: "0xdbaa3", resultGroup: 38, direction: 1, text: "I prefer complex to simple problems" },

  // Intolerance for Uncertainty (Ic) - ResultGroup 39
  { index: 136, uid: "0xdbab7", resultGroup: 39, direction: 1, text: "Unforeseen events upset me greatly" },
  { index: 137, uid: "0xdbab9", resultGroup: 39, direction: 1, text: "It frustrates me not having all the information I need" },
  { index: 138, uid: "0xdbabb", resultGroup: 39, direction: 1, text: "I always want to know what the future has in store for me" },
  { index: 139, uid: "0xdbabc", resultGroup: 39, direction: 1, text: "The smallest doubt can stop me from acting" },
  { index: 140, uid: "0xdbaba", resultGroup: 39, direction: 1, text: "I must get away from all uncertain situations" },
  { index: 141, uid: "0xdbab8", resultGroup: 39, direction: 1, text: "Uncertainty keeps me from living a full life" },

  // Intellectual Humility (Ih) - ResultGroup 40
  { index: 142, uid: "0xdbb2b", resultGroup: 40, direction: -1, text: "When I am really confident in a belief, there is very little chance that belief is wrong" },
  { index: 143, uid: "0xdbb2d", resultGroup: 40, direction: -1, text: "I’d rather rely on my own knowledge about most topics than turn to others for expertise" },
  { index: 144, uid: "0xdbb35", resultGroup: 40, direction: -1, text: "On important topics, I am not likely to be swayed by the viewpoints of others" },
  { index: 145, uid: "0xdbb2e", resultGroup: 40, direction: 1, text: "I have at times changed opinions that were important to me, when someone showed me I was wrong" },
  { index: 146, uid: "0xdbb31", resultGroup: 40, direction: 1, text: "I am open to revising my important beliefs in the face of new information" },
  { index: 147, uid: "0xdbb34", resultGroup: 40, direction: 1, text: "I’m willing to change my mind once it’s made up about an important topic" },
  { index: 148, uid: "0xdbb2f", resultGroup: 40, direction: 1, text: "I respect that there are ways of making important decisions that are different from the way I make decisions" },
  { index: 149, uid: "0xdbb33", resultGroup: 40, direction: 1, text: "I can have great respect for someone, even when we don't see eye-to-eye on important topics" },
  { index: 150, uid: "0xdbb32", resultGroup: 40, direction: -1, text: "When someone contradicts my most important beliefs, it feels like a personal attack" },
  { index: 151, uid: "0xdbb30", resultGroup: 40, direction: -1, text: "I tend to feel threatened when others disagree with me on topics that are close to my heart" },
  { index: 152, uid: "0xdbb2c", resultGroup: 40, direction: -1, text: "I feel small when others disagree with me on topics that are close to my heart" },

  // Anthropomorphism (Atm) - ResultGroup 41
  { index: 153, uid: "0xdba5f", resultGroup: 41, direction: 1, text: "The environment experiences emotion" },
  { index: 154, uid: "0xdba5e", resultGroup: 41, direction: 1, text: "The ocean has consciousness" },
  { index: 155, uid: "0xdba5d", resultGroup: 41, direction: 1, text: "A car has free will" },
  { index: 156, uid: "0xdba5c", resultGroup: 41, direction: 1, text: "Cows have intentions" },
  { index: 157, uid: "0xdba5a", resultGroup: 41, direction: 1, text: "Robots are conscious" },
  { index: 158, uid: "0xdba59", resultGroup: 41, direction: 1, text: "Fish have free will" },

  // Teleology (Te) - ResultGroup 42
  { index: 159, uid: "0xdba6a", resultGroup: 42, direction: 1, text: "Earthquakes happen because tectonic plates must realign" },
  { index: 160, uid: "0xdba69", resultGroup: 42, direction: 1, text: "The earth has an ozone layer to protect it from UV light" },
  { index: 161, uid: "0xdba68", resultGroup: 42, direction: 1, text: "The sun makes light so that plants can photosynthesize" },
  { index: 162, uid: "0xdba67", resultGroup: 42, direction: 1, text: "Earthworms tunnel underground to aerate the soil" },
  { index: 163, uid: "0xdba65", resultGroup: 42, direction: 1, text: "Mites live on skin to consume dead skin cells" },

  // Subjective Numeracy (Sn) - ResultGroup 43
  { index: 164, uid: "0xdbb54", resultGroup: 43, direction: 1, text: "I find working with fractions easy" },
  { index: 165, uid: "0xdbb55", resultGroup: 43, direction: 1, text: "I find it easy to calculate when something is 25% off" },
  { index: 166, uid: "0xdbb56", resultGroup: 43, direction: -1, text: "When people tell me the chance of something happening, I prefer they use words (\"it rarely happens\") rather than numbers (\"there's a 1% chance\")" },
  { index: 167, uid: "0xdbb57", resultGroup: 43, direction: 1, text: "When I hear a weather forecast, I prefer predictions using percentages (\"there's a 20% chance of rain\") to words (\"there's a small chance of rain\")" },

  // Just World (Jw) - ResultGroup 44
  { index: 168, uid: "0x10004b", resultGroup: 44, direction: -1, text: "The political system is unfair and cannot be trusted" },
  { index: 169, uid: "0x10004a", resultGroup: 44, direction: 1, text: "In general, relations between men and women are fair" },
  { index: 170, uid: "0x100048", resultGroup: 44, direction: 1, text: "People generally get the outcome they deserve" },
  { index: 171, uid: "0x100047", resultGroup: 44, direction: 1, text: "Most government policies serve the greater good" },
  { index: 172, uid: "0x100046", resultGroup: 44, direction: 1, text: "People generally earn the rewards and punishments they get in this world" },
  { index: 173, uid: "0x100045", resultGroup: 44, direction: 1, text: "Everyone has a fair shot at wealth and happiness" },
  { index: 174, uid: "0xdbb64", resultGroup: 44, direction: -1, text: "There is one law for the rich and one for the poor" },

  // Alive (PWa) - ResultGroup 45
  { index: 175, uid: "0x100050", resultGroup: 45, direction: 1, text: "The world is alive (rather than mechanistic)" },

  // Enticing (PWe) - ResultGroup 46
  { index: 176, uid: "0x10004f", resultGroup: 46, direction: 1, text: "The world is an enticing place" },

  // Safe (PWs) - ResultGroup 47
  { index: 177, uid: "0x10004e", resultGroup: 47, direction: 1, text: "The world is, by and large, a safe place" },

  // Good (PWg) - ResultGroup 48
  { index: 178, uid: "0x10004d", resultGroup: 48, direction: 1, text: "The world is a good place" },
];
