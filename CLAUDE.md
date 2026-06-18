# Verse Sensei

> Chat with anime characters who stay true to their personality — and learn the way your heroes would explain the world.

This file is the durable context for the project: what it is, what it's trying to solve, how it's built, and the design system we're standardizing on. Keep it current as decisions are made.

---

## 1. The product

**One-liner:** Pick any anime universe, pick any character (hero or villain), and have a real, in-voice conversation with them — for fun, motivation, or to understand complex ideas through their perspective.

**The deeper bet ("learn from your heroes"):** People are already emotionally drawn to certain characters. That attachment is an underused learning channel. If Naruto explains perseverance, or Goku explains pushing past limits, it lands differently than a generic tutorial. The product turns parasocial attachment into a way to *think differently* about ideas — complex topics, explained in a voice you already trust and enjoy.

**Positioning:** Not a generic AI chatbot with a skin. The persona *is* the product. Every design and engineering decision should reinforce "this feels like talking to the real character," not "this is ChatGPT with anime branding."

**Target users:** Anime fans (teens–young adults) who want something more playful and personal than a stock assistant; secondarily, curious people who learn better through story and character than through lectures.

### Current universes & characters
Naruto, One Piece, Attack on Titan, Dragon Ball, Jujutsu Kaisen, Demon Slayer. Characters and personas live in the database (`characters.persona_config`), not in code. "More worlds incoming" is part of the brand promise.

---

## 2. Tech stack & architecture

- **Framework:** Next.js 15 (App Router) + React 19, TypeScript, `--turbopack`.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) + a large `app/globals.css` with CSS custom properties. `framer-motion` for animation. `lucide-react` icons. `cn()` helper (`clsx` + `tailwind-merge`) in `lib/utils.ts`.
- **Auth + DB:** Supabase (`@supabase/supabase-js`). Email/password, magic link (OTP/PKCE), and Google OAuth. OAuth/email-link returns are funneled through `/auth/callback` so tokens do not land on app routes like `/chat`.
- **LLM:** OpenRouter (`/api/chat`), called server-side only. Model is configurable via env.
- **Hosting:** Vercel (config in `next.config.ts`; remote image patterns for Google/Gravatar/GitHub avatars).

> Note: `package.json` is still named `"helix"` and the OpenRouter `X-Title` header says `"helix"` — leftover template identity, slated for cleanup (see Roadmap). The chat UI lives under `app/chat/v0/` (a v0.dev export that was never renamed).

### Key files
| Path | Purpose |
|---|---|
| `app/page.tsx` → `app/components/LandingPage.tsx` | Landing page (being redesigned — see §4). |
| `app/chat/page.tsx` | Auth-guarded chat route; wraps `ChatInterface`. |
| `app/chat/v0/chat-interface.tsx` | Chat orchestration: state, conversation/message persistence, calls `/api/chat`. |
| `app/chat/v0/chat-sidebar.tsx` | Conversation list, search modal, profile modal. |
| `app/chat/v0/chat-input.tsx` | Composer + universe/character picker popovers. |
| `app/chat/v0/chat-messages.tsx` | Message list + hand-rolled markdown renderer + typing indicator. |
| `app/chat/v0/chat-empty-state.tsx` | Empty-state greeting + sample prompts. |
| `app/api/chat/route.ts` | Server: verifies Supabase JWT, assembles persona system prompt, calls OpenRouter, persists AI reply. |
| `app/api/health/route.ts` | Supabase auth health check. |
| `app/auth/callback/page.tsx` | Client auth callback: exchanges Supabase PKCE code, upserts user, strips legacy token fragments, then redirects safely. |
| `app/components/AuthGuard.tsx` | Client gate; redirects to `/login?redirect=…` if no session. |
| `app/login/page.tsx`, `app/signup/page.tsx` | Auth pages (~80% duplicated — candidate for a shared hook). |
| `lib/authRedirect.ts` | Shared auth redirect helpers: internal-only redirects, auth callback URL builder, legacy token-fragment stripping. |
| `lib/supabaseClient.ts` | Anon client (browser). |
| `lib/supabaseAdmin.ts` | Service-role client (server only; guarded if key missing). |

### Database (Supabase / Postgres)
- `users` — `id`, `email` (upserted on auth).
- `universes` — `id`, `name`.
- `characters` — `id`, `name`, `universe_id`, `persona_config` (JSON: voice, intelligence level, knowledge_scope, explain_guidelines, etc.).
- `conversations` — `id`, `user_id`, `character_id`, `started_at`, `pinned`, `archived`.
- `messages` — `id`, `conversation_id`, `sender` (`user`/`ai`), `content`, `timestamp`, `user_id`.

### Persona pipeline (`/api/chat`)
1. Read `Authorization: Bearer <jwt>` → resolve `userId` (anon client `getUser(token)`).
2. Reject unauthenticated requests and messages over 4000 characters.
3. If `conversationId` is present, verify it belongs to `userId` before reading history or writing AI output.
4. Load character (`persona_config`) + universe name via the **service-role** client.
5. Load up to 20 prior messages for `conversationId` as history.
6. Build a system prompt: "You are {character} from {universe}. Roleplay strictly in first person…" + the persona profile JSON + explain-guidelines.
7. Call OpenRouter with `stream: true` (`temperature: 0.7`) and proxy chunks to the client as Server-Sent Events (`delta`, `done`, `error`).
8. Accumulate and clean the final reply server-side (e.g. remove `<|begin_of_sentence|>`), persist it to `messages`, then send the final `done` event with `{ aiMessageId, usedFallback, … }`.

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server only
OPENROUTER_API_KEY               # server only; absent → canned fallback reply
OPENROUTER_MODEL                 # model id passed to OpenRouter
```
`.env*` is gitignored, so **a fresh clone has no `.env.local`** — the app will throw `Missing NEXT_PUBLIC_SUPABASE_URL` until you recreate it (values live in the user's Vercel project → Settings → Environment Variables, or their original local clone). A skeleton `.env.local` with `REPLACE_ME` placeholders is in the repo root; fill it in, then **restart the dev server** (env is read once at startup — editing it while the server runs has no effect). This is a config issue, *not* a Supabase outage/ban and *not* a reason to migrate databases. There is no committed example file yet.

### Auth security notes
- Supabase browser auth uses `flowType: "pkce"` and `detectSessionInUrl: false` in `lib/supabaseClient.ts`; `/auth/callback` explicitly exchanges the PKCE code.
- Google OAuth, magic links, and email confirmations should redirect to `/auth/callback?redirect=…`, never directly to `/chat` or another app route. Direct app-route redirects can expose `access_token`, `refresh_token`, or `provider_token` in the URL fragment under older/implicit-style flows.
- Redirect targets must stay internal-only via `getSafeRedirect()`; do not pass raw query params into `router.replace()` or Supabase `redirectTo`.
- `/api/chat` uses the service-role client, so it must enforce auth/ownership in code before reading history or writing AI messages. Keep the `conversation.user_id === auth user id` check whenever touching that route.
- Supabase Auth URL settings should include `http://localhost:3000/auth/callback` and the production equivalent.
- If a full auth URL with tokens is shared, treat that session as compromised: sign out/revoke the Supabase session and consider revoking the Google OAuth grant.

### Commands
```
npm run dev      # next dev --turbopack
npm run build    # next build --turbopack
npm start        # next start
npm run lint     # eslint
```

---

## 3. Design system — neo-brutalist manga ("ink on paper")

**Why this style:** The source material *is* this aesthetic — manga is ink on paper: hard panel borders, gutters, halftone screentone, speech bubbles, onomatopoeia. Treating the UI as a manga page is on-concept *and* technically robust: it's high-contrast, has no gradients/glow to turn muddy, and reflows cleanly to mobile (no absolute positioning). It's also distinctive — no competitor commits to it.

**Discipline:** Brutalism here means bold + structural, not chaotic. Restraint lives in the palette (cream + ink + one red), not in the borders or shadows. Don't add a second accent color; create emphasis with the **red shadow** instead.

### Color palette
| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F3EFE4` | Primary canvas (warm cream). |
| `--paper-raised` | `#FFFFFF` | Cards, panels, raised surfaces. |
| `--ink` | `#111111` | Text, borders, primary fills. |
| `--ink-soft` | `#3A362D` | Body copy on cream. |
| `--ink-muted` | `#777268` | Secondary/caption text. |
| `--red` | `#D11F1F` | Manga red — CTAs, emphasis, highlight, error states. (CSS var is `--red`, **not** `--accent` — the legacy dark `/chat` theme already owns `--accent: #ff7a45`.) |
| `--red-deep` | `#A81818` | Red hover/pressed. |
| `--ghost` | `#E2DCCB` | Faint fills, oversized ghost numbers. |
| `--screentone` | `#CDC6B3` | Halftone dot color (texture only). |
| `--ok` | `#2E7D32` | Success messages only (rare; e.g. "magic link sent"). |

Borders are **always `--ink`** — there is no separate border color. Red is the *only* accent; use it sparingly and deliberately.

### Typography
Four faces. **Clash Display** and **General Sans** are self-hosted (Fontshare, free for commercial use — `.otf`/`.ttf`/`.woff2` files committed to the repo, loaded via `next/font/local`). **Space Mono** and **Bangers** load via `next/font/google`. Expose each as a CSS variable (`--font-clash`, `--font-general`, `--font-space-mono`, `--font-bangers`) so they work in CSS, Tailwind, and SVG `<text>`.

- **Clash Display** — **display**. Hero headlines, section titles, character names, nav logo. Wide, characterful grotesque — design-forward editorial-brutalist (not condensed). Loud headings should be **`font-bold` (700)** — the variable axis tops out at 700 and rendered light, so Clash is loaded from **discrete weight `.otf` files** (Regular/Medium/Semibold/Bold) for true heavy glyphs. Tight tracking (`-0.02em` to `-0.03em`); uppercase for loud moments.
- **General Sans** (400/500/700) — **body & UI**. Paragraphs, buttons, nav, descriptions. Clean and neutral-but-warm so it never competes with Clash.
- **Space Mono** (400/700) — **labels**. Eyebrows, tags, timestamps, numeric stats. Uppercase, `letter-spacing: ~0.15–0.2em`.
- **Bangers** — **shout/SFX only**. Onomatopoeia pops (`DON!! / POW!`) and burst-badge text (`NEW!! / LIVE`). Hand-drawn comic energy; never used for body or structural headings. This is the playful voice — keep it scoped to the loud comic moments.

**Type scale (fluid):**
| Role | Font | Size | Notes |
|---|---|---|---|
| Display XL (hero) | Clash Display 700 | `clamp(40px, 8vw, 72px)` | uppercase, lh ~1.0, tracking -0.02em |
| Display L (section) | Clash Display 600–700 | `clamp(26px, 4vw, 40px)` | uppercase |
| Card name / H3 | Clash Display 600 | 16–20px | |
| Body | General Sans 400/500 | 15–16px | lh 1.55 |
| Small / caption | General Sans | 12–13px | |
| Label / eyebrow | Space Mono | 11px | uppercase, tracked |
| SFX / burst badge | Bangers | large / contextual | comic shout only |

### Borders, shadows, radius
- **Borders:** `2.5px solid var(--ink)` on cards/buttons; `3px solid var(--ink)` on the page frame and major section dividers. Nothing is hairline.
- **Shadows (no blur, ever):** the brutalist hard offset.
  - `--shadow-sm`: `3px 3px 0 var(--ink)`
  - `--shadow`: `4px 4px 0 var(--ink)` (default raised state)
  - `--shadow-lift`: `6px 6px 0 var(--ink)` (hover)
  - `--shadow-red`: `4px 4px 0 var(--red)` (featured/emphasis only)
- **Radius:** `0` everywhere — no exceptions, including chat bubbles. The only organic/non-rectangular shape in the system is the **SVG impact burst** (below), and that's a spiky silhouette, not a rounded corner.

### Textures
- **Halftone screentone:** `background-image: radial-gradient(var(--screentone) 1.1px, transparent 1.2px); background-size: 7px 7px;` — for shaded panels.
- **Speed lines:** `repeating-conic-gradient(...)` burst behind energetic elements (e.g. the hero chat). Keep subtle (`opacity ~0.4–0.5`).

### Components
- **Buttons:** Primary = red bg, ink border, `--shadow`, white uppercase Space-Grotesk-700 text. Secondary = white bg, same border/shadow. Ghost = transparent, ink border, no shadow.
- **Interaction (consistent EVERYWHERE):** every raised interactive surface — buttons, character cards, tiles, and the future chat controls — uses the **same** hard-shadow lift. Hover → `translate(-2px,-2px)` + shadow grows (`4·4·0` → `6·6·0`). Pressed → `translate(+2px,+2px)` + shadow shrinks (→ `2·2·0`/`3·3·0`). Snappy transitions (`~120–150ms ease-out`). Don't invent per-component hover behaviours — if something feels off, it's a bug to fix, not a new variant.
  - **Red-shadow elements keep red through the whole interaction** (featured cards, the user bubble, `SEE ALL`): base `4·4·0 red` → hover `6·6·0 red` → press `2·2·0 red`. Never flip from red to ink on hover.
  - **Implementation gotcha:** set the base shadow with a **class / arbitrary prop** (`[box-shadow:var(--shadow)]`), **never** an inline `style={{boxShadow}}` — inline styles beat the `hover:`/`active:` classes on specificity, so the lift silently stops working. (This bit the rail cards once.)
  - **Horizontal scrollers** (e.g. the mobile sensei rail) clip the x-axis, so use a **vertical-only** lift there (`hover:-translate-y`, gate the x-translate behind `lg:`) — otherwise the edge card crops.
- **Cards / panels:** white bg, `2.5px` ink border, `--shadow`. Featured card uses `--shadow-accent`.
- **Speech bubble (signature element) — fully brutalist, sharp corners, side tails:**
  - **Character** = cream/white fill, `2.5px` ink border, `--shadow` (ink), tail on the **left** edge pointing left toward the avatar. Built with the double-triangle trick (outer ink triangle + inner fill triangle) so the tail is outlined too. In-voice text; `*actions*` rendered in **italic red**.
  - **User** = solid **ink** fill, cream text, `--shadow-accent` (**red**), tail on the **right** edge pointing right (single ink triangle, since fill = border = ink). The user is the loud black-and-red one driving the conversation.
  - Avatar chips on each side reuse the box treatment (ink border + matching ink/red shadow) so each side reads as a set.
  - This is the canonical chat element and the later `/chat` restyle will reuse it.
- **Impact burst (SVG comic-explosion balloon):** a spiky silhouette built from two stacked layers — a solid-`--ink` polygon offset by `4–5px` (the hard shadow) under a fill polygon with a `2.5–3px` ink `stroke` + `stroke-linejoin: round`. Build our own — **never use stock burst images.** One reusable component; the fill color carries the meaning (see policy). Burst text is set in **Bangers** — rendered as an overlaid HTML layer or SVG `<text>` via `font-family: var(--font-bangers)`. Each instance gets a slight rotation (±5–9°) so they feel hand-inked.
- **Burst usage — the rule is `red = attention, cream = atmosphere`:**
  - **Corner badges (functional):** pinned to the corner of a card, overlapping it. **Red fill** for genuine attention — `NEW!!` on a freshly-added world. **Cream/white fill** for lower-key status — `LIVE`, `SOON`.
  - **Ambient bursts (decorative):** scattered sparsely behind/around content purely for manga texture. **Cream/ink-outline only — never red.** Low opacity, often no text.
  - **No section-header bursts.** Bursts are accents and atmosphere, not headers. This keeps red meaningful (it's still the single accent) and stops the ambient ones competing with real alerts.
  - **Pulse:** badges and ambient bursts gently throb (`scale 1 → ~1.06–1.10`, slow `ease-in-out`, staggered durations) for that comic "pop." Always gate behind `@media (prefers-reduced-motion: reduce)`.
- **Section header (always):** Clash Display title + thick ink rule (`height: 4px; background: var(--ink)`) + a Space-Mono tag/count on the right. All sections use this calm style — the energy comes from the content (bursts, the chat demo, the cast), not shouting headers.
- **Tags/badges:** Space Mono, uppercase, ink bg + cream text (or red bg + white). Badge bursts are the louder alternative.
- **Onomatopoeia / SFX:** Bangers, oversized, slight rotation (`rotate(-2deg to -5deg)`), red — used as accents, not chrome.

### Interaction onomatopoeia (signature delight)
Manga sound-effect words (`DON!!`, `BAM!`, `WHOOSH!`) that **pop on click** — never static. SFX needs an action behind it, so it's tied to interaction, not used as standing decoration (standing decoration = the cream ambient *bursts* instead).
- **Scope: a curated action set only** — primary CTA, character/world select, send-message. Mundane clicks (nav, close, back) stay silent so the SFX keeps its impact.
- **Themed word pools by action:** go/CTA → `LET'S GO! / GO!! / ZOOM!`; send → `WHOOSH! / ZIP! / SWISH!`; impact/select → `DON!! / DODON!! / BAM! / POW! / BOOM!`.
- **Look:** Bangers, large, spawned at the click point. `-webkit-text-stroke: 2px` + hard `text-shadow` for the manga outline. Randomly alternate red-fill/ink-outline ↔ ink-fill/red-outline. Random tilt (±11°). Pop-and-fade ~680ms (`scale 0.3→1.15→1.3`, drift up, fade), then remove from DOM.
- **One reusable helper** `popSfx(pool, x, y)` — shared by landing now and the chat restyle later.
- **a11y:** `aria-hidden`, decorative only — never the sole feedback for an action. Under `prefers-reduced-motion: reduce`, degrade to a brief static fade (no movement/scale).

### Motion & a11y
- Brutalist = snappy and physical (the hard-shadow lift). Avoid soft/long fades.
- Always honor `prefers-reduced-motion: reduce` (disable parallax, lifts, burst pulse, SFX movement, auto-cycling).
- Maintain ink-on-paper contrast (it's already very high). Icon-only buttons need `aria-label`; decorative SFX/textures/bursts need `aria-hidden`.

### Mobile rule (the hard-won lesson)
Design the **narrow** layout first, then let grids widen. Every section must be a flex/grid that **stacks or wraps** — **no absolute percentage positioning** (that was the old landing page's mobile-breaking sin). One component, one layout, scaled.

---

## 4. Current focus: landing page redesign

**Decision:** Rebuild the landing page from scratch in the neo-brutalist manga style above. The old landing (greyscale collage hero, draggable "universe map" constellation, bento feature grid) is being **replaced** — it broke on mobile, the collage read as muddy, the map degraded to a generic list, and the bento "told" instead of "showed." Only the hero *copy* survives.

**New structure ("conversation-first"), top to bottom:**
1. **Hero** — eyebrow + Clash Display headline ("Think like your heroes / Complex ideas, their way") + sub + two CTAs (Pick your sensei / See the cast). On the right (desktop) / below (mobile): a **live, auto-typing chat demo** in a speech bubble — scripted/looping, *no* API calls, cycles through characters. Doubles as a preview of the streaming chat to come.
2. **Pick your sensei** — responsive character rail/grid of bordered "panels" (face/portrait + Clash Display name + universe + trait). Desktop grid → mobile horizontal swipe. Each card deep-links to `/chat?universe=…&character=…` (route already supported). Featured-character-of-the-day folds in here (the daily pick is who's talking in the hero demo).
3. **How it works** — three shared-border manga panels with ghost numbers: 01 Pick a world · 02 Pick a hero · 03 Start talking.
4. **Footer** — inverted (ink bg, cream text), minimal.

**Scope now:** Landing only. The dark `/chat` app stays as-is for this pass; the paper landing hands off into it. Restyling chat into this language is a deliberate **later** phase (needs extra thought, esp. the dark↔paper relationship and the streaming rebuild).

**Assets:** Character portraits are being sourced ("can get some"). Until then, emoji placeholders fill the portrait slots; design must look good either way.

### Fonts — already in the repo
Font files live in `app/fonts/`. **Clash Display** loads from discrete weight files (`ClashDisplay-Regular/Medium/Semibold/Bold.otf`) via `next/font/local` — true Bold, not the variable axis (which rendered light). **General Sans** loads from `GeneralSans-Variable.ttf` + `-VariableItalic.ttf`. **Space Mono** + **Bangers** via `next/font/google`.

**Var naming (important):** the raw next/font CSS vars are **`--ff-clash`, `--ff-general`, `--ff-space-mono`, `--ff-bangers`**. The Tailwind theme tokens in `globals.css` map to them and generate utilities **`font-clash`, `font-body`, `font-label`, `font-sfx`** — note the display utility is **`font-clash`, NOT `font-display`** (a legacy `.font-display` class maps to Bricolage for the old pages; using it silently overrides Clash). SVG/inline `font-family` must reference the raw `var(--ff-bangers)` etc., not `var(--font-*)`.

### Build plan & status (landing page)
- [x] **1. Foundation** — ✅ DONE. 4 fonts wired in `app/layout.tsx` (Clash/General via `next/font/local`, Space Mono/Bangers via google). Tokens added to `globals.css` `:root` (`--paper`, `--ink`, `--red`, shadows, etc.) + registered in `@theme inline` so Tailwind utilities exist: **`bg-paper bg-paper-raised bg-ink bg-red text-ink text-ink-soft text-ink-muted text-red border-ink font-display font-body font-label font-sfx`**. Helper classes available: **`.paper-canvas`** (the landing wrapper — sets paper bg/ink/General Sans, neutralises the global dark body chrome via `body:has(.paper-canvas)`), **`.halftone`**, **`.burst-pulse-a` / `.burst-pulse-b`** (reduced-motion-gated). `tsc --noEmit` passes; `/chat` untouched. Shadows are raw CSS vars (`var(--shadow)`, `var(--shadow-red)`, etc.) — use inline `style` or arbitrary props like `shadow-[var(--shadow)]`.
- [x] **2. Reusable pieces** — ✅ DONE, in `app/components/brutal/`:
  - `sfx.ts` — `popSfx(pool, x, y)` + `popSfxAt(pool, event)`; pools `"go" | "send" | "impact"`. Appends a fixed-position Bangers word at the click point, WAAPI pop-and-fade, reduced-motion fallback, auto-removes.
  - `Burst.tsx` — `<Burst text? tone="red|cream|ghost" size rotate pulse="a|b" opacity ariaLabel />`. Two-layer SVG (ink shadow + filled/stroked face). red=attention, cream/ghost=atmosphere.
  - `Button.tsx` (client) — `<Button variant="primary|secondary|ink|ghost" size="md|lg" sfx? href? onClick? />`. Renders `<Link>` when `href` is set, else `<button>`; hard-shadow lift/press; optional SFX pop on click.
  - `Bubble.tsx` — `<Bubble side="left|right" />`. left=character (cream/ink-shadow/left tail), right=user (ink fill/red-shadow/right tail), sharp corners.
  - All pass `tsc` + ESLint. Not yet mounted anywhere (Step 3 assembles them).
- [x] **3. Hero** — ✅ DONE. `app/components/landing/Hero.tsx` (scripted looping typing demo, 4 characters, reduced-motion safe), `PaperLanding.tsx` (nav + hero orchestrator), mounted at **`/preview`** (`app/preview/page.tsx`) for review — `/` still serves the old landing until Step 6. Dev server config in `.claude/launch.json` (`dev`, port 3000). Verified desktop + mobile (375px) reflow cleanly, no horizontal overflow. `tsc`/ESLint pass. Review polish applied: headline → `font-bold` (Clash is variable, defaulted to 400), halftone softened (lighter/finer dots — `--ghost`, 8px) + body `font-medium` for readability over texture, demo hold extended to 5.2s, `LIVE` burst enlarged to 96px.
- [x] **4. Pick-your-sensei rail** — ✅ DONE. `app/components/landing/SenseiRail.tsx`: calm header (Clash title + ink rule + Space-Mono "06 worlds"), one component that's a horizontal swipe on mobile → `lg:grid-cols-4` on desktop (no separate layouts). `CharacterCard` deep-links to `/chat?universe=…&character=…`; emoji portrait slots. Featured card (Naruto) = red shadow + `TODAY` burst; Gojo = `NEW!!` red burst; ink `SEE ALL` tile (red shadow) → `/chat`. Two cream ambient bursts at the edges. Verified desktop grid + mobile swipe (no h-overflow). Mobile-rail polish applied: vertical pad so corner badges/lift don't crop; gutter kept outside the scroll container so the first card aligns with the title (scroll-snap was eating start padding); vertical-only lift on the rail (x-translate gated to `lg:`) so the edge card doesn't crop on hover; card shadows moved off inline `style` so the hover lift actually fires (see §3 Interaction). **Cast is currently static** (`CAST` array) — wiring it to Supabase `universes`/`characters` is a deferred follow-up (kept static so the page always renders without a live DB call).
- [x] **5. How-it-works** + **footer** — ✅ DONE. `HowItWorks.tsx`: calm header + a shared-border manga panel strip (one hard shadow) with oversized ghost numbers; panels 01/02 on paper, panel 03 is the red accent and is itself a `Link` to `/chat` (hover darkens to `--red-deep`, arrow nudges) — flush in the strip, so no box-lift. `Footer.tsx`: inverted (ink bg, cream text), Clash wordmark + red dot, tagline, EXPLORE/ACCOUNT link columns (hover→red), bottom rule with copyright + "powered by…". Both verified desktop + mobile (strip stacks vertically with `border-b` dividers; no h-overflow). `tsc`/ESLint pass.
- [ ] **6. Wire-up** — ⏸️ **ON HOLD (deliberate).** The new landing is complete and lives at **`/preview`**; `/` still serves the **old** `LandingPage`. Holding the swap because the live project may be under review by a company the user applied to — keep the old landing in place and the new one parked at `/preview` until the user says go. When greenlit: point `app/page.tsx` at `PaperLanding`, verify reflow, then retire the old `LandingPage.tsx` / `HeroCollage.tsx` / `HeroMotion.tsx` / `UniverseMap.tsx` and remove the `/preview` route. Do NOT delete the old files before then.

**Integration note (important):** `globals.css` currently sets a **dark** theme — `:root` has `--background:#000`, and `body` is dark with `--font-poppins`. That's used by the old landing **and the `/chat` app we're keeping**. The new paper landing must not invert `/chat`. Plan: introduce the brutalist tokens under their own names (`--paper`, `--ink`, etc.) and scope the paper canvas to the landing (e.g. a wrapper class / route-level style) rather than flipping global `body`. Confirm `/chat` still renders dark after foundation work.

---

## 5. Known issues & roadmap (not yet started)

Beyond the landing redesign, these are the standing improvement areas (deferred, but documented so they're not lost):

- **Streaming polish** — basic `/api/chat` streaming is implemented via SSE and OpenRouter `stream: true`; follow-ups: cancellation/abort, better partial markdown behavior, and sidebar refresh after streamed replies.
- **Security / RLS audit** — the immediate `/api/chat` service-role ownership bug is fixed (auth required; `conversationId` must belong to the auth user before history reads or AI writes). Still verify Supabase RLS policies for direct client writes/reads on `users`, `conversations`, and `messages`. Treat as important production hardening.
- **Sidebar N+1 queries** — `chat-sidebar.tsx` fires a separate character query *and* pulls every message per conversation (40+ sequential round-trips for 20 convos). Collapse into one join/RPC.
- **Persona-aware empty state** — `chat-empty-state.tsx` shows generic prompts ("explain quantum computing") and ignores `characterName`. Should reflect the selected character.
- **Identity cleanup** — rename `"helix"` (package.json, OpenRouter `X-Title`); rename the `v0/` chat folder; rename junk image files in `HeroCollage` (`io;.jpg`, etc.) if that component survives.
- **Auth de-duplication** — login/signup share ~80% of their logic; extract a shared hook/component.
- **Misc** — hand-rolled regex markdown via `dangerouslySetInnerHTML` (consider a real renderer); auto-generated conversation titles; no tests/CI.

---

## 6. Working agreements
- **Pause for the user's review after each build step** (the §4 checklist items) — do not roll straight into the next step. Present what changed + how to verify, then wait for go-ahead.
- Keep this file updated when product direction, the design system, or architecture decisions change.
- New UI follows §3 strictly. If a need arises that the system doesn't cover, extend the system here first, then build.
- Mobile-first, always (see §3 mobile rule).
- Don't reintroduce gradients/glow/blur into the brutalist surfaces — emphasis comes from the red shadow and scale, not lighting effects.
