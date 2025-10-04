"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./Toast";
import ChatBubble from "./ChatBubble";
import FeedbackBar from "./FeedbackBar";
import ChatInput from "./ChatInput";
import supabase from "@/lib/supabaseClient";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp?: string;
};

type Props = { conversationId?: string; characterId?: string };

export default function ChatPanel({ conversationId, characterId }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [convId, setConvId] = useState<string | undefined>(conversationId);
  const [aiTyping, setAiTyping] = useState(false);

  useEffect(() => {
    setConvId(conversationId);
  }, [conversationId]);

  const appendUser = async (text: string) => {
    const tempId = crypto.randomUUID();
    const optimistic: Message = { id: tempId, sender: "user", text };
    setMessages((m) => [...m, optimistic]);

    // Ensure we have a conversation; if logged-in and none exists, create it
    let activeConversationId = convId;
    if (!activeConversationId) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        const { data: convRow, error: convErr } = await supabase
          .from("conversations")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        if (!convErr && convRow?.id) {
          activeConversationId = convRow.id as string;
          setConvId(activeConversationId);
          try {
            router.replace(`?conversation=${activeConversationId}`);
          } catch {}
        }
      }
    }

    if (activeConversationId) {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          sender: "user",
          content: text,
        })
        .select("id, timestamp")
        .single();

      if (error) {
        setError(error.message);
      } else if (data?.id) {
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
    }

    // Fetch AI reply from API and display it
    try {
      setAiTyping(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          text,
          conversationId: activeConversationId,
          characterId,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const aiText = (json && json.reply) || "";
        const aiMessageId: string | undefined = json?.aiMessageId ?? undefined;
        if (aiText) {
          setMessages((m) => [
            ...m,
            {
              id: aiMessageId || crypto.randomUUID(),
              sender: "ai",
              text: aiText,
            },
          ]);
        }
      }
    } catch {
      showToast("Failed to get AI reply. Please try again.");
    } finally {
      setAiTyping(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setError("");
      if (!convId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender, content, timestamp")
        .eq("conversation_id", convId)
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
  }, [convId]);

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
            <div key={m.id}>
              <ChatBubble
                sender={m.sender}
                text={m.text}
                avatarLabel={m.sender === "ai" ? "AI" : "U"}
              />
              {m.sender === "ai" && (
                <FeedbackBar
                  messageId={m.id}
                  onRate={async (rating) => {
                    const { data: userData } = await supabase.auth.getUser();
                    const user = userData.user;
                    if (!user || !m.id) return;
                    await supabase
                      .from("feedback")
                      .insert({ message_id: m.id, user_id: user.id, rating });
                  }}
                />
              )}
            </div>
          ))}
      </div>
      {aiTyping && <p className="text-white/60 text-sm">AI is typing…</p>}
      <ChatInput onSend={appendUser} />
    </div>
  );
}
