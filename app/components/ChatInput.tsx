"use client";

import { useState } from "react";

type Props = {
  onSend?: (text: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      if (onSend) onSend(trimmed);
      else console.log("send:", trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full flex gap-2">
      <input
        className="flex-1 h-11 rounded-md bg-[#23272F] text-white border border-white/15 px-3 outline-none focus:ring-2 focus:ring-white/20"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={sending}
      />
      <button
        type="submit"
        className="h-11 px-4 rounded-md bg-white/10 text-white hover:bg:white/15 disabled:opacity-60"
        disabled={sending || !text.trim()}
      >
        Send
      </button>
    </form>
  );
}
