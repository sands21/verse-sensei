// Per-character greeting + prompt pools for the empty state (preview, no DB).
// In the real app these live in characters.persona_config. Sampled each new chat
// for variety (anti-staleness). "{user}" is replaced with the user's name.
// Naruto (featured) gets the full set; others are lighter. See CLAUDE.md §5.

export type Mode = "EXPLAIN" | "HYPE ME" | "JUST TALK";
export const MODES: Mode[] = ["EXPLAIN", "HYPE ME", "JUST TALK"];

export interface Persona {
  greetings: string[];
  prompts: Record<Mode, string[]>;
}

const NARUTO: Persona = {
  greetings: [
    "*grins* You came to the right ninja, {user}! What do you wanna figure out today, dattebayo?",
    "Believe it! Ask me anything — we'll crack it together.",
    "*cracks knuckles* Alright {user}, what's on your mind? No giving up here!",
    "Hey, glad you showed up! What are we learning today?",
    "*points at you* You and me — let's tackle something big, dattebayo!",
    "Ready when you are! The hardest questions are the most fun.",
  ],
  prompts: {
    EXPLAIN: [
      "Explain quantum computing like chakra control",
      "Break down compound interest like a training arc",
      "What's entropy? Use a ramen analogy",
      "Explain recursion like shadow clones",
      "Teach me probability through festival games",
      "How does the internet work? Keep it simple",
      "Explain black holes like a Rasengan",
      "What is machine learning, ninja-style?",
    ],
    "HYPE ME": [
      "I want to give up on something — talk me out of it",
      "Give me a pep talk before my exam",
      "How do you keep going when you're losing?",
      "Hype me up to start over",
      "Remind me why effort beats talent",
      "I'm scared to try — help me",
      "Why keep training when it's this hard?",
      "Tell me I can do this",
    ],
    "JUST TALK": [
      "What's your best ramen order?",
      "Who'd win: you or Sasuke, honestly?",
      "Tell me about your worst mission",
      "What do you do on a day off?",
      "Describe your dream as Hokage",
      "Got any advice for making friends?",
      "What's your favorite jutsu and why?",
      "What did Iruka-sensei teach you?",
    ],
  },
};

const lite = (
  greetings: string[],
  explain: string[],
  hype: string[],
  talk: string[]
): Persona => ({
  greetings,
  prompts: { EXPLAIN: explain, "HYPE ME": hype, "JUST TALK": talk },
});

const PERSONAS: Record<string, Persona> = {
  Naruto: NARUTO,
  Sasuke: lite(
    ["*looks over* ...Fine. Ask. I don't have all day.", "What do you want to know?"],
    ["Explain game theory like a rivalry", "Break down strategy like a battle plan", "What makes a system fragile?"],
    ["I keep losing to someone better — what do I do?", "How do you train alone?", "Is revenge ever worth it?"],
    ["Why did you leave the village?", "Do you regret anything?", "What's worth protecting?"]
  ),
  Luffy: lite(
    ["*laughing* Yo! You look interesting. Whatcha wanna know?", "Hungry? Me too. Ask me stuff!"],
    ["Explain supply and demand with meat", "What's freedom, economically?", "How do crews — I mean teams — work?"],
    ["I'm scared of the unknown — help", "How do you chase a huge dream?", "Pump me up to set sail"],
    ["What's the best thing you've eaten?", "Who's your favorite crewmate?", "What's at the end of the journey?"]
  ),
  Gojo: lite(
    ["*lifts blindfold* Lucky you — the strongest's got time. Ask away.", "Hm? Go on, ask me something hard."],
    ["Explain infinity like Limitless", "What's a paradox, really?", "Break down exponential growth"],
    ["Everyone's better than me — help", "How do you carry pressure?", "Talk me through a comeback"],
    ["Why do you wear the blindfold?", "Is being the strongest lonely?", "Best way to teach someone?"]
  ),
  Tanjiro: lite(
    ["*warm smile* Hello! I'd be glad to help. What's on your mind?", "Take your time — what would you like to know?"],
    ["Explain how the brain smells things", "What's resilience, scientifically?", "How does breathing affect focus?"],
    ["I feel like giving up — please help", "How do you stay kind when it's hard?", "Encourage me to keep going"],
    ["How's your sister doing?", "What keeps you so calm?", "What smells like a good day?"]
  ),
  Eren: lite(
    ["...You're here. Good. Ask what you came to ask.", "What do you want to understand?"],
    ["Explain how walls (and systems) fail", "What is determinism?", "Break down cause and effect"],
    ["I feel trapped — what do I do?", "How do you keep moving forward?", "Tell me freedom is worth it"],
    ["What does freedom mean to you?", "Would you do it all again?", "What's beyond the walls?"]
  ),
};

const GENERIC: Persona = lite(
  ["Hey! Good to see you. What do you want to get into?", "Ask me anything — let's dig in."],
  ["Explain a hard idea simply", "Break down something complex", "Teach me something new"],
  ["I need some motivation", "Talk me out of giving up", "Hype me up"],
  ["Tell me about yourself", "What matters most to you?", "Got any advice?"]
);

export const personaFor = (name: string): Persona => PERSONAS[name] ?? GENERIC;

export function sample<T>(arr: T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
