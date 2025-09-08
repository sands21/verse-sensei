"use client";

import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import supabase from "@/lib/supabaseClient";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp?: string;
};

type Props = { conversationId?: string };

export default function ChatPanel({ conversationId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const appendUser = async (text: string) => {
    const tempId = crypto.randomUUID();
    const optimistic: Message = { id: tempId, sender: "user", text };
    setMessages((m) => [...m, optimistic]);

    if (!conversationId) return; // no persistence without a conversation

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender: "user",
        content: text,
      })
      .select("id, timestamp")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (data?.id) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: data.id as string,
                timestamp: data.timestamp as string,
              }
            : msg
        )
      );
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setError("");
      if (!conversationId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender, content, timestamp")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true });
      if (!isMounted) return;
      if (error) {
        setError(error.message);
      } else {
        setMessages(
          (data ?? []).map((r) => ({
            id: r.id,
            sender: r.sender as "user" | "ai",
            text: r.content as string,
            timestamp: r.timestamp as string,
          }))
        );
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="min-h-[200px] rounded-lg border border-white/10 bg-[#23272F] p-3 flex flex-col gap-2">
        {loading && (
          <p className="text-white/60 text-sm">Loading messages...</p>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && messages.length === 0 && (
          <p className="text-white/60 text-sm">No messages yet.</p>
        )}
        {!loading &&
          !error &&
          messages.map((m) => (
            <ChatBubble key={m.id} sender={m.sender} text={m.text} />
          ))}
      </div>
      <ChatInput onSend={appendUser} />
    </div>
  );
}
