import { Button } from "../brutal/Button";
import { Hero } from "./Hero";
import { SenseiRail } from "./SenseiRail";

// New neo-brutalist landing (paper canvas). Assembled section by section.
// Mounted at /preview during the build; swaps into / at Step 6. See CLAUDE.md §4.

function Nav() {
  return (
    <header className="border-b-[3px] border-ink bg-paper-raised">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <span className="font-clash text-lg font-bold uppercase text-ink md:text-xl">
          Verse Sensei<span className="text-red">.</span>
        </span>
        <Button variant="secondary" size="md" href="/login">
          Log in
        </Button>
      </div>
    </header>
  );
}

export default function PaperLanding() {
  return (
    <div className="paper-canvas">
      <Nav />
      <Hero />
      <SenseiRail />
    </div>
  );
}
