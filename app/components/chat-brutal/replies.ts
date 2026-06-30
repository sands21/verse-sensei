// Canned replies for the semi-interactive preview (no LLM). Tapped prompts are
// fixed, so each is paired with a genuinely on-topic, in-voice answer. Free-typed
// messages fall back to a sampled in-voice pool (written to work for anything).
// Naruto (featured) is fully covered; others use lighter pools. See CLAUDE.md §5.

import { sample } from "./persona";

// Prompt text → tailored Naruto answer. Keys match persona.ts prompts exactly.
const TAILORED: Record<string, string> = {
  // EXPLAIN
  "Explain quantum computing like chakra control":
    "*scratches head* Okay, listen up! Think of **quantum superposition** like shadow clones:\n- each clone is a possible state\n- they all exist at once\n- the moment you *look*, only one stays\n\nIt's basically `kage bunshin` for particles, dattebayo!",
  "Break down compound interest like a training arc":
    "*grins* It's the ultimate training arc! Your gains earn **their own gains** — like getting stronger from the strength you already built. Skip a day and the curve still climbs without you. Start early, never quit!",
  "What's entropy? Use a ramen analogy":
    "Picture a fresh bowl of ramen — noodles neat, broth hot. Leave it and it *always* gets messier and colder, never tidier on its own. That's **entropy**: stuff drifts toward disorder. You gotta put in chakra — energy — to keep things in order!",
  "Explain recursion like shadow clones":
    "Easy! A shadow clone that makes *its own* shadow clone, that makes another... each one does a smaller piece until the last one finishes and they all *poof* back with the answer. That's **recursion** — a jutsu that calls itself, dattebayo!",
  "Teach me probability through festival games":
    "At the festival, the ring toss *looks* easy but the odds are stacked! **Probability** is just counting your real chances: 3 winning pegs out of 30 means a 1-in-10 shot. Know the odds before you spend your coins, believe it!",
  "How does the internet work? Keep it simple":
    "It's a giant network of messenger ninja! Your request gets split into little scrolls, each finds the fastest route to the right village (server), and they all arrive and get pieced back together. Super fast teamwork!",
  "Explain black holes like a Rasengan":
    "*spins a Rasengan* Imagine this, but with gravity SO dense not even light escapes the spin. A **black hole** crushes everything past a line called the event horizon — cross it and there's no coming back. Wild, huh?",
  "What is machine learning, ninja-style?":
    "It's training, plain and simple! You show it tons of examples and it learns the pattern:\n```\nfor each try:\n  attempt -> fail -> adjust\n```\nFeed it enough data and *boom* — it gets sharper every round. Never give up on it!",

  // HYPE ME
  "I want to give up on something — talk me out of it":
    "*grabs your shoulders* Hey — quitting now means the pain you already took counts for NOTHING. You don't stop when it's hard, you stop when it's DONE. One more try. I believe in you, dattebayo!",
  "Give me a pep talk before my exam":
    "Listen! You trained for this — every late night was a rep. Walk in there like it's *your* arena. Breathe, read twice, and give it everything. You've got this, believe it!",
  "How do you keep going when you're losing?":
    "*wipes blood off* Losing just means the fight's not over. Every time I hit the dirt, I learned the move that beat me. Get up one more time than you fall — that's the whole secret.",
  "Hype me up to start over":
    "Starting over isn't going back — it's going in *stronger*. You know the road now! *fires up* Fresh start, same fire. Let's GO!",
  "Remind me why effort beats talent":
    "Talent's a head start, but effort's the whole marathon. I was the dead-last loser of my class — I caught up by **never quitting**. Hard work beats genius that gives up, every time!",
  "I'm scared to try — help me":
    "*nods* Being scared means it matters. I was terrified too — I just decided being a coward scared me more. Take one small step. I'm right here with you.",
  "Why keep training when it's this hard?":
    "Because 'this hard' is exactly where you grow! The wall in front of you? Everyone else turned back at it. Push through and you'll be standing somewhere almost nobody reaches.",
  "Tell me I can do this":
    "You can do this. *points at you* No 'maybe', no 'I think' — I KNOW it. Now go prove me right, dattebayo!",

  // JUST TALK
  "What's your best ramen order?":
    "*eyes sparkle* Miso ramen at Ichiraku, extra chashu, extra everything! Old Man Teuchi knows my order by heart. Best meal in any village, no contest!",
  "Who'd win: you or Sasuke, honestly?":
    "*laughs* Depends on the day! We've gone toe-to-toe more times than I can count. He's a genius... but I never, EVER stay down. Call it a rivalry for the ages.",
  "Tell me about your worst mission":
    "*sighs* The one where I couldn't save everyone in time. It taught me strength isn't just power — it's being there for people. I carry that one every day.",
  "What do you do on a day off?":
    "Ramen, training, pranks, more ramen! And visiting the people who matter. A day off's no good if you spend it alone, dattebayo.",
  "Describe your dream as Hokage":
    "*stands tall* To protect every single person in the village — so nobody's ever ignored like I was as a kid. When I'm Hokage, you'll ALL acknowledge me!",
  "Got any advice for making friends?":
    "Be the first to reach out, even when it's scary. The friends I fought hardest to reach became the ones I'd never let go. Don't give up on people!",
  "What's your favorite jutsu and why?":
    "The Rasengan! *spins one up* Pure shape and chakra control — no hand signs, all heart. Pervy Sage taught me, so it means a lot more than just power.",
  "What did Iruka-sensei teach you?":
    "That one person believing in you changes everything. Iruka-sensei saw *me* when nobody else did. Now I try to be that person for someone else.",
};

// Free-text reply pools — sampled for typed messages (and untailored prompts).
const FREE_POOL: Record<string, string[]> = {
  Naruto: [
    "*grins* Good question! Believe it — let's break it down together, dattebayo.",
    "Hah, I like how you think! Here's how I'd tackle it: head-on, full effort, no backing down.",
    "*cracks knuckles* Alright! The trick is to keep it simple and never give up halfway.",
    "Oh, I've got thoughts on that! The way I see it, the hard road is usually the right one.",
    "*nods* Solid one. Whatever it is, you push a little past where it hurts — that's where it clicks.",
    "Believe it! Big questions just need a stubborn answer. Let's go at it together.",
  ],
  Sasuke: [
    "*looks away* Hn. If you want it, you take it. Nothing's handed to you.",
    "Strength is a choice you make every morning. Make it.",
    "...Fine. The answer's simpler than you're making it. Stop hesitating.",
  ],
  Luffy: [
    "*laughs* Who cares about the rules?! Do what feels right and figure it out!",
    "Sounds fun! If it scares you a little, that means it's worth doing!",
    "Eh, I don't think too hard — I just go for it. You should too!",
  ],
};

const GENERIC_POOL = [
  "Good question. Let's think it through together.",
  "Here's how I'd look at it — keep it simple and start where you are.",
  "Hm. Worth doing properly. Let's break it down.",
];

export function replyFor(character: string, text: string): string {
  const tailored = TAILORED[text];
  if (character === "Naruto" && tailored) return tailored;
  const pool = FREE_POOL[character] ?? GENERIC_POOL;
  return sample(pool, 1)[0];
}
