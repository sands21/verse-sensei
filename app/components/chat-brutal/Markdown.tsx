import * as React from "react";

// Brutalist markdown renderer for chat replies (preview). React nodes, not
// dangerouslySetInnerHTML. The product convention: single *…* = in-voice action
// → italic red; **…** = bold. Plus `code`, code blocks, lists, blockquote, links.
// See CLAUDE.md §5 (Message thread · markdown convention).

// Inline tokens: `code`, **bold**, *action*, [text](url). Non-nested (enough for
// the controlled canned content; real-renderer swap is a separate task).
const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string, kp: string): React.ReactNode[] {
  return text.split(INLINE_RE).map((part, i) => {
    const key = `${kp}-${i}`;
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded-none border-[1.5px] border-ink bg-ghost px-1 font-label text-[0.85em] text-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={key} className="font-medium italic text-red">
          {part.slice(1, -1)}
        </em>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a
          key={key}
          href={link[2]}
          className="text-red underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (``` fenced)
    if (line.trimStart().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-none border-[2.5px] border-ink bg-ghost p-3 [box-shadow:var(--shadow-sm)]"
        >
          <code className="font-label text-[12px] leading-relaxed text-ink">
            {buf.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Unordered list
    if (/^\s*-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, ""));
        i++;
      }
      const k = key++;
      blocks.push(
        <ul key={k} className="my-1.5 list-disc space-y-0.5 pl-5 marker:text-ink">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ul${k}-${j}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      const k = key++;
      blocks.push(
        <ol
          key={k}
          className="my-1.5 list-decimal space-y-0.5 pl-5 marker:font-label marker:text-ink"
        >
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `ol${k}-${j}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquote (thick red left bar)
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      const k = key++;
      blocks.push(
        <blockquote
          key={k}
          className="my-2 border-l-[4px] border-red pl-3 text-ink-soft"
        >
          {buf.map((b, j) => (
            <div key={j}>{renderInline(b, `bq${k}-${j}`)}</div>
          ))}
        </blockquote>
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (gather consecutive plain lines)
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*(-\s+|\d+\.\s+|>\s?|```)/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    const k = key++;
    blocks.push(
      <p key={k}>
        {buf.map((b, j) => (
          <React.Fragment key={j}>
            {j > 0 && <br />}
            {renderInline(b, `p${k}-${j}`)}
          </React.Fragment>
        ))}
      </p>
    );
  }

  return (
    <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{blocks}</div>
  );
}

export default Markdown;
