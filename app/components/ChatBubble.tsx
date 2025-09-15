"use client";

import React from "react";

type Props = {
  sender: "user" | "ai";
  text: string;
  avatarLabel?: string;
};

function renderMarkdown(text: string) {
  const elements: React.ReactNode[] = [];
  const parts = text.split(/```/g);

  const applyRegex = (
    nodes: React.ReactNode[],
    regex: RegExp,
    wrap: (match: string, key: string) => React.ReactNode
  ) => {
    const out: React.ReactNode[] = [];
    nodes.forEach((node, i) => {
      if (typeof node !== "string") {
        out.push(node);
        return;
      }
      let last = 0;
      let m: RegExpExecArray | null;
      regex.lastIndex = 0;
      while ((m = regex.exec(node)) !== null) {
        if (m.index > last) out.push(node.slice(last, m.index));
        out.push(wrap(m[1] ?? m[0], `w-${i}-${out.length}`));
        last = m.index + m[0].length;
      }
      if (last < node.length) out.push(node.slice(last));
    });
    return out;
  };

  parts.forEach((part, idx) => {
    if (idx % 2 === 1) {
      elements.push(
        <pre
          key={`code-${idx}`}
          className="mt-1 whitespace-pre-wrap text-xs bg-black/30 border border-white/10 rounded p-2 overflow-x-auto"
        >
          <code>{part}</code>
        </pre>
      );
    } else {
      let nodes: React.ReactNode[] = [part];
      // Inline code
      nodes = applyRegex(nodes, /`([^`]+)`/g, (m, key) => (
        <code key={key} className="bg-black/30 px-1 rounded text-[0.85em]">
          {m}
        </code>
      ));
      // Links
      nodes = applyRegex(nodes, /(https?:\/\/[^\s]+)/g, (url, key) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {url}
        </a>
      ));
      // Bold/italics
      nodes = applyRegex(nodes, /\*\*([^*]+)\*\*/g, (m, key) => (
        <strong key={key}>{m}</strong>
      ));
      nodes = applyRegex(nodes, /\*([^*]+)\*/g, (m, key) => (
        <em key={key}>{m}</em>
      ));

      // Split by lines and make paragraphs/lists
      const flat = nodes.flatMap((n) =>
        typeof n === "string" ? n.split(/\n/g) : [n]
      );
      const block: React.ReactNode[] = [];
      let list: React.ReactNode[] = [];
      flat.forEach((ln, i) => {
        if (typeof ln === "string" && /^\s*[-*]\s+/.test(ln)) {
          list.push(
            <li key={`li-${idx}-${i}`}>{ln.replace(/^\s*[-*]\s+/, "")}</li>
          );
        } else {
          if (list.length) {
            block.push(
              <ul key={`ul-${idx}-${i}`} className="list-disc pl-5 my-1">
                {list}
              </ul>
            );
            list = [];
          }
          if (ln !== "")
            block.push(
              <p key={`p-${idx}-${i}`} className="my-1">
                {ln}
              </p>
            );
        }
      });
      if (list.length) {
        block.push(
          <ul key={`ul-${idx}-end`} className="list-disc pl-5 my-1">
            {list}
          </ul>
        );
      }
      elements.push(<div key={`text-${idx}`}>{block}</div>);
    }
  });
  return <>{elements}</>;
}

export default function ChatBubble({ sender, text, avatarLabel }: Props) {
  const isUser = sender === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-2 mt-1 h-7 w-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs select-none">
          {avatarLabel?.[0]?.toUpperCase() || "A"}
        </div>
      )}
      <div
        className={`rounded-lg px-3 py-2 max-w-[80%] text-sm leading-relaxed transition-transform duration-200 will-change-transform hover:scale-[1.02] ${
          isUser
            ? "bg-white/10 text-white border border-white/10"
            : "bg-black/20 text-white border border-white/10"
        }`}
      >
        {renderMarkdown(text)}
      </div>
      {isUser && (
        <div className="ml-2 mt-1 h-7 w-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs select-none">
          U
        </div>
      )}
    </div>
  );
}
