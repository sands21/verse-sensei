import Link from "next/link";

// Inverted footer — ink canvas, cream text. Minimal. See CLAUDE.md §4.

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-label block text-[12px] uppercase tracking-[0.12em] text-paper/70 transition-colors hover:text-red"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-clash text-3xl font-bold uppercase md:text-4xl">
              Verse Sensei<span className="text-red">.</span>
            </div>
            <p className="font-body mt-3 max-w-xs text-sm leading-relaxed text-paper/60">
              Chat with the characters who inspire you — and learn the way your
              heroes would explain the world.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <nav className="flex flex-col gap-3">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-paper/40">
                Explore
              </span>
              <FootLink href="/chat">Pick a sensei</FootLink>
              <FootLink href="#sensei">The cast</FootLink>
            </nav>
            <nav className="flex flex-col gap-3">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-paper/40">
                Account
              </span>
              <FootLink href="/login">Log in</FootLink>
              <FootLink href="/signup">Sign up</FootLink>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/20 pt-6 md:flex-row md:items-center md:justify-between">
          <span className="font-label text-[11px] uppercase tracking-[0.15em] text-paper/40">
            © 2026 Verse Sensei · more worlds incoming
          </span>
          <span className="font-body text-xs text-paper/40">
            Powered by ninjas, pirates, titans &amp; curses.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
